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
      `SELECT user_id, status, username, img_url, mumbai, out_of_mumbai FROM users WHERE 
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
    
    // Return success with user data
    return new Response(JSON.stringify({
      success: true,
      user_id: rows[0].user_id,
      status: rows[0].status,
      username: rows[0].username,
      img_url: rows[0].img_url,
      mumbai: rows[0].mumbai,
      out_of_mumbai: rows[0].out_of_mumbai
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

export async function PATCH(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const locationParam = url.searchParams.get('location'); // 'm', 'oom', or 'both'
    
    if (!userId || !locationParam) {
      return new Response(JSON.stringify({ 
        error: 'Both user_id and location parameters are required (location can be: m, oom, or both)' 
      }), {
        status: 400
      });
    }

    // Validate location parameter
    if (!['m', 'oom', 'both'].includes(locationParam)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid location parameter. Must be: m, oom, or both' 
      }), {
        status: 400
      });
    }

    let mumbaiValue, outOfMumbaiValue;

    // Set values based on location parameter
    switch (locationParam) {
      case 'm':
        mumbaiValue = true;
        outOfMumbaiValue = false;
        break;
      case 'oom':
        mumbaiValue = false;
        outOfMumbaiValue = true;
        break;
      case 'both':
        mumbaiValue = true;
        outOfMumbaiValue = true;
        break;
    }

    // Update the database
    const [result] = await pool.query(
      'UPDATE users SET mumbai = ?, out_of_mumbai = ? WHERE user_id = ?',
      [mumbaiValue, outOfMumbaiValue, userId]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ 
        error: 'User not found' 
      }), {
        status: 404
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Location status updated successfully',
      mumbai: mumbaiValue,
      out_of_mumbai: outOfMumbaiValue
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Update Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500
    });
  }
}