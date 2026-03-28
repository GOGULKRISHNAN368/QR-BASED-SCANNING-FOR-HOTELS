import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  offer: { type: String },
  offerPercent: { type: Number },
  timeSlots: { type: [String] },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// We disable version key __v and transform to object by adding id.
dishSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const orderItemSchema = new mongoose.Schema({
  dishId: { type: String, required: true },
  dishName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  tableNumber: { type: Number, required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  status: { type: String, required: true, enum: ['pending', 'preparing', 'served', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret.orderId || ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  imageUrl: { type: String },
  joinedAt: { type: Date, default: Date.now }
});

staffSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Dish = mongoose.model('Dish', dishSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Staff = mongoose.model('Staff', staffSchema);
