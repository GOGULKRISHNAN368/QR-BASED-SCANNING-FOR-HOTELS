import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Customer } from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menumagic';
const whapiToken = process.env.WHAPI_TOKEN;
const whapiUrl = process.env.WHAPI_URL;

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const message = "Test broadcast from script";
    const customers = await Customer.find({ phone: { $exists: true, $ne: "" } });
    console.log('Found', customers.length, 'customers');

    if (customers.length === 0) {
      console.log('No customers to test with');
      return;
    }

    const customer = customers[0];
    let phone = customer.phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    console.log(`Sending to ${phone} using ${whapiUrl}messages/text...`);
    
    // Normalize URL to avoid double slashes
    const cleanUrl = whapiUrl.endsWith('/') ? whapiUrl : whapiUrl + '/';
    const targetUrl = `${cleanUrl}messages/text`;
    
    console.log(`Target URL: ${targetUrl}`);

    const response = await axios.post(targetUrl, {
      to: phone,
      body: message
    }, {
      headers: {
        'Authorization': `Bearer ${whapiToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Success:', response.status, response.data);
  } catch (err) {
    console.error('Failed:', err.response?.data || err.message);
  } finally {
    await mongoose.disconnect();
  }
}

test();
