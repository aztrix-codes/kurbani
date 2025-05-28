import pool from '../db.js';

export async function GET() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Create admin table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create zones table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS zones (
        zone_id INT AUTO_INCREMENT PRIMARY KEY,
        zone_name VARCHAR(100) NOT NULL UNIQUE,
        zone_incharge VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create areas table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS areas (
        area_id INT AUTO_INCREMENT PRIMARY KEY,
        area_name VARCHAR(100) NOT NULL UNIQUE,
        area_incharge VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        zone_name VARCHAR(100) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (zone_name) REFERENCES zones(zone_name) ON UPDATE CASCADE
      )
    `);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        area_name VARCHAR(100) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TINYINT(1) DEFAULT 1,
        img_url VARCHAR(255),
        mumbai BOOLEAN DEFAULT FALSE,
        out_of_mumbai BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (area_name) REFERENCES areas(area_name) ON UPDATE CASCADE
      )
    `);

    // Create customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        recipt VARCHAR(255) NOT NULL,
        spl_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        zone VARCHAR(255) NOT NULL,
        phone BIGINT NULL,
        status BOOLEAN NOT NULL DEFAULT FALSE,
        payment_status BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create user_feedback table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username TEXT NOT NULL,
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create receipt_record table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS receipt_record (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        zone VARCHAR(50) NOT NULL,
        area VARCHAR(50) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        paid_by VARCHAR(100) NOT NULL,
        received_by VARCHAR(100) NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        net_total DECIMAL(12,2) NOT NULL,
        rate DECIMAL(10,2) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create superadmin table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS superadmin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        m_a_cost DECIMAL(10,2),
        oom_a_cost DECIMAL(10,2),
        lockall BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin (if not exists)
    await connection.execute(`
      INSERT IGNORE INTO admin (username, password) 
      VALUES (?, ?)
    `, ['admin', 'admin786']);

    // Insert default superadmin (if not exists)
    await connection.execute(`
      INSERT IGNORE INTO superadmin (name, password) 
      VALUES (?, ?)
    `, ['superadmin', 'superadmin786']);

    return Response.json({
      success: true,
      message: 'Database setup completed successfully. All tables created and default users inserted.',
      tables: [
        'admin',
        'zones', 
        'areas',
        'users',
        'customers',
        'user_feedback',
        'receipt_record',
        'superadmin'
      ],
      defaultUsers: {
        admin: { username: 'admin', password: 'admin786' },
        superadmin: { name: 'superadmin', password: 'superadmin786' }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Database setup error:', error);
    return Response.json({
      success: false,
      message: 'Database setup failed',
      error: error.message
    }, { status: 500 });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}