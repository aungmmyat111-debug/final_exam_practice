import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export async function POST(req) {
  await connectToDatabase();
  const { email, password } = await req.json();

  // Test Users Seed စစ်ဆေးခြင်း
  let user = await User.findOne({ email });
  if (!user) {
    if (email === 'admin@test.com' && password === 'admin123') {
      user = await User.create({ email, password: 'admin123', role: 'ADMIN' });
    } else if (email === 'user@test.com' && password === 'user123') {
      user = await User.create({ email, password: 'user123', role: 'USER' });
    }
  }

  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  const response = NextResponse.json({ 
    message: 'Login successful', 
    user: { email: user.email, role: user.role } 
  });

  response.cookies.set('token', token, { httpOnly: true, path: '/' });
  return response;
}