import pool from '../db';

export async function GET(request) {
  try {
    const [rows] = await pool.query('SELECT * FROM areas');
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('GET error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('POST received data:', body);
    
    const { area_name, area_incharge, phone, email, zone_name, created_date, status } = body;
    
    // Validate required fields
    if (!area_name || !area_incharge || !phone || !zone_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO areas (area_name, area_incharge, phone, email, zone_name, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [area_name, area_incharge, phone, email, zone_name, created_date, status]
    );
    
    console.log('POST query result:', result);
    
    return new Response(JSON.stringify({ id: result.insertId }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('POST error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('PUT received data:', body);
    
    const { area_id, area_name, area_incharge, phone, email, zone_name, created_date, status } = body;
    
    // Validate required fields
    if (!area_id || !area_name || !area_incharge || !phone || !zone_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Include status if provided
    let query = 'UPDATE areas SET area_name = ?, area_incharge = ?, phone = ?, email = ?, zone_name = ?, created_date = ?';
    let params = [area_name, area_incharge, phone, email, zone_name, created_date];
    
    if (status !== undefined) {
      query += ', status = ?';
      params.push(status);
    }
    
    query += ' WHERE area_id = ?';
    params.push(area_id);
    
    const [result] = await pool.query(query, params);
    
    console.log('PUT query result:', result);
    
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Area not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('PUT error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    console.log('DELETE received data:', body);
    
    const { area_id } = body;
    
    if (!area_id) {
      return new Response(JSON.stringify({ error: 'Missing area_id' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const [result] = await pool.query('DELETE FROM areas WHERE area_id = ?', [area_id]);
    
    console.log('DELETE query result:', result);
    
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Area not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    console.log('PATCH received data:', body);
    
    const { area_id, status } = body;
    
    if (!area_id || status === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const [result] = await pool.query('UPDATE areas SET status = ? WHERE area_id = ?', [status, area_id]);
    
    console.log('PATCH query result:', result);
    
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Area not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}