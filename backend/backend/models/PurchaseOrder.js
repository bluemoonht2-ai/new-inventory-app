import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  originalOrderId: { type: String, required: true },
  originalOrderName: { type: String, required: true },
  items: [{
    productName: String,
    quantity: Number,
    sku: String,
    variantTitle: String
  }],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'ordered' },
  notes: { type: String, default: '' },
  shop: { type: String, required: true }
});

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);