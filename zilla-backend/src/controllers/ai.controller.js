const { GoogleGenerativeAI } = require('@google/generative-ai');
const { query } = require('../config/db');
const { env } = require('../config/env');

const SYSTEM_INSTRUCTION = [
  'You are Zilla AI, a concise customer assistant for a booking platform.',
  'Use the supplied database context only. Do not invent appointments, slots, prices, or policies.',
  'When giving slot times, keep answers compact and actionable.',
].join(' ');

const hasGeminiKey = () => (
  Boolean(env.GEMINI_API_KEY) &&
  env.GEMINI_API_KEY !== 'your_gemini_api_key'
);

const formatDateTime = (value) => {
  if (!value) return 'time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'time unavailable';

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const formatTime = (value) => {
  if (!value) return 'time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'time unavailable';

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
};

const escapeLike = (value) => String(value).replace(/[\\%_]/g, '\\$&');

const parseDate = (text) => {
  const now = new Date();
  const lower = text.toLowerCase();

  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }

  if (lower.includes('today')) {
    return now.toISOString().slice(0, 10);
  }

  const isoMatch = lower.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  return null;
};

const detectIntent = (message) => {
  const text = message.toLowerCase();

  if (/\b(slot|slots|free time|available time|availability|vacant)\b/.test(text)) return 'slots';
  if (/\b(my booking|my bookings|appointment|appointments|schedule|confirmation|upcoming)\b/.test(text)) return 'appointments';
  if (/\b(service|services|price|cost|paid|free)\b/.test(text)) return 'services';
  if (/\b(pay|payment|razorpay|gateway|upi|card)\b/.test(text)) return 'payment';
  if (/\b(cancel|cancellation)\b/.test(text)) return 'cancel';
  if (/\b(hello|hi|hey|help)\b/.test(text)) return 'help';

  return 'general';
};

const findServiceMention = async (message) => {
  const text = message.toLowerCase();
  const services = await query(
    `SELECT id, name, base_price, location
     FROM facilities
     WHERE status = 'published' AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT 50`
  );

  const exact = services.rows.find((service) => (
    text.includes(String(service.name || '').toLowerCase())
  ));

  if (exact) return exact;

  const words = text
    .split(/[^a-z0-9]+/i)
    .filter((word) => word.length >= 3);

  const fuzzy = services.rows.find((service) => {
    const name = String(service.name || '').toLowerCase();
    return words.some((word) => name.includes(word));
  });

  return fuzzy || null;
};

const getServicesSummary = async () => {
  const result = await query(
    `SELECT f.id, f.name, f.base_price, f.advance_payment, f.location,
            COUNT(ts.id) FILTER (
              WHERE ts.status = 'available'
                AND ts.slot_start > NOW()
                AND (ts.confirmed_count + ts.reserved_count) < ts.total_capacity
            ) AS available_slot_count,
            MIN(ts.slot_start) FILTER (
              WHERE ts.status = 'available'
                AND ts.slot_start > NOW()
                AND (ts.confirmed_count + ts.reserved_count) < ts.total_capacity
            ) AS next_slot
     FROM facilities f
     LEFT JOIN time_slots ts ON ts.facility_id = f.id
     WHERE f.status = 'published' AND f.deleted_at IS NULL
     GROUP BY f.id
     ORDER BY f.created_at DESC
     LIMIT 8`
  );

  return result.rows;
};

const getUpcomingAppointments = async (userId) => {
  const result = await query(
    `SELECT b.id, b.status, b.confirmation_code, b.attendee_count, b.total_price,
            f.name AS service_name, f.location,
            ts.slot_start, ts.slot_end,
            p.status AS payment_status, p.gateway_txn_id
     FROM bookings b
     JOIN facilities f ON f.id = b.facility_id
     JOIN time_slots ts ON ts.id = b.slot_id
     LEFT JOIN payments p ON p.booking_id = b.id
     WHERE b.customer_id = $1
       AND b.status = 'confirmed'
       AND ts.slot_start >= NOW()
     ORDER BY ts.slot_start ASC
     LIMIT 5`,
    [userId]
  );

  return result.rows;
};

const getRecentAppointments = async (userId) => {
  const result = await query(
    `SELECT b.id, b.status, b.confirmation_code, b.attendee_count, b.total_price,
            f.name AS service_name, f.location,
            ts.slot_start, ts.slot_end,
            p.status AS payment_status
     FROM bookings b
     JOIN facilities f ON f.id = b.facility_id
     JOIN time_slots ts ON ts.id = b.slot_id
     LEFT JOIN payments p ON p.booking_id = b.id
     WHERE b.customer_id = $1
     ORDER BY ts.slot_start DESC
     LIMIT 5`,
    [userId]
  );

  return result.rows;
};

const getFreeSlots = async ({ serviceId, date }) => {
  const params = [];
  const where = [
    "f.status = 'published'",
    'f.deleted_at IS NULL',
    "ts.status = 'available'",
    'ts.slot_start > NOW()',
    '(ts.confirmed_count + ts.reserved_count) < ts.total_capacity',
  ];

  if (serviceId) {
    params.push(serviceId);
    where.push(`f.id = $${params.length}`);
  }

  if (date) {
    params.push(`${date}T00:00:00.000+05:30`);
    where.push(`ts.slot_start >= $${params.length}`);
    params.push(`${date}T23:59:59.999+05:30`);
    where.push(`ts.slot_start <= $${params.length}`);
  } else {
    where.push("ts.slot_start < NOW() + INTERVAL '7 days'");
  }

  const result = await query(
    `SELECT ts.id, ts.slot_start, ts.slot_end, ts.total_capacity,
            ts.confirmed_count, ts.reserved_count, ts.frozen_price,
            f.id AS service_id, f.name AS service_name, f.location
     FROM time_slots ts
     JOIN facilities f ON f.id = ts.facility_id
     WHERE ${where.join(' AND ')}
     ORDER BY ts.slot_start ASC
     LIMIT 12`,
    params
  );

  return result.rows.map((slot) => ({
    ...slot,
    remaining_capacity: Number(slot.total_capacity) - Number(slot.confirmed_count) - Number(slot.reserved_count),
  }));
};

const searchServices = async (message) => {
  const terms = message
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((word) => word.length >= 3 && !['service', 'services', 'price', 'cost', 'paid', 'free'].includes(word))
    .slice(0, 4);

  if (terms.length === 0) return getServicesSummary();

  const params = terms.map((term) => `%${escapeLike(term)}%`);
  const result = await query(
    `SELECT id, name, base_price, advance_payment, location
     FROM facilities
     WHERE status = 'published'
       AND deleted_at IS NULL
       AND (${params.map((_, index) => `LOWER(name) LIKE $${index + 1} ESCAPE '\\'`).join(' OR ')})
     ORDER BY created_at DESC
     LIMIT 8`,
    params
  );

  return result.rows.length > 0 ? result.rows : getServicesSummary();
};

const buildLocalContext = async (intent, message, userId) => {
  if (intent === 'slots') {
    const [service, services] = await Promise.all([
      findServiceMention(message),
      getServicesSummary(),
    ]);
    const date = parseDate(message);
    const slots = await getFreeSlots({ serviceId: service?.id, date });

    return { intent, service, date, slots, services };
  }

  if (intent === 'appointments') {
    const [upcoming, recent] = await Promise.all([
      getUpcomingAppointments(userId),
      getRecentAppointments(userId),
    ]);

    return { intent, upcoming, recent };
  }

  if (intent === 'services') {
    const services = await searchServices(message);
    return { intent, services };
  }

  if (intent === 'payment' || intent === 'cancel' || intent === 'general' || intent === 'help') {
    const [upcoming, services] = await Promise.all([
      getUpcomingAppointments(userId),
      getServicesSummary(),
    ]);

    return { intent, upcoming, services };
  }

  return { intent };
};

const serviceLine = (service) => {
  const price = Number(service.base_price || 0);
  const payment = price > 0 ? `₹${price}` : 'free';
  const slots = service.available_slot_count !== undefined
    ? `, ${Number(service.available_slot_count)} open slots`
    : '';
  const next = service.next_slot ? `, next ${formatDateTime(service.next_slot)}` : '';
  return `${service.name} (${payment}${slots}${next})`;
};

const slotsReply = (context) => {
  if (context.slots.length === 0) {
    const serviceText = context.service ? ` for ${context.service.name}` : '';
    const dateText = context.date ? ` on ${context.date}` : ' in the next 7 days';
    return `I could not find free slots${serviceText}${dateText}. Try another date or service from the marketplace.`;
  }

  const grouped = context.slots.reduce((acc, slot) => {
    acc[slot.service_name] = acc[slot.service_name] || [];
    acc[slot.service_name].push(slot);
    return acc;
  }, {});

  const lines = Object.entries(grouped).map(([serviceName, slots]) => {
    const times = slots
      .slice(0, 5)
      .map((slot) => `${formatDateTime(slot.slot_start)} (${slot.remaining_capacity} left)`)
      .join(', ');
    return `${serviceName}: ${times}`;
  });

  return `Free slots I found: ${lines.join(' | ')}`;
};

const appointmentsReply = (context) => {
  const appointments = context.upcoming.length > 0 ? context.upcoming : context.recent;

  if (!appointments || appointments.length === 0) {
    return 'You do not have any appointments yet. Choose a service from the marketplace, select a free slot, and confirm your booking.';
  }

  const prefix = context.upcoming.length > 0 ? 'Your upcoming appointments:' : 'Your recent appointments:';
  const lines = appointments.slice(0, 5).map((booking) => (
    `${booking.service_name} on ${formatDateTime(booking.slot_start)}. Status: ${booking.status}. Code: ${booking.confirmation_code || 'N/A'}`
  ));

  return `${prefix} ${lines.join(' | ')}`;
};

const servicesReply = (context) => {
  if (!context.services || context.services.length === 0) {
    return 'No published services are available right now.';
  }

  return `Available services: ${context.services.slice(0, 8).map(serviceLine).join(' | ')}`;
};

const localReply = (context) => {
  if (context.intent === 'slots') return slotsReply(context);
  if (context.intent === 'appointments') return appointmentsReply(context);
  if (context.intent === 'services') return servicesReply(context);

  if (context.intent === 'payment') {
    return 'For paid services, select a slot, enter your details, and click Book Appointment. Razorpay test checkout opens, and confirmation happens only after payment verification succeeds.';
  }

  if (context.intent === 'cancel') {
    return 'To cancel an appointment, open My Bookings, select the booking, and use the cancel option if it is available. Confirmed bookings remain visible with their confirmation code.';
  }

  return [
    'I can help with free slots, your appointments, services, prices, payment, and cancellation.',
    'Try asking: "free slots for Therapy Session tomorrow" or "show my upcoming appointments".',
  ].join(' ');
};

const geminiReply = async (message, user, context) => {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const result = await model.generateContent([
    {
      text: JSON.stringify({
        user: {
          id: user.user_id,
          role: user.role,
        },
        context,
        message,
      }),
    },
  ]);

  return result.response.text();
};

const chat = async (req, res, next) => {
  try {
    const message = String(req.body.message || '').trim();

    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required.' },
      });
    }

    const intent = detectIntent(message);
    const context = req.user.role === 'customer'
      ? await buildLocalContext(intent, message, req.user.user_id)
      : { intent, services: await getServicesSummary() };

    let content;
    let source = 'local';

    if (hasGeminiKey()) {
      try {
        content = await geminiReply(message, req.user, context);
        source = 'gemini';
      } catch (err) {
        console.error('Gemini AI Error:', err.message);
      }
    }

    if (!content) {
      content = localReply(context);
    }

    return res.json({
      success: true,
      data: {
        content,
        role: 'bot',
        source,
        intent,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  chat,
};
