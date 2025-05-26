// src/app/api/receipt/route.js
import pool from '../db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    // Base query
    let query = 'SELECT * FROM receipt_record';
    let params = [];
    
    // Add WHERE clause if user_id is provided and not 0
    if (userId && userId !== '0') {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    // Always order by latest first
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(query, params);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const receiptData = await request.json();
    
    // Validate required fields - removing image_url from required fields
    const requiredFields = [
      'user_id', 'zone', 'area', 'purpose',
      'paid_by', 'received_by', 'subtotal',
      'net_total', 'rate', 'quantity'
    ];
    
    const missingFields = requiredFields.filter(field => {
      // Check if field is missing or undefined, but allow zero values
      return receiptData[field] === undefined || receiptData[field] === null || 
             (typeof receiptData[field] === 'string' && receiptData[field].trim() === '');
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Ensure numeric fields are properly formatted
    const numericFields = ['subtotal', 'net_total', 'rate', 'quantity'];
    numericFields.forEach(field => {
      if (typeof receiptData[field] === 'string') {
        receiptData[field] = parseFloat(receiptData[field]);
      }
    });
    
    // Ensure user_id is an integer
    if (typeof receiptData.user_id === 'string') {
      receiptData.user_id = parseInt(receiptData.user_id, 10);
    }
    
    // Remove image_url from the query
    const query = `
      INSERT INTO receipt_record (
        user_id, zone, area, purpose, paid_by,
        received_by, subtotal, net_total, rate, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      receiptData.user_id,
      receiptData.zone,
      receiptData.area,
      receiptData.purpose,
      receiptData.paid_by,
      receiptData.received_by,
      receiptData.subtotal,
      receiptData.net_total,
      receiptData.rate,
      receiptData.quantity
    ];
    
    console.log('Inserting receipt with params:', JSON.stringify(params));
    
    const [result] = await pool.query(query, params);
    
    return NextResponse.json(
      { id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create receipt' },
      { status: 500 }
    );
  }
}
