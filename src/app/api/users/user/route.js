import pool from '../../db';

export async function GET(request) {
  try {
    // Get the URL search parameters
    const url = new URL(request.url);
    const phoneOrEmail = url.searchParams.get('phoneOrEmail');
    const password = url.searchParams.get('password');
    
    // Check if both phone/email and password are provided
    if (!phoneOrEmail || !password) {
      return new Response(JSON.stringify({ 
        error: 'Phone/Email and password are required as URL parameters' 
      }), {
        status: 400
      });
    }
    
    // Determine if the input is an email or phone number
    const isEmail = phoneOrEmail.includes('@');
    
    // Query the database to find a user with matching credentials
    const [rows] = await pool.query(
      `SELECT user_id, status, username, img_url FROM users WHERE 
       (${isEmail ? 'email' : 'phone'} = ?) AND password = ?`,
      [phoneOrEmail, password]
    );
    
    // Check if user exists
    if (rows.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid credentials' 
      }), {
        status: 401
      });
    }
    
    // Return success with the user_id and status
    return new Response(JSON.stringify({
      success: true,
      user_id: rows[0].user_id,
      status: rows[0].status,
      username: rows[0].username,
      img_url: rows[0].img_url
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Authentication Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500
    });
  }
}