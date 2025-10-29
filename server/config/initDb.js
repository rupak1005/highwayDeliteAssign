const { pool } = require('../config/database');

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_hours INTEGER NOT NULL,
        max_participants INTEGER NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS slots (
        id SERIAL PRIMARY KEY,
        experience_id INTEGER REFERENCES experiences(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        available_spots INTEGER NOT NULL,
        total_spots INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(experience_id, date, start_time)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER REFERENCES slots(id) ON DELETE CASCADE,
        experience_id INTEGER REFERENCES experiences(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        participants INTEGER NOT NULL DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        promo_code VARCHAR(50),
        discount_amount DECIMAL(10,2) DEFAULT 0,
        final_price DECIMAL(10,2) NOT NULL,
        booking_status VARCHAR(50) DEFAULT 'confirmed',
        booking_reference VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value DECIMAL(10,2) NOT NULL,
        min_amount DECIMAL(10,2) DEFAULT 0,
        max_discount DECIMAL(10,2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = { initDatabase };

