import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
  stock: Number,
  sales: Number,
  description: String,
  rating: Number,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
