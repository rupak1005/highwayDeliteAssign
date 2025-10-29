const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

router.post('/', [
  body('slotId').isInt({ min: 1 }).withMessage('Valid slot ID is required'),
  body('customerName').trim().isLength({ min: 2, max: 255 }).withMessage('Customer name must be 2-255 characters'),
  body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('customerPhone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('participants').isInt({ min: 1 }).withMessage('At least 1 participant is required'),
  body('promoCode').optional().isLength({ max: 50 }).withMessage('Promo code must be 50 characters or less')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { slotId, customerName, customerEmail, customerPhone, participants, promoCode } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const slotQuery = `
        SELECT s.*, e.title as experience_title, e.price as base_price
        FROM slots s
        JOIN experiences e ON s.experience_id = e.id
        WHERE s.id = $1 AND s.available_spots >= $2
      `;
      
      const slotResult = await client.query(slotQuery, [slotId, participants]);
      
      if (slotResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Slot not available or insufficient spots'
        });
      }

      const slot = slotResult.rows[0];
      const totalPrice = slot.price * participants;
      let discountAmount = 0;
      let finalPrice = totalPrice;

      if (promoCode) {
        const promoQuery = `
          SELECT * FROM promo_codes 
          WHERE code = $1 AND is_active = true 
          AND (valid_until IS NULL OR valid_until > NOW())
          AND (usage_limit IS NULL OR used_count < usage_limit)
        `;
        
        const promoResult = await client.query(promoQuery, [promoCode.toUpperCase()]);
        
        if (promoResult.rows.length > 0) {
          const promo = promoResult.rows[0];
          
          if (totalPrice >= promo.min_amount) {
            if (promo.discount_type === 'percentage') {
              discountAmount = (totalPrice * promo.discount_value) / 100;
              if (promo.max_discount && discountAmount > promo.max_discount) {
                discountAmount = promo.max_discount;
              }
            } else {
              discountAmount = promo.discount_value;
            }
            
            finalPrice = Math.max(0, totalPrice - discountAmount);
          }
        }
      }

      const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const bookingQuery = `
        INSERT INTO bookings (
          slot_id, experience_id, customer_name, customer_email, customer_phone,
          participants, total_price, promo_code, discount_amount, final_price,
          booking_reference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const bookingResult = await client.query(bookingQuery, [
        slotId, slot.experience_id, customerName, customerEmail, customerPhone,
        participants, totalPrice, promoCode, discountAmount, finalPrice,         bookingReference
      ]);

      const updateSlotQuery = `
        UPDATE slots 
        SET available_spots = available_spots - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      await client.query(updateSlotQuery, [participants, slotId]);

      if (promoCode && discountAmount > 0) {
        const updatePromoQuery = `
          UPDATE promo_codes 
          SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
          WHERE code = $1
        `;
        
        await client.query(updatePromoQuery, [promoCode.toUpperCase()]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          booking: bookingResult.rows[0],
          slot: slot,
          totalPrice,
          discountAmount,
          finalPrice
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const query = `
      SELECT 
        b.*,
        s.date, s.start_time, s.end_time,
        e.title as experience_title, e.location, e.image_url
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      JOIN experiences e ON b.experience_id = e.id
      WHERE b.booking_reference = $1
    `;

    const result = await pool.query(query, [reference]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

module.exports = router;

