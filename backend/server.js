import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { Dish, Order, Staff, Customer } from './models.js';

import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Also try loading from the backend directory if variables are missing
dotenv.config({ path: path.join(__dirname, '.env') });


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/images';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Payload:', req.body.name || 'No Name');
  next();
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menumagic';
console.log('Using MongoDB URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.IO Setup
io.on('connection', (socket) => {
  console.log('⚡ [Socket] New client connected:', socket.id);
  socket.on('disconnect', () => console.log('⚡ [Socket] Client disconnected'));
});

// Routes for Dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes.map(d => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/dishes', upload.single('image'), async (req, res) => {
  try {
    console.log('>>> [DISH_POST] Saving:', req.body.name);
    
    const { name, description, category, price, available, timeSlots, offer, offerPercent } = req.body;
    let { imageUrl } = req.body;

    if (req.file) {
      imageUrl = `/images/${req.file.filename}`;
    }

    const dish = new Dish({
      name,
      description,
      category,
      price: Number(price) || 0,
      available: available === 'true' || available === true,
      timeSlots: Array.isArray(timeSlots) ? timeSlots : (timeSlots ? [timeSlots] : []),
      imageUrl,
      offer,
      offerPercent: offerPercent ? Number(offerPercent) : undefined
    });

    const savedDish = await dish.save();
    console.log('>>> [DISH_POST] SUCCESS! Saved dish ID:', savedDish._id);

    const responseData = { ...savedDish.toObject(), id: savedDish._id.toString() };
    io.emit('menuUpdated', { action: 'create', data: responseData });
    res.status(201).json(responseData);
  } catch (error) {
    console.error('>>> [DISH_POST] FAILED:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/dishes/:id', upload.single('image'), async (req, res) => {
  try {
    const { id, _id, ...updates } = req.body;
    
    if (req.file) {
      updates.imageUrl = `/images/${req.file.filename}`;
    }

    const updatedDish = await Dish.findOneAndUpdate(
      { $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { id: req.params.id }
      ].filter(q => q._id !== null || q.id !== undefined) },
      updates,
      { new: true }
    );
    
    if (!updatedDish) return res.status(404).json({ error: 'Dish not found' });
    const responseData = { ...updatedDish.toObject(), id: updatedDish._id.toString() };
    io.emit('menuUpdated', { action: 'update', data: responseData });
    res.json(responseData);
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
    
    // Emit real-time update
    io.emit('menuUpdated', { action: 'delete', id: req.params.id });
    
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
    const newOrder = new Order({ ...req.body, status: 'waiting', orderId });
    const savedOrder = await newOrder.save();
    const responseData = { ...savedOrder.toObject(), id: savedOrder.orderId };
    
    // Emit for kitchen
    io.emit('orderCreated', responseData);
    
    res.status(201).json(responseData);
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

// WhatsApp Send Message Route
app.post('/api/orders/:id/send-message', async (req, res) => {
  try {
    const { message } = req.body;
    const order = await Order.findOne({ $or: [{ orderId: req.params.id }, { _id: req.params.id }] });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.customerPhoneNumber) return res.status(400).json({ error: 'Customer phone number not found for this order' });

    const whapiToken = process.env.WHAPI_TOKEN;
    const whapiUrl = process.env.WHAPI_URL;

    // Send to Whapi
    let phone = order.customerPhoneNumber.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone; // Add India country code if missing
    
    const cleanWhapi = whapiUrl.endsWith('/') ? whapiUrl : whapiUrl + '/';
    const response = await axios.post(`${cleanWhapi}messages/text`, {
      to: phone,
      body: message
    }, {
      headers: {
        'Authorization': `Bearer ${whapiToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('WhatsApp Response:', response.data);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('WhatsApp Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'WhatsApp message failed', 
      details: error.response?.data || error.message 
    });
  }
});

// Broadcast WhatsApp Message to ALL Customers
app.post('/api/customers/broadcast', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const customers = await Customer.find({ phone: { $exists: true, $ne: "" } });
    if (!customers || customers.length === 0) return res.status(404).json({ error: 'No customers found with phone numbers' });

    const whapiToken = process.env.WHAPI_TOKEN;
    const whapiUrl = process.env.WHAPI_URL;

    if (!whapiToken || !whapiUrl) {
      console.error('[BROADCAST] WHAPI credentials missing');
      return res.status(500).json({ error: 'WhatsApp service not configured' });
    }

    const cleanWhapi = whapiUrl.endsWith('/') ? whapiUrl : whapiUrl + '/';
    const results = [];

    for (const customer of customers) {
      try {
        let phone = customer.phone.replace(/\D/g, '');
        if (phone.length < 10) continue; 
        if (phone.length === 10) phone = '91' + phone;

        console.log(`[BROADCAST] Sending to ${phone}...`);
        const response = await axios.post(`${cleanWhapi}messages/text`, {
          to: phone,
          body: message
        }, {
          headers: {
            'Authorization': `Bearer ${whapiToken}`,
            'Content-Type': 'application/json'
          }
        });
        results.push({ phone, success: true, response: response.data });
      } catch (err) {
        console.error(`Failed to send to ${customer.phone}:`, err.response?.data || err.message);
        results.push({ phone: customer.phone, success: false, error: err.response?.data || err.message });
      }
    }

    res.json({ success: true, count: results.filter(r => r.success).length, results });
  } catch (error) {
    console.error('Broadcast Error:', error.message);
    res.status(500).json({ error: 'Broadcast failed', message: error.message });
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

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
