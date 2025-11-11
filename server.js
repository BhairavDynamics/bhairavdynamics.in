// ===============================================
// 🚀 Bhairav Dynamics Backend — Contact Form Only
// ===============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------ Middleware ------------------
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ------------------ Rate limiter ------------------
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // max requests per window per IP
});
app.use('/api/', limiter);

// ------------------ Data directories ------------------
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ------------------ JSON fallback helper ------------------
function appendToJson(filePath, record) {
  try {
    let arr = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8') || '[]';
      arr = JSON.parse(raw);
    }
    arr.push(record);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('appendToJson error:', err);
    return false;
  }
}

// ------------------ MongoDB connection ------------------
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhairav_dynamics';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// ------------------ Schema & Model ------------------
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  businessPhone: { type: String, required: true, maxlength: 40 },
  message: { type: String, required: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ------------------ Routes ------------------

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, businessPhone, message } = req.body;
    if (!firstName || !lastName || !email || !businessPhone || !message)
      return res.status(400).json({ error: 'All fields are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email format' });

    const payload = { firstName, lastName, email, businessPhone, message, createdAt: new Date().toISOString() };

    if (isDbConnected()) {
      await new Contact(payload).save();
      console.log('📩 Contact saved to DB:', email);
      return res.json({ success: true, message: 'Contact form submitted successfully' });
    } else {
      const ok = appendToJson(path.join(DATA_DIR, 'contacts.json'), payload);
      if (ok) {
        console.log('📁 Contact saved to local JSON:', email);
        return res.json({ success: true, message: 'Contact saved locally (DB offline)' });
      }
      throw new Error('Failed to save contact locally');
    }
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route
app.get('/api/admin/contacts', async (req, res) => {
  try {
    if (isDbConnected()) {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.json(contacts);
    }
    const file = path.join(DATA_DIR, 'contacts.json');
    const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
    return res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Admin contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', dbConnected: isDbConnected(), uptime: process.uptime() });
});

// 404
app.use('/api/', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// ------------------ Start ------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
