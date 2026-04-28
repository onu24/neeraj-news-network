'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getMongoDb } from '../mongodb';
import {
  signAdminJwt,
  verifyAdminJwt,
  COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from '../auth';

/**
 * auth-actions.ts — Server-side Auth logic
 */

export async function createSession(email: string, password: string) {
  try {
    const db = await getMongoDb();
    const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = await signAdminJwt({ email: user.email, role: 'admin' });
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      maxAge: SESSION_DURATION_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error) {
    console.error('[Auth Action] Session creation failed:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function registerAdmin(name: string, email: string, password: string) {
  try {
    // SECURITY: Verify that the requester is an authenticated admin
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return { success: false, error: 'Unauthorized: No session found' };
    }

    const payload = await verifyAdminJwt(token);
    if (!payload || payload.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin privileges required' };
    }

    const db = await getMongoDb();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    await db.collection('users').insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    });

    // Automatically sign in after registration
    return createSession(email, password);
  } catch (error) {
    console.error('[Auth Action] Registration failed:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}
