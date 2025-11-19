import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  initialInventory: { type: Number, required: true },
  reorderPoint: { type: Number, default: 5 },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Inventory', inventorySchema);