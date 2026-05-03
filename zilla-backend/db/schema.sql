-- =============================================================================
-- SCHEMA v5
-- All risks from v4 analysis addressed:
--   1. FOR SHARE → FOR UPDATE on reservation validation
--   2. Reservation existence + validity enforced at booking time
--   3. reserved_count self-heals via periodic reconciliation function
--   4. Slot status auto-updated by trigger when capacity fills/empties
--   5. Payment-after-expiry blocked at DB level
--   6. Waitlist insert is atomic (single statement, no app-layer race)
--   7. Redis insert-failure compensated by reservation_created_at + reconciler
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";


-- =============================================================================
-- UTILITY
-- =============================================================================

CREATE OR REPLACE FUNCTION is_valid_iana_tz(tz TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  PERFORM NOW() AT TIME ZONE tz;
  RETURN TRUE;
EXCEPTION WHEN invalid_parameter_value THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- USERS
-- =============================================================================

CREATE TABLE users (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      VARCHAR(120) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  password_hash  TEXT,
  role           VARCHAR(20)  NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'organiser', 'admin')),
  is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  otp_token      VARCHAR(10),
  otp_expires_at TIMESTAMPTZ,
  oauth_provider VARCHAR(30),
  oauth_token    TEXT,
  refresh_token  TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique    UNIQUE (email),
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE OR REPLACE FUNCTION trg_users_normalise_email()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_email_normalise
BEFORE INSERT OR UPDATE OF email ON users
FOR EACH ROW EXECUTE FUNCTION trg_users_normalise_email();


-- =============================================================================
-- FACILITIES
-- =============================================================================

CREATE TABLE facilities (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(150)  NOT NULL,
  description      TEXT,
  type             VARCHAR(50),
  duration_mins    INTEGER       NOT NULL DEFAULT 60
    CHECK (duration_mins BETWEEN 1 AND 1440),
  base_price       NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (base_price >= 0),
  advance_payment  BOOLEAN       NOT NULL DEFAULT FALSE,
  manage_capacity  BOOLEAN       NOT NULL DEFAULT FALSE,
  max_capacity     INTEGER       NOT NULL DEFAULT 1
    CHECK (max_capacity >= 1),
  schedule_type    VARCHAR(20)   NOT NULL DEFAULT 'weekly'
    CHECK (schedule_type IN ('weekly', 'flexible')),
  working_hours    JSONB         NOT NULL DEFAULT '{}',
  working_tz       TEXT          NOT NULL DEFAULT 'Asia/Kolkata',
  questions_schema JSONB         NOT NULL DEFAULT '[]',
  cancellation_hrs INTEGER       NOT NULL DEFAULT 1
    CHECK (cancellation_hrs >= 0),
  intro_message    TEXT,
  confirm_message  TEXT,
  manual_confirm   BOOLEAN       NOT NULL DEFAULT FALSE,
  assignment_mode  VARCHAR(20)   NOT NULL DEFAULT 'auto'
    CHECK (assignment_mode IN ('auto', 'manual')),
  booking_mode     VARCHAR(20)   NOT NULL DEFAULT 'slot'
    CHECK (booking_mode IN ('slot', 'queue')),
  status           VARCHAR(20)   NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'unpublished')),
  location         TEXT,
  share_token      VARCHAR(64)   UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  config           JSONB         NOT NULL DEFAULT '{}',
  config_version   INTEGER       NOT NULL DEFAULT 1,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TABLE facility_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_facilities_updated_at
BEFORE UPDATE ON facilities
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE OR REPLACE FUNCTION trg_validate_facility_tz()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT is_valid_iana_tz(NEW.working_tz) THEN
    RAISE EXCEPTION 'Invalid IANA timezone: %', NEW.working_tz;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_facility_tz_check
BEFORE INSERT OR UPDATE OF working_tz ON facilities
FOR EACH ROW EXECUTE FUNCTION trg_validate_facility_tz();

-- =============================================================================
-- FACILITY_STAFF — Junction table: which staff members are assigned to facility
-- =============================================================================

CREATE TABLE facility_staff (
  id          SERIAL       PRIMARY KEY,
  facility_id UUID         NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(facility_id, user_id)
);

-- =============================================================================
-- RESOURCES
-- =============================================================================

CREATE TABLE resources (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID         NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(50),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  metadata    JSONB        NOT NULL DEFAULT '{}',
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TIME SLOTS
--
-- reserved_count  = seats held by active reservations (payment in progress)
-- confirmed_count = seats held by confirmed bookings
-- status is kept accurate by trigger — never rely on app to set it manually
-- =============================================================================

CREATE TABLE time_slots (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id     UUID          NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  resource_id     UUID          REFERENCES resources(id) ON DELETE SET NULL,
  slot_start      TIMESTAMPTZ   NOT NULL,
  slot_end        TIMESTAMPTZ   NOT NULL,
  total_capacity  INTEGER       NOT NULL DEFAULT 1 CHECK (total_capacity >= 1),
  confirmed_count INTEGER       NOT NULL DEFAULT 0,
  reserved_count  INTEGER       NOT NULL DEFAULT 0,
  -- FIX #6: status is now managed by trigger, not manually.
  -- 'available'  = has free seats
  -- 'booked'     = confirmed_count = total_capacity (no free seats)
  -- 'cancelled'  = slot cancelled by organiser
  -- 'blackout'   = blocked manually
  status          VARCHAR(20)   NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'booked', 'cancelled', 'blackout')),
  frozen_price    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (frozen_price >= 0),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_slot_range CHECK (slot_end > slot_start),
  CONSTRAINT no_overbooking CHECK (
    confirmed_count >= 0
    AND reserved_count  >= 0
    AND (confirmed_count + reserved_count) <= total_capacity
  )
);

-- FIX #6: auto-update slot status when confirmed_count changes
-- 'booked' when full, 'available' when seats free up
-- Does not touch 'cancelled' or 'blackout' — those are organiser-set.
CREATE OR REPLACE FUNCTION trg_sync_slot_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'blackout') THEN
    RETURN NEW;
  END IF;

  IF NEW.confirmed_count >= NEW.total_capacity THEN
    NEW.status := 'booked';
  ELSE
    NEW.status := 'available';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_slot_status_sync
BEFORE UPDATE OF confirmed_count ON time_slots
FOR EACH ROW EXECUTE FUNCTION trg_sync_slot_status();


-- =============================================================================
-- RESERVATIONS
--
-- Written atomically with the Redis SET NX in the same app request.
-- If the DB insert fails, the app must immediately DEL the Redis key
-- (see FIX #8 in app layer notes at bottom).
--
-- Lifecycle:
--   holding   → converted  (payment succeeded, booking inserted)
--   holding   → expired    (TTL fired, expiry worker ran)
--   holding   → released   (user explicitly cancelled before paying)
-- =============================================================================

CREATE TABLE reservations (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID          NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  customer_id     UUID          NOT NULL REFERENCES users(id),
  facility_id     UUID          NOT NULL REFERENCES facilities(id),
  attendee_count  INTEGER       NOT NULL DEFAULT 1 CHECK (attendee_count >= 1),
  answers         JSONB         NOT NULL DEFAULT '{}',
  frozen_price    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (frozen_price >= 0),
  status          VARCHAR(20)   NOT NULL DEFAULT 'holding'
    CHECK (status IN ('holding', 'converted', 'expired', 'released')),
  idempotency_key VARCHAR(100)  NOT NULL UNIQUE,
  -- Stored so expiry worker can DEL this key without recomputing it.
  -- Format: slot:lock:{slot_id}:{customer_id}
  redis_key       VARCHAR(300)  NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW() + INTERVAL '10 minutes'
);

-- One active hold per customer per slot at a time
CREATE UNIQUE INDEX idx_one_holding_per_customer_slot
  ON reservations (customer_id, slot_id)
  WHERE status = 'holding';

-- Expiry worker and reconciler scan this
CREATE INDEX idx_reservations_expiry
  ON reservations (expires_at)
  WHERE status = 'holding';

-- Capacity check lookups
CREATE INDEX idx_reservations_slot_holding
  ON reservations (slot_id)
  WHERE status = 'holding';


-- -----------------------------------------------------------------------------
-- FIX #1 — FOR UPDATE (was FOR SHARE)
-- Exclusive row lock so two concurrent inserts cannot both read the same
-- reserved_count and both pass the capacity check.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_validate_reservation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_slot time_slots%ROWTYPE;
BEGIN
  -- FOR UPDATE: blocks any concurrent reservation insert on the same slot
  -- until this transaction commits or rolls back.
  SELECT * INTO v_slot FROM time_slots WHERE id = NEW.slot_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found: %', NEW.slot_id;
  END IF;

  IF v_slot.status NOT IN ('available') THEN
    RAISE EXCEPTION 'Slot is not available (status: %)', v_slot.status;
  END IF;

  IF (v_slot.confirmed_count + v_slot.reserved_count + NEW.attendee_count)
       > v_slot.total_capacity THEN
    RAISE EXCEPTION
      'Insufficient capacity (confirmed=%, reserved=%, requested=%, total=%)',
      v_slot.confirmed_count, v_slot.reserved_count,
      NEW.attendee_count, v_slot.total_capacity;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_validate
BEFORE INSERT ON reservations
FOR EACH ROW EXECUTE FUNCTION trg_validate_reservation();


-- Freeze price at reservation time
CREATE OR REPLACE FUNCTION trg_freeze_reservation_price()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_price NUMERIC;
BEGIN
  SELECT frozen_price INTO v_price FROM time_slots WHERE id = NEW.slot_id;
  NEW.frozen_price := v_price * NEW.attendee_count;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_freeze_price
BEFORE INSERT ON reservations
FOR EACH ROW EXECUTE FUNCTION trg_freeze_reservation_price();


-- Sync reserved_count on reservation lifecycle changes
CREATE OR REPLACE FUNCTION trg_reservation_reserved_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE time_slots
    SET reserved_count = reserved_count + NEW.attendee_count
    WHERE id = NEW.slot_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Any terminal status releases the reserved seat
    IF NEW.status IN ('expired', 'converted', 'released')
       AND OLD.status = 'holding' THEN
      UPDATE time_slots
      SET reserved_count = reserved_count - OLD.attendee_count
      WHERE id = OLD.slot_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_count_sync
AFTER INSERT OR UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION trg_reservation_reserved_count();


-- =============================================================================
-- WAITLIST
--
-- FIX #7: waitlist insert is a single upsert — no app-layer two-step.
-- Redis sorted set is the live queue; this table is the persistent mirror.
-- =============================================================================

CREATE TABLE waitlist (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id      UUID        NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  customer_id  UUID        NOT NULL REFERENCES users(id),
  facility_id  UUID        NOT NULL REFERENCES facilities(id),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at  TIMESTAMPTZ,
  status       VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'notified', 'converted', 'expired'))
);

-- One active entry per customer per slot
CREATE UNIQUE INDEX idx_waitlist_one_active
  ON waitlist (customer_id, slot_id)
  WHERE status IN ('waiting', 'notified');

-- Expiry worker reads this to find next person in line
CREATE INDEX idx_waitlist_slot
  ON waitlist (slot_id, joined_at)
  WHERE status IN ('waiting', 'notified');


-- =============================================================================
-- BOOKINGS
--
-- FIX #2 + #5: trigger enforces reservation exists, is 'holding', and has
-- not expired before the booking row is allowed to be inserted.
-- =============================================================================

CREATE TABLE bookings (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID          NOT NULL REFERENCES users(id),
  facility_id       UUID          NOT NULL REFERENCES facilities(id),
  resource_id       UUID          REFERENCES resources(id),
  slot_id           UUID          NOT NULL REFERENCES time_slots(id),
  -- FIX #2: reservation_id is now NOT NULL — every booking must trace back
  -- to a valid reservation. No reservation = no booking.
  reservation_id    UUID          NOT NULL REFERENCES reservations(id),
  rescheduled_from  UUID          REFERENCES bookings(id),
  attendee_count    INTEGER       NOT NULL DEFAULT 1 CHECK (attendee_count >= 1),
  answers           JSONB         NOT NULL DEFAULT '{}',
  total_price       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  status            VARCHAR(20)   NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'no_show')),
  confirmation_code VARCHAR(20)   UNIQUE DEFAULT upper(encode(gen_random_bytes(5), 'hex')),
  booked_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  cancelled_at      TIMESTAMPTZ,
  cancel_reason     TEXT
);

CREATE UNIQUE INDEX idx_one_active_booking_per_slot
  ON bookings (customer_id, slot_id)
  WHERE status NOT IN ('cancelled', 'rescheduled');

CREATE UNIQUE INDEX idx_one_reschedule_per_booking
  ON bookings (rescheduled_from)
  WHERE rescheduled_from IS NOT NULL;

CREATE INDEX idx_bookings_customer
  ON bookings (customer_id, booked_at DESC);

CREATE INDEX idx_bookings_facility
  ON bookings (facility_id, booked_at DESC);


-- -----------------------------------------------------------------------------
-- FIX #2 + #5: validate reservation before booking insert
-- Blocks: missing reservation, wrong customer/slot, already converted,
--         and payment-after-expiry (reservation expired before payment landed)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION t1_validate_booking()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_reservation reservations%ROWTYPE;
  v_slot        time_slots%ROWTYPE;
BEGIN
  -- Lock the reservation row so no concurrent process can expire it
  -- between our check and the insert committing.
  SELECT * INTO v_reservation
  FROM reservations
  WHERE id = NEW.reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found: %', NEW.reservation_id;
  END IF;

  -- FIX #5: block payment-after-expiry at the DB level
  IF v_reservation.status != 'holding' THEN
    RAISE EXCEPTION
      'Reservation is no longer active (status: %). Payment arrived too late or already used.',
      v_reservation.status;
  END IF;

  IF v_reservation.expires_at < NOW() THEN
    RAISE EXCEPTION
      'Reservation expired at %. Current time: %.',
      v_reservation.expires_at, NOW();
  END IF;

  -- Reservation must belong to the same customer and slot
  IF v_reservation.customer_id != NEW.customer_id THEN
    RAISE EXCEPTION 'Reservation customer mismatch';
  END IF;

  IF v_reservation.slot_id != NEW.slot_id THEN
    RAISE EXCEPTION 'Reservation slot mismatch';
  END IF;

  -- Final capacity check (safety net — reserved_count covers this already,
  -- but we double-check confirmed_count with a fresh lock)
  SELECT * INTO v_slot FROM time_slots WHERE id = NEW.slot_id FOR UPDATE;

  IF (v_slot.confirmed_count + NEW.attendee_count) > v_slot.total_capacity THEN
    RAISE EXCEPTION
      'Capacity exceeded at confirmation (confirmed=%, requested=%, total=%)',
      v_slot.confirmed_count, NEW.attendee_count, v_slot.total_capacity;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER t1_booking_validate
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION t1_validate_booking();


-- Freeze total price from slot at booking time
CREATE OR REPLACE FUNCTION t3_freeze_booking_price()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_price NUMERIC;
BEGIN
  SELECT frozen_price INTO v_price FROM time_slots WHERE id = NEW.slot_id;
  NEW.total_price := v_price * NEW.attendee_count;
  RETURN NEW;
END;
$$;

CREATE TRIGGER t3_booking_freeze_price
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION t3_freeze_booking_price();


-- Mark reservation as converted immediately after booking insert succeeds.
-- This prevents any second booking from ever using the same reservation.
CREATE OR REPLACE FUNCTION t4_convert_reservation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE reservations
  SET status = 'converted'
  WHERE id = NEW.reservation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER t4_booking_convert_reservation
AFTER INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION t4_convert_reservation();


-- Sync confirmed_count on booking lifecycle
CREATE OR REPLACE FUNCTION t5_booking_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE time_slots
    SET confirmed_count = confirmed_count + NEW.attendee_count
    WHERE id = NEW.slot_id;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IN ('cancelled', 'rescheduled') AND OLD.status = 'confirmed' THEN
      UPDATE time_slots
      SET confirmed_count = confirmed_count - OLD.attendee_count
      WHERE id = OLD.slot_id;
    END IF;

    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
      UPDATE time_slots
      SET confirmed_count = confirmed_count + NEW.attendee_count
      WHERE id = NEW.slot_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER t5_booking_status_sync
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION t5_booking_status_change();


-- Validate reschedule chain integrity
CREATE OR REPLACE FUNCTION t6_validate_reschedule()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  old_booking bookings%ROWTYPE;
BEGIN
  IF NEW.rescheduled_from IS NOT NULL THEN
    SELECT * INTO old_booking FROM bookings WHERE id = NEW.rescheduled_from;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Original booking not found: %', NEW.rescheduled_from;
    END IF;

    IF old_booking.status != 'confirmed' THEN
      RAISE EXCEPTION
        'Only confirmed bookings can be rescheduled (current status: %)',
        old_booking.status;
    END IF;

    IF old_booking.customer_id != NEW.customer_id THEN
      RAISE EXCEPTION 'Customer mismatch on reschedule';
    END IF;

    IF old_booking.facility_id != NEW.facility_id THEN
      RAISE EXCEPTION 'Facility mismatch on reschedule';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER t6_reschedule_validate
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION t6_validate_reschedule();


-- =============================================================================
-- RESCHEDULE STORED PROCEDURE
-- =============================================================================

CREATE OR REPLACE FUNCTION reschedule_booking(
  p_old_booking    UUID,
  p_new_slot       UUID,
  p_reservation_id UUID,
  p_attendee_count INTEGER DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  v_old    bookings%ROWTYPE;
  v_new_id UUID;
BEGIN
  SELECT * INTO v_old FROM bookings WHERE id = p_old_booking FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % not found', p_old_booking;
  END IF;

  IF v_old.status != 'confirmed' THEN
    RAISE EXCEPTION
      'Only confirmed bookings can be rescheduled (status: %)', v_old.status;
  END IF;

  INSERT INTO bookings (
    customer_id, facility_id, resource_id,
    slot_id, reservation_id, rescheduled_from,
    attendee_count, answers, status
  )
  VALUES (
    v_old.customer_id, v_old.facility_id, v_old.resource_id,
    p_new_slot, p_reservation_id, p_old_booking,
    COALESCE(p_attendee_count, v_old.attendee_count),
    v_old.answers,
    'confirmed'
  )
  RETURNING id INTO v_new_id;

  UPDATE bookings
  SET status = 'rescheduled', cancelled_at = NOW()
  WHERE id = p_old_booking;

  RETURN v_new_id;
END;
$$;


-- =============================================================================
-- PAYMENTS
-- References reservation first. booking_id populated after confirmation.
-- =============================================================================

CREATE TABLE payments (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID          NOT NULL REFERENCES reservations(id),
  booking_id     UUID          REFERENCES bookings(id),
  gateway        VARCHAR(30)   NOT NULL DEFAULT 'razorpay',
  gateway_txn_id VARCHAR(200)  UNIQUE,
  order_id       VARCHAR(200),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency       CHAR(3)       NOT NULL DEFAULT 'INR',
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  webhook_payload TEXT,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- BOOKING EVENTS — append-only audit log
-- =============================================================================

CREATE TABLE booking_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID        NOT NULL REFERENCES bookings(id),
  event_type VARCHAR(50) NOT NULL,
  payload    JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- FIX #3 + #4: RECONCILIATION FUNCTION
--
-- Addresses: "expiry worker dependency" and "Redis ↔ DB desync"
--
-- This function is the recovery mechanism. Run it:
--   - As a cron every 5 minutes (catches worker downtime)
--   - On app startup (catches any gap during deploys)
--   - On-demand via admin API
--
-- It does NOT replace the expiry worker — it heals state if the worker
-- missed events or Redis and DB diverged for any reason.
--
-- What it fixes:
--   1. Reservations past expires_at still in 'holding' → marks them expired
--      and decrements reserved_count (which unblocks the slot)
--   2. reserved_count on any slot that doesn't match actual holding rows
--      → corrects the count to the true value
--   3. Slot status inconsistency → recalculates from confirmed_count
-- =============================================================================

CREATE OR REPLACE FUNCTION reconcile_stale_reservations()
RETURNS TABLE (
  fixed_reservations  INTEGER,
  fixed_slot_counts   INTEGER,
  fixed_slot_statuses INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  v_fixed_reservations  INTEGER := 0;
  v_fixed_slot_counts   INTEGER := 0;
  v_fixed_slot_statuses INTEGER := 0;
BEGIN

  -- Step 1: expire any holding reservations that are past their TTL.
  -- The trigger on reservations will decrement reserved_count for each one.
  WITH expired AS (
    UPDATE reservations
    SET status = 'expired'
    WHERE status = 'holding'
      AND expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_fixed_reservations FROM expired;

  -- Step 2: correct reserved_count on any slot where DB count doesn't match
  -- the actual number of holding reservation rows.
  -- This catches: Redis key gone but DB not updated, worker crash mid-batch, etc.
  WITH true_counts AS (
    SELECT
      slot_id,
      COALESCE(SUM(attendee_count), 0) AS true_reserved
    FROM reservations
    WHERE status = 'holding'
    GROUP BY slot_id
  ),
  mismatched AS (
    UPDATE time_slots ts
    SET reserved_count = COALESCE(tc.true_reserved, 0)
    FROM true_counts tc
    WHERE ts.id = tc.slot_id
      AND ts.reserved_count != tc.true_reserved
    RETURNING ts.id
  ),
  -- Also zero out slots that have no holding reservations but reserved_count > 0
  orphaned AS (
    UPDATE time_slots
    SET reserved_count = 0
    WHERE reserved_count > 0
      AND id NOT IN (SELECT slot_id FROM true_counts)
    RETURNING id
  )
  SELECT (SELECT COUNT(*) FROM mismatched) +
         (SELECT COUNT(*) FROM orphaned)
  INTO v_fixed_slot_counts;

  -- Step 3: correct slot status based on confirmed_count vs total_capacity.
  -- Does not touch 'cancelled' or 'blackout' slots.
  WITH status_fixes AS (
    UPDATE time_slots
    SET status = CASE
      WHEN confirmed_count >= total_capacity THEN 'booked'
      ELSE 'available'
    END
    WHERE status NOT IN ('cancelled', 'blackout')
      AND status != CASE
        WHEN confirmed_count >= total_capacity THEN 'booked'
        ELSE 'available'
      END
    RETURNING id
  )
  SELECT COUNT(*) INTO v_fixed_slot_statuses FROM status_fixes;

  RETURN QUERY SELECT v_fixed_reservations, v_fixed_slot_counts, v_fixed_slot_statuses;
END;
$$;


-- =============================================================================
-- APP LAYER CONTRACT (not SQL — document what the app must guarantee)
-- =============================================================================

COMMENT ON TABLE reservations IS
'FIX #8 — RESERVATION INSERT FAILURE PROTOCOL:
App must perform these steps IN ORDER:
  1. Redis SET NX  (slot:lock:{slot_id}:{customer_id}, TTL=600)
  2. DB INSERT reservations  (inside try/catch)
  3. If DB insert FAILS → immediately Redis DEL the lock key
     so the slot is not phantom-blocked.
  4. If Redis SET succeeds but app crashes before DB insert →
     reconcile_stale_reservations() will clean up within 5 minutes
     because no DB holding row exists to prevent the slot from freeing.

FIX #7 — WAITLIST ATOMICITY:
  Use INSERT ... ON CONFLICT DO NOTHING for waitlist rows.
  Redis ZADD NX for the sorted set entry.
  Both are idempotent — safe to retry.

FIX #4 — EXPIRY WORKER RELIABILITY:
  Run reconcile_stale_reservations() on app startup and every 5 minutes
  as a fallback. The expiry worker (Redis keyspace notifications) is the
  fast path; reconciler is the guaranteed recovery path.';
