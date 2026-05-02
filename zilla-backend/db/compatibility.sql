-- Compatibility views to map V4 code to V5 schema
-- This allows controllers using 'services' and 'providers' to work with 'facilities' and 'users'

-- 1. Providers view (maps organisers to providers)
CREATE OR REPLACE VIEW providers AS
SELECT id, id AS user_id, created_at, updated_at
FROM users
WHERE role = 'organiser';

-- 2. Services view (maps facilities to services)
CREATE OR REPLACE VIEW services AS
SELECT 
    id, 
    organiser_id AS provider_id, 
    name, 
    duration_mins AS duration_min, 
    max_capacity AS capacity, 
    (status = 'published') AS is_published, 
    base_price AS price, 
    manual_confirm AS manual_confirmation,
    advance_payment,
    created_at, 
    updated_at
FROM facilities;
