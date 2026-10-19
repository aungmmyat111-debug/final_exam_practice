import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  location: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'DELETED'], default: 'AVAILABLE' } // For soft deletion
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', BookSchema);