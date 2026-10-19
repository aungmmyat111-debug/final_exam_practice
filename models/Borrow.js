import mongoose from 'mongoose';

const BorrowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle: { type: String, required: true },
  targetDate: { type: Date, required: true },
  requestStatus: { 
    type: String, 
    enum: ['INIT', 'CLOSE-NO-AVAILABLE-BOOK', 'ACCEPTED', 'CANCEL-ADMIN', 'CANCEL-USER'], 
    default: 'INIT' 
  }
}, { timestamps: true });

export default mongoose.models.Borrow || mongoose.model('Borrow', BorrowSchema);