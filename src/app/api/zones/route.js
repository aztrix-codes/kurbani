import pool from '../db';

export async function GET(request) {
  try {
    const [rows] = await pool.query('SELECT * FROM zones');
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
    const { zone_name, zone_incharge, phone, email, created_date, status } = await request.json();
    const [result] = await pool.query(
      'INSERT INTO zones (zone_name, zone_incharge, phone, email, created_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [zone_name, zone_incharge, phone, email, created_date, status]
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
    const { zone_id, zone_name, zone_incharge, phone, email, created_date } = await request.json();
    await pool.query(
      'UPDATE zones SET zone_name = ?, zone_incharge = ?, phone = ?, email = ?, created_date = ? WHERE zone_id = ?',
      [zone_name, zone_incharge, phone, email, created_date, zone_id]
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
    const { zone_id } = await request.json();
    await pool.query('DELETE FROM zones WHERE zone_id = ?', [zone_id]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}

// Separate endpoint for status update
export async function PATCH(request) {
  try {
    const { zone_id, status } = await request.json();
    await pool.query('UPDATE zones SET status = ? WHERE zone_id = ?', [status, zone_id]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}