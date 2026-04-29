'use server';

import { getMongoDb } from '@/lib/mongodb';
import { sendMail } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return { success: false, error: 'Name, email and message are required' };
    }

    const db = await getMongoDb();
    
    const contactSubmission = {
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    // 1. Save to MongoDB
    await db.collection('contact_submissions').insertOne(contactSubmission);

    // 2. Send Notification Email to Admin
    try {
      await sendMail({
        to: process.env.CAREERS_EMAIL || 'admin@drishyamnews.in',
        subject: `New Contact Form Message: ${subject || 'No Subject'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #e11d48; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">New Contact Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin-top: 0;"><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">Sent via Drishyam News Contact Form</p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('Failed to send admin contact notification:', mailError);
    }

    // 3. Send Confirmation Email to User
    try {
      await sendMail({
        to: email,
        subject: 'We received your message - Drishyam News',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #e11d48; text-align: center;">Namaste ${name}!</h1>
            <p>Thank you for reaching out to <strong>Drishyam News</strong>.</p>
            <p>We have received your message regarding "<strong>${subject || 'General Inquiry'}</strong>" and our team will get back to you as soon as possible.</p>
            <p>Your query is important to us.</p>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 14px;">
              <p>Best Regards,<br/>Team Drishyam News</p>
              <p><a href="https://drishyam-news.com" style="color: #e11d48; text-decoration: none;">www.drishyam-news.com</a></p>
            </div>
          </div>
        `
      });
    } catch (userMailError) {
      console.error('Failed to send user contact confirmation:', userMailError);
    }

    return { success: true };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { success: false, error: 'Failed to submit message' };
  }
}
