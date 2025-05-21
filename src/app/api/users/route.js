import pool from '../db';

export async function GET(request) {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

export async function POST(request) {
  try {
    const { username, phone, email, password, area_name, created_date, status, img_url } = await request.json();
    
    // Check if all required fields are provided
    if (!username || !phone || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO users (username, phone, email, password, area_name, created_date, status, img_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, phone, email, password, area_name, created_date || new Date(), status || 1, img_url || null]
    );
    
    return new Response(JSON.stringify({ id: result.insertId, success: true }), {
      status: 201
    });
  } catch (error) {
    console.error('POST Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { user_id, username, phone, email, area_name, created_date, status, img_url, password } = data;
    
    // Check if user_id is provided
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400
      });
    }
    
    // Build the query dynamically based on provided fields
    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];
    
    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (area_name !== undefined) {
      updates.push('area_name = ?');
      params.push(area_name);
    }
    
    if (created_date !== undefined) {
      updates.push('created_date = ?');
      params.push(created_date);
    }
    
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (img_url !== undefined) {
      updates.push('img_url = ?');
      params.push(img_url);
    }
    
    // Add password update if provided
    if (password !== undefined && password !== '') {
      updates.push('password = ?');
      params.push(password); // Make sure to hash this password in production
    }
    
    // Add the WHERE clause and user_id parameter
    query += updates.join(', ') + ' WHERE user_id = ?';
    params.push(user_id);
    
    // Execute the query
    await pool.query(query, params);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    console.error('PUT Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

export async function DELETE(request) {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400
      });
    }
    
    await pool.query('DELETE FROM users WHERE user_id = ?', [user_id]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

export async function PATCH(request) {
  try {
    const { user_id, status } = await request.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400
      });
    }
    
    await pool.query('UPDATE users SET status = ? WHERE user_id = ?', [status, user_id]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}