-- SwiftSalon Database Initialization Script
-- Run automatically when PostgreSQL container starts

-- Create database (already created by Docker environment)
-- CREATE DATABASE swiftsalon;

-- Create user (already created by Docker environment)
-- CREATE USER swiftsalon_user WITH PASSWORD 'swiftsalon_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE swiftsalon TO swiftsalon_user;
GRANT ALL ON SCHEMA public TO swiftsalon_user;

-- Set timezone to Malaysia
SET timezone = 'Asia/Kuala_Lumpur';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO swiftsalon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO swiftsalon_user;

-- Log initialization completion
INSERT INTO pg_stat_statements_reset();
SELECT 'SwiftSalon database initialization completed' AS status;