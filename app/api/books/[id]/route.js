import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Book from '@/models/Book';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const book = await Book.findById(params.id);
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  if (book.status === 'DELETED' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(book);
}

export async function PATCH(req, { params }) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await req.json();
  const updatedBook = await Book.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updatedBook);
}

// Soft Delete Implementation
export async function DELETE(req, { params }) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const softDeletedBook = await Book.findByIdAndUpdate(
    params.id,
    { status: 'DELETED' },
    { new: true }
  );
  return NextResponse.json({ message: 'Book soft deleted successfully', book: softDeletedBook });
}