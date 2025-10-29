const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

router.post('/validate', [
  body('code').trim().isLength({ min: 1, max: 50 }).withMessage('Promo code is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
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

    const { code, amount } = req.body;
    const promoCode = code.toUpperCase();

    const query = `
      SELECT * FROM promo_codes 
      WHERE code = $1 AND is_active = true 
      AND (valid_until IS NULL OR valid_until > NOW())
      AND (usage_limit IS NULL OR used_count < usage_limit)
      AND min_amount <= $2
    `;

    const result = await pool.query(query, [promoCode, amount]);

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid or expired promo code',
        valid: false
      });
    }

    const promo = result.rows[0];
    let discountAmount = 0;

    if (promo.discount_type === 'percentage') {
      discountAmount = (amount * promo.discount_value) / 100;
      if (promo.max_discount && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    res.json({
      success: true,
      message: 'Promo code is valid',
      valid: true,
      data: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        discountAmount,
        finalAmount,
        minAmount: promo.min_amount,
        maxDiscount: promo.max_discount
      }
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
});

router.get('/codes', async (req, res) => {
  try {
    const query = `
      SELECT code, description, discount_type, discount_value, 
             min_amount, max_discount, usage_limit, used_count,
             valid_from, valid_until
      FROM promo_codes 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo codes',
      error: error.message
    });
  }
});

module.exports = router;

