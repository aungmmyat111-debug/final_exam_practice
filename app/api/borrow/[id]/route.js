import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Borrow from '@/models/Borrow';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  await connectToDatabase();
  const user = verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { requestStatus } = await req.json();
  const borrowRecord = await Borrow.findById(params.id);
  if (!borrowRecord) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  // Status transitions
  if (user.role === 'ADMIN') {
    borrowRecord.requestStatus = requestStatus;
  } else if (user.role === 'USER') {
    if (requestStatus === 'CANCEL-USER' && borrowRecord.userId.toString() === user.userId) {
      borrowRecord.requestStatus = 'CANCEL-USER';
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  await borrowRecord.save();
  return NextResponse.json(borrowRecord);
}