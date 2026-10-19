import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Book from '@/models/Book';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const filter = {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ]
  };

  // Normal user များသည် Soft deleted စာအုပ်များကို မမြင်ရပါ
  if (user.role !== 'ADMIN') {
    filter.status = { $ne: 'DELETED' };
  }

  const books = await Book.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(books);
}

export async function POST(req) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await req.json();
  const newBook = await Book.create(data);
  return NextResponse.json(newBook, { status: 201 });
}