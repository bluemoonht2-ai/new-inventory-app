import mongoose from 'mongoose';

const orderStatusSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  notes: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  shop: { type: String, required: true },
  history: [{
    from: String,
    to: String,
    timestamp: Date,
    notes: String
  }]
});

export default mongoose.model('OrderStatus', orderStatusSchema);