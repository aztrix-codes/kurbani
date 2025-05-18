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
    const [result] = await pool.query(
      'INSERT INTO users (username, phone, email, password, area_name, created_date, status, img_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, phone, email, password, area_name, created_date, status, img_url]
    );
    return new Response(JSON.stringify({ id: result.insertId }), {
      status: 201
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

export async function PUT(request) {
  try {
    const { user_id, username, phone, email, area_name, created_date, img_url } = await request.json();
    await pool.query(
      'UPDATE users SET username = ?, phone = ?, email = ?, area_name = ?, created_date = ?, img_url = ? WHERE user_id = ?',
      [username, phone, email, area_name, created_date, img_url, user_id]
    );
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

export async function DELETE(request) {
  try {
    const { user_id } = await request.json();
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