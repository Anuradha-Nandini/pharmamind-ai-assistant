-- MySQL Schema Initialization for PharmaMind AI

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Clinical Pharmacist',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    generic_name VARCHAR(255) NOT NULL,
    brand_names VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    form VARCHAR(100) NOT NULL,
    strengths VARCHAR(255) NOT NULL,
    pregnancy_category VARCHAR(10),
    has_black_box_warning BOOLEAN DEFAULT FALSE,
    moa TEXT,
    dosing_adult TEXT,
    dosing_pediatric TEXT
);
