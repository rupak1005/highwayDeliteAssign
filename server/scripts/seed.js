const { pool } = require('../config/database');
const { initDatabase } = require('../config/initDb');

const sampleExperiences = [
  {
    title: "Mountain Hiking Adventure",
    description: "Experience the breathtaking beauty of mountain trails with our guided hiking adventure. Perfect for nature lovers and adventure seekers.",
    location: "Rocky Mountains, Colorado",
    price: 89.99,
    duration_hours: 6,
    max_participants: 12,
    image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    category: "Adventure",
    rating: 4.8,
    review_count: 156
  },
  {
    title: "City Food Tour",
    description: "Discover the culinary secrets of the city with our expert food guide. Taste authentic local dishes and learn about food culture.",
    location: "Downtown District",
    price: 65.00,
    duration_hours: 3,
    max_participants: 15,
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    category: "Food & Drink",
    rating: 4.6,
    review_count: 89
  },
  {
    title: "Photography Workshop",
    description: "Learn professional photography techniques from award-winning photographers. Perfect for beginners and enthusiasts.",
    location: "Art District",
    price: 120.00,
    duration_hours: 4,
    max_participants: 8,
    image_url: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800",
    category: "Arts & Culture",
    rating: 4.9,
    review_count: 67
  },
  {
    title: "Kayaking Experience",
    description: "Paddle through serene waters and explore hidden coves. All equipment provided, suitable for all skill levels.",
    location: "Crystal Lake",
    price: 75.00,
    duration_hours: 2,
    max_participants: 10,
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    category: "Water Sports",
    rating: 4.7,
    review_count: 124
  },
  {
    title: "Wine Tasting Tour",
    description: "Visit local vineyards and taste premium wines. Learn about winemaking process and enjoy scenic countryside views.",
    location: "Napa Valley",
    price: 95.00,
    duration_hours: 5,
    max_participants: 20,
    image_url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
    category: "Food & Drink",
    rating: 4.5,
    review_count: 203
  },
  {
    title: "Rock Climbing Session",
    description: "Challenge yourself with indoor rock climbing. Professional instructors and safety equipment provided.",
    location: "Adventure Center",
    price: 55.00,
    duration_hours: 2,
    max_participants: 6,
    image_url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800",
    category: "Adventure",
    rating: 4.8,
    review_count: 98
  }
];

const samplePromoCodes = [
  {
    code: "SAVE10",
    description: "10% off your booking",
    discount_type: "percentage",
    discount_value: 10,
    min_amount: 50,
    max_discount: 20,
    usage_limit: 100,
    valid_until: "2024-12-31"
  },
  {
    code: "FLAT100",
    description: "$100 off bookings over $200",
    discount_type: "fixed",
    discount_value: 100,
    min_amount: 200,
    usage_limit: 50,
    valid_until: "2024-12-31"
  },
  {
    code: "WELCOME20",
    description: "20% off for new customers",
    discount_type: "percentage",
    discount_value: 20,
    min_amount: 30,
    max_discount: 50,
    usage_limit: 200,
    valid_until: "2024-12-31"
  },
  {
    code: "EARLYBIRD",
    description: "15% off early bookings",
    discount_type: "percentage",
    discount_value: 15,
    min_amount: 40,
    max_discount: 30,
    usage_limit: 75,
    valid_until: "2024-12-31"
  }
];

const generateSlots = (experienceId, startDate, endDate) => {
  const slots = [];
  const currentDate = new Date(startDate);
  const finalDate = new Date(endDate);
  
  while (currentDate <= finalDate) {
    // Generate 2-4 slots per day
    const slotsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < slotsPerDay; i++) {
      const startHour = 9 + (i * 3); // 9 AM, 12 PM, 3 PM, 6 PM
      const endHour = startHour + 2;
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
      const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;
      
      // Random availability (70% chance of having spots)
      const totalSpots = Math.floor(Math.random() * 8) + 3; // 3-10 spots
      const availableSpots = Math.random() > 0.3 ? totalSpots : Math.floor(Math.random() * totalSpots);
      
      slots.push({
        experience_id: experienceId,
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
        available_spots: availableSpots,
        total_spots: totalSpots,
        price: Math.floor(Math.random() * 20) + 50 // $50-$70
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database tables
    await initDatabase();
    
    // Clear existing data
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM slots');
    await pool.query('DELETE FROM experiences');
    await pool.query('DELETE FROM promo_codes');
    
    console.log('🗑️ Cleared existing data');
    
    // Insert experiences
    console.log('📝 Inserting experiences...');
    for (const experience of sampleExperiences) {
      const query = `
        INSERT INTO experiences (title, description, location, price, duration_hours, 
                               max_participants, image_url, category, rating, review_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;
      
      const result = await pool.query(query, [
        experience.title, experience.description, experience.location,
        experience.price, experience.duration_hours, experience.max_participants,
        experience.image_url, experience.category, experience.rating, experience.review_count
      ]);
      
      const experienceId = result.rows[0].id;
      
      // Generate slots for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const slots = generateSlots(experienceId, startDate, endDate);
      
      // Insert slots
      for (const slot of slots) {
        const slotQuery = `
          INSERT INTO slots (experience_id, date, start_time, end_time, 
                           available_spots, total_spots, price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await pool.query(slotQuery, [
          slot.experience_id, slot.date, slot.start_time, slot.end_time,
          slot.available_spots, slot.total_spots, slot.price
        ]);
      }
      
      console.log(`✅ Created ${slots.length} slots for "${experience.title}"`);
    }
    
    // Insert promo codes
    console.log('🎟️ Inserting promo codes...');
    for (const promo of samplePromoCodes) {
      const query = `
        INSERT INTO promo_codes (code, description, discount_type, discount_value,
                               min_amount, max_discount, usage_limit, valid_until)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      await pool.query(query, [
        promo.code, promo.description, promo.discount_type, promo.discount_value,
        promo.min_amount, promo.max_discount, promo.usage_limit, promo.valid_until
      ]);
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${sampleExperiences.length} experiences`);
    console.log(`🎟️ Created ${samplePromoCodes.length} promo codes`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };

