import { NextResponse } from 'next/server';
import pool from '../db';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.query('SELECT * FROM user_feedback ORDER BY created_at DESC');
      return NextResponse.json({ feedback: rows }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { username, feedback } = await request.json();
    
    // Validation
    if (!username || !feedback) {
      return NextResponse.json(
        { error: 'Username and feedback are required' },
        { status: 400 }
      );
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO user_feedback (username, feedback) VALUES (?, ?)',
        [username, feedback]
      );
      
      return NextResponse.json({ 
        message: 'Feedback submitted successfully',
        id: result.insertId 
      }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Get the ID from the URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if feedback exists
      const [feedbacks] = await connection.query(
        'SELECT id FROM user_feedback WHERE id = ?',
        [id]
      );
      
      if (feedbacks.length === 0) {
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        );
      }
      
      // Delete the feedback
      await connection.query(
        'DELETE FROM user_feedback WHERE id = ?',
        [id]
      );
      
      return NextResponse.json({
        message: 'Feedback deleted successfully'
      }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}