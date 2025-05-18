import pool from '../db';

export async function GET(request) {
  try {
    const [rows] = await pool.query('SELECT * FROM areas');
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
    const { area_name, area_incharge, phone, email, zone_name, created_date, status } = await request.json();
    const [result] = await pool.query(
      'INSERT INTO areas (area_name, area_incharge, phone, email, zone_name, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [area_name, area_incharge, phone, email, zone_name, created_date, status]
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
    const { area_id, area_name, area_incharge, phone, email, zone_name, created_date } = await request.json();
    await pool.query(
      'UPDATE areas SET area_name = ?, area_incharge = ?, phone = ?, email = ?, zone_name = ?, created_date = ? WHERE area_id = ?',
      [area_name, area_incharge, phone, email, zone_name, created_date, area_id]
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
    const { area_id } = await request.json();
    await pool.query('DELETE FROM areas WHERE area_id = ?', [area_id]);
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
    const { area_id, status } = await request.json();
    await pool.query('UPDATE areas SET status = ? WHERE area_id = ?', [status, area_id]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}