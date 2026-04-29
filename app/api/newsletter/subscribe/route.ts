import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { sendMail } from '@/lib/mail';

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

    // Send Welcome Email
    try {
      await sendMail({
        to: email,
        subject: 'Welcome to Drishyam News Newsletter!',
        html: `
          <div style="font-family: serif, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #e11d48; text-align: center; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">DRISHYAM NEWS</h1>
            <p style="font-size: 18px; color: #333;">Namaste,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Thank you for subscribing to the <strong>Drishyam News Daily Briefing</strong>. You are now part of our community staying informed with the most accurate and latest news from India and around the world.
            </p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">What to expect:</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Daily morning briefings</li>
                <li>Breaking news alerts</li>
                <li>Exclusive opinion pieces and deep dives</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              © ${new Date().getFullYear()} Drishyam News. All rights reserved.
            </p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('[API] Welcome mail failed:', mailError);
      // We don't fail the whole request if just the welcome mail fails
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed' });
  } catch (error) {
    console.error('[API] Newsletter error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

