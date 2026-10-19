import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Borrow from '@/models/Borrow';
import Book from '@/models/Book';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let query = {};
  if (user.role !== 'ADMIN') {
    query.userId = user.userId;
  }

  const requests = await Borrow.find(query).sort({ createdAt: -1 });
  return NextResponse.json(requests);
}

export async function POST(req) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId, targetDate } = await req.json();
  const book = await Book.findById(bookId);

  if (!book || book.status === 'DELETED') {
    return NextResponse.json({ error: 'Book is not available' }, { status: 400 });
  }

  const borrowRequest = await Borrow.create({
    userId: user.userId,
    userEmail: user.email,
    bookId: book._id,
    bookTitle: book.title,
    targetDate: new Date(targetDate),
    requestStatus: 'INIT'
  });

  return NextResponse.json(borrowRequest, { status: 201 });
}