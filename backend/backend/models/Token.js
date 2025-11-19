import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  access_token: { type: String, required: true },
  installed_at: { type: Date, default: Date.now },
  scopes: { type: String, required: true }
});

export default mongoose.model('Token', tokenSchema);