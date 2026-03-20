import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Dish, Order } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menumagic';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes for Dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find();
    // Transform _id to id for the frontend
    res.json(dishes.map(d => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/dishes', async (req, res) => {
  try {
    const dishData = req.body;
    


    const newDish = new Dish(dishData);
    const savedDish = await newDish.save();
    res.status(201).json({ ...savedDish.toObject(), id: savedDish._id.toString() });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add dish' });
  }
});

app.put('/api/dishes/:id', async (req, res) => {
  try {
    const updatedDish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDish) return res.status(404).json({ error: 'Dish not found' });
    res.json({ ...updatedDish.toObject(), id: updatedDish._id.toString() });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update dish' });
  }
});

app.delete('/api/dishes/:id', async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete dish' });
  }
});

// Routes for Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(o => ({ ...o.toObject(), id: o.orderId || o._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Generate an order ID like ORD-001 if we want, or just use Mongoose ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${String(count + 1).padStart(3, '0')}`;
    const newOrder = new Order({ ...req.body, orderId });
    const savedOrder = await newOrder.save();
    res.status(201).json({ ...savedOrder.toObject(), id: savedOrder.orderId });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add order' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    // We search by either orderId or _id
    const updatedOrder = await Order.findOneAndUpdate(
      { $or: [{ orderId: req.params.id }, { _id: req.params.id }] },
      { status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...updatedOrder.toObject(), id: updatedOrder.orderId || updatedOrder._id.toString() });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order status' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
