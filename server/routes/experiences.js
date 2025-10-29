const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location } = req.query;
    
    let query = `
      SELECT 
        e.*,
        COUNT(DISTINCT s.id) as total_slots,
        COUNT(DISTINCT CASE WHEN s.available_spots > 0 THEN s.id END) as available_slots
      FROM experiences e
      LEFT JOIN slots s ON e.id = s.experience_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      conditions.push(`e.category = $${paramCount}`);
      params.push(category);
    }

    if (minPrice) {
      paramCount++;
      conditions.push(`e.price >= $${paramCount}`);
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      conditions.push(`e.price <= $${paramCount}`);
      params.push(parseFloat(maxPrice));
    }

    if (location) {
      paramCount++;
      conditions.push(`LOWER(e.location) LIKE LOWER($${paramCount})`);
      params.push(`%${location}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY e.id ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiences',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const experienceQuery = 'SELECT * FROM experiences WHERE id = $1';
    const experienceResult = await pool.query(experienceQuery, [id]);

    if (experienceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    const experience = experienceResult.rows[0];

    let slotsQuery = `
      SELECT 
        s.*,
        CASE 
          WHEN s.available_spots > 0 THEN true 
          ELSE false 
        END as is_available
      FROM slots s 
      WHERE s.experience_id = $1
    `;
    
    const slotsParams = [id];
    
    if (date) {
      slotsQuery += ' AND s.date = $2';
      slotsParams.push(date);
    } else {
      slotsQuery += ' AND s.date >= CURRENT_DATE';
    }
    
    slotsQuery += ' ORDER BY s.date, s.start_time';

    const slotsResult = await pool.query(slotsQuery, slotsParams);

    res.json({
      success: true,
      data: {
        experience,
        slots: slotsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching experience details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experience details',
      error: error.message
    });
  }
});

router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;

    let query = `
      SELECT 
        s.*,
        CASE 
          WHEN s.available_spots > 0 THEN true 
          ELSE false 
        END as is_available
      FROM slots s 
      WHERE s.experience_id = $1
    `;
    
    const params = [id];
    let paramCount = 1;

    if (date) {
      paramCount++;
      query += ` AND s.date = $${paramCount}`;
      params.push(date);
    } else if (startDate && endDate) {
      paramCount++;
      query += ` AND s.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
      query += ` AND s.date <= $${paramCount}`;
      params.push(endDate);
    } else {
      query += ' AND s.date >= CURRENT_DATE';
    }
    
    query += ' ORDER BY s.date, s.start_time';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slots',
      error: error.message
    });
  }
});

module.exports = router;

