import pool from '../db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id parameter is required' }), {
        status: 400
      });
    }

    let query, params;
    
    // If user_id is 0, get all customers
    if (user_id === '0') {
      query = 'SELECT * FROM customers';
      params = [];
    } else {
      query = 'SELECT * FROM customers WHERE user_id = ?';
      params = [user_id];
    }

    const [rows] = await pool.query(query, params);

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
    const { user_id, recipt, spl_id, name, type, zone, phone } = await request.json();
    
    // Validate required fields
    if (!user_id || !recipt || !spl_id || !name || !type || !zone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400
      });
    }

    const [result] = await pool.query(
      'INSERT INTO customers (user_id, recipt, spl_id, name, type, zone, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, recipt, spl_id, name, type, zone, phone]
    );

    return new Response(JSON.stringify({ 
      id: result.insertId,
      message: 'Customer created successfully'
    }), {
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
    const { user_id, spl_id, name } = await request.json();
    
    // Validate required fields
    if (!user_id || !spl_id || !name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400
      });
    }

    const [result] = await pool.query(
      'UPDATE customers SET name = ? WHERE user_id = ? AND spl_id = ?',
      [name, user_id, spl_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Customer name updated successfully'
    }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}


// Add this function to your existing API file
export async function PATCH_BULK_PAYMENT_STATUS(request) {
  try {
    const { customer_ids } = await request.json();
    
    // Validate that customer_ids is an array and not empty
    if (!Array.isArray(customer_ids) || customer_ids.length === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'customer_ids must be a non-empty array of IDs' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create placeholders for the SQL query
    const placeholders = customer_ids.map(() => '?').join(',');
    
    // Update payment_status to true (1) for all provided IDs
    const [result] = await pool.query(
      `UPDATE customers SET payment_status = TRUE WHERE id IN (${placeholders})`,
      customer_ids
    );

    // Check if any records were updated
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No matching customer records found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Payment status updated for ${result.affectedRows} customer(s)`,
      updated_count: result.affectedRows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Modify your existing PATCH function to handle bulk updates
export async function PATCH(request) {
  const { searchParams } = new URL(request.url);
  const bulk = searchParams.get('bulk');
  const type = searchParams.get('type');
  
  // Handle bulk payment status update
  if (bulk === 'true' && type === 'payment_status') {
    return PATCH_BULK_PAYMENT_STATUS(request);
  }
  
  // Original PATCH logic for status update
  try {
    const { user_id, spl_id, status } = await request.json();
    
    if (!user_id || !spl_id || typeof status !== 'boolean') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [result] = await pool.query(
      'UPDATE customers SET status = ? WHERE user_id = ? AND spl_id = ?',
      [status, user_id, spl_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Customer not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Customer status updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}



export async function DELETE_BULK(request) {
  try {
    const { user_id, receipt } = await request.json();
    
    if (!user_id || !receipt) {
      return new Response(JSON.stringify({ error: 'user_id and receipt are required' }), {
        status: 400
      });
    }

    const [result] = await pool.query(
      'DELETE FROM customers WHERE user_id = ? AND recipt = ?',
      [user_id, receipt]
    );

    return new Response(JSON.stringify({ 
      message: `${result.affectedRows} records deleted successfully`
    }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}


export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const bulk = searchParams.get('bulk');
  
  if (bulk === 'true') {
    return DELETE_BULK(request);
  }
  
  // Original single deletion logic
  try {
    const { user_id, spl_id } = await request.json();
    
    if (!user_id || !spl_id) {
      return new Response(JSON.stringify({ error: 'user_id and spl_id are required' }), {
        status: 400
      });
    }

    const [result] = await pool.query(
      'DELETE FROM customers WHERE user_id = ? AND spl_id = ?',
      [user_id, spl_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Customer deleted successfully'
    }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
}