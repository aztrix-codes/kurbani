import pool from '../db'; // Adjust the path to your db.js file

// GET - Retrieve m_a_cost and oom_a_cost with name/password authentication
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const password = searchParams.get('password');

    if (!name || !password) {
      return Response.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    // Authenticate and get the single row
    const [rows] = await pool.execute(
      'SELECT id, name, m_a_cost, oom_a_cost, lockall FROM superadmin WHERE name = ? AND password = ? LIMIT 1',
      [name, password]
    );

    if (rows.length === 0) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      data: rows[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update m_a_cost and oom_a_cost for the single row and return updated data
export async function PUT(request) {
  try {
    const body = await request.json();
    const { m_a_cost, oom_a_cost } = body;

    // Validate that at least one cost field is provided
    if (m_a_cost === undefined && oom_a_cost === undefined) {
      return Response.json(
        { error: 'At least one cost field (m_a_cost or oom_a_cost) is required' },
        { status: 400 }
      );
    }

    // Validate cost values are numbers if provided
    if (m_a_cost !== undefined && (isNaN(m_a_cost) || m_a_cost < 0)) {
      return Response.json(
        { error: 'm_a_cost must be a valid positive number' },
        { status: 400 }
      );
    }

    if (oom_a_cost !== undefined && (isNaN(oom_a_cost) || oom_a_cost < 0)) {
      return Response.json(
        { error: 'oom_a_cost must be a valid positive number' },
        { status: 400 }
      );
    }

    // Build dynamic query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (m_a_cost !== undefined) {
      updateFields.push('m_a_cost = ?');
      updateValues.push(m_a_cost);
    }

    if (oom_a_cost !== undefined) {
      updateFields.push('oom_a_cost = ?');
      updateValues.push(oom_a_cost);
    }

    // Update the single row (no WHERE clause needed since there's only one row)
    const query = `UPDATE superadmin SET ${updateFields.join(', ')} LIMIT 1`;

    const [result] = await pool.execute(query, updateValues);

    if (result.affectedRows === 0) {
      return Response.json(
        { error: 'No data found to update' },
        { status: 404 }
      );
    }

    // Fetch the updated single row and return it (like GET)
    const [updatedRows] = await pool.execute(
      'SELECT id, name, m_a_cost, oom_a_cost, lockall FROM superadmin LIMIT 1'
    );

    return Response.json({
      success: true,
      message: 'Costs updated successfully',
      data: updatedRows[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update lockall status
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { lockall, name, password } = body;

    // Validate required fields
    if (lockall === undefined) {
      return Response.json(
        { error: 'lockall field is required' },
        { status: 400 }
      );
    }

    if (!name || !password) {
      return Response.json(
        { error: 'Name and password are required for authentication' },
        { status: 400 }
      );
    }

    // Validate lockall is boolean
    if (typeof lockall !== 'boolean') {
      return Response.json(
        { error: 'lockall must be a boolean value' },
        { status: 400 }
      );
    }

    // First authenticate the user
    const [authRows] = await pool.execute(
      'SELECT id FROM superadmin WHERE name = ? AND password = ? LIMIT 1',
      [name, password]
    );

    if (authRows.length === 0) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update lockall for the authenticated user
    const [result] = await pool.execute(
      'UPDATE superadmin SET lockall = ? WHERE name = ? AND password = ? LIMIT 1',
      [lockall, name, password]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { error: 'No data found to update' },
        { status: 404 }
      );
    }

    // Return success response
    return Response.json({
      success: true,
      message: `Lock status updated to ${lockall ? 'locked' : 'unlocked'}`,
      data: { lockall }
    }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}