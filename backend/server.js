import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Dish, Order, Staff } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menumagic';
console.log('Using MongoDB URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes for Dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes.map(d => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/dishes', async (req, res) => {
  try {
    console.log('--- REQ BODY RECEIVED ---');
    console.log(req.body);
    console.log('-------------------------');

    const { name, description, category, price, available, timeSlots, imageUrl, offer, offerPercent } = req.body;

    const dish = new Dish({
      name,
      description,
      category,
      price: Number(price),
      available,
      timeSlots,
      imageUrl,
      offer,
      offerPercent
    });

    const savedDish = await dish.save();
    console.log('✅ Dish saved to Atlas:', savedDish.name);

    res.status(201).json({ ...savedDish.toObject(), id: savedDish._id.toString() });
  } catch (error) {
    console.error('❌ Error adding dish:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/dishes/:id', async (req, res) => {
  try {
    const { id, _id, ...updates } = req.body;
    // Attempt to find by _id or a potential custom id field if you ever add one
    const updatedDish = await Dish.findOneAndUpdate(
      { $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { id: req.params.id }
      ].filter(q => q._id !== null || q.id !== undefined) },
      updates,
      { new: true }
    );
    
    if (!updatedDish) return res.status(404).json({ error: 'Dish not found' });
    res.json({ ...updatedDish.toObject(), id: updatedDish._id.toString() });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const deleted = await Dish.findOneAndDelete({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { id: req.params.id }
      ].filter(q => q._id !== null || q.id !== undefined)
    });
    
    if (!deleted) {
      console.warn(`Dish not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Dish already removed or not found' });
    }
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Routes for Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(o => ({ ...o.toObject(), id: o.orderId || o._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(3, '0')}`;
    const newOrder = new Order({ ...req.body, orderId });
    const savedOrder = await newOrder.save();
    res.status(201).json({ ...savedOrder.toObject(), id: savedOrder.orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findOneAndUpdate(
      { $or: [{ orderId: req.params.id }, { _id: req.params.id }] },
      { status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...updatedOrder.toObject(), id: updatedOrder.orderId || updatedOrder._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes for Staff
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff.map(s => ({ ...s.toObject(), id: s._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const { name, role, imageUrl } = req.body;
    const member = new Staff({ name, role, imageUrl });
    const savedMember = await member.save();
    res.status(201).json({ ...savedMember.toObject(), id: savedMember._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
