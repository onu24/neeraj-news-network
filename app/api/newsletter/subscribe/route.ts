import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const db = await getMongoDb();
    
    // Check if the user is already subscribed
    const existing = await db.collection('newsletter_subscribers').findOne({ email: email.toLowerCase() });
    
    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }

    // Add new subscriber
    await db.collection('newsletter_subscribers').insertOne({
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      active: true,
      source: 'footer'
    });

    return NextResponse.json({ success: true, message: 'Successfully subscribed' });
  } catch (error) {
    console.error('[API] Newsletter error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
