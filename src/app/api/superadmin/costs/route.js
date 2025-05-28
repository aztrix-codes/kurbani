import pool from '../../db'; 


export async function GET(request) {
  try {
    const [row] = await pool.query('SELECT m_a_cost, oom_a_cost FROM superadmin WHERE id = 1');
    return new Response(JSON.stringify(row), {
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