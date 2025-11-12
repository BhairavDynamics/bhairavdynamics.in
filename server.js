
// server.js — Fixed, simplified, and working version
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------ Basic middleware ------------------
app.use(cors()); // allow requests (adjust origin in production)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static frontend files (index.html, contact.html, opportunity.html, script.js, style.css)
app.use(express.static(path.join(__dirname)));

// ------------------ Rate limiter ------------------
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // max requests per window per IP
});
app.use('/api/', limiter);

// ------------------ Data directories ------------------
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ------------------ Local JSON helper ------------------
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

// ------------------ Schemas & Models ------------------
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 200 },
  businessPhone: { type: String, required: true, maxlength: 40 },
  message: { type: String, required: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now }
});
const opportunitySchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String,
  phone: String, whatsapp: String, address: String,
  city: String, state: String, zipcode: String,
  opportunityType: String,
  skills: String, whyWorkWithUs: String, resumeFilename: String,
  companyName: String, collaboration: String, proposal: String, proposalFilename: String,
  investmentInterest: String, whyInterested: String, fundName: String, pitchFilename: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);
const Opportunity = mongoose.model('Opportunity', opportunitySchema);

// ------------------ Multer (file uploads) ------------------
const allowedTypes = /pdf|doc|docx/;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${file.fieldname}-${Date.now()}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext) && allowedTypes.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  }
});

// ------------------ Page routes ------------------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.get('/opportunity', (req, res) => res.sendFile(path.join(__dirname, 'opportunity.html')));

// ------------------ API: Contact ------------------
app.post('https://bhairavdynamics-in.onrender.com/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, businessPhone, message } = req.body;
    if (!firstName || !lastName || !email || !businessPhone || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const payload = { firstName, lastName, email, businessPhone, message, createdAt: new Date().toISOString() };

    if (isDbConnected()) {
      await new Contact(payload).save();
      console.log('Contact saved to DB:', email);
      return res.json({ success: true, message: 'Contact saved' });
    } else {
      const ok = appendToJson(path.join(DATA_DIR, 'contacts.json'), payload);
      if (ok) {
        console.log('Contact saved to local JSON:', email);
        return res.json({ success: true, message: 'Contact saved locally (DB offline)' });
      }
      throw new Error('Failed to save contact');
    }
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ API: Opportunity (job) ------------------
app.post('/api/opportunity/job', upload.single('resume'), async (req, res) => {
  try {
    console.log('Job endpoint body keys:', Object.keys(req.body), 'file:', !!req.file);
    const body = req.body;
    const required = ['firstName','lastName','email','phone','whatsapp','address','city','state','zipcode','skills','whyWorkWithUs'];
    for (const f of required) if (!body[f]) return res.status(400).json({ error: `Missing ${f}` });
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });

    const payload = {
      ...body,
      opportunityType: 'internship',
      resumeFilename: req.file.filename,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      await new Opportunity(payload).save();
      console.log('Opportunity (job) saved to DB:', body.email);
      return res.json({ success: true, message: 'Job application saved' });
    } else {
      const ok = appendToJson(path.join(DATA_DIR, 'opportunities.json'), payload);
      if (ok) {
        console.log('Opportunity (job) saved to local JSON:', body.email);
        return res.json({ success: true, message: 'Job application saved locally (DB offline)' });
      }
      throw new Error('Failed to save opportunity locally');
    }
  } catch (err) {
    console.error('Job error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ API: Opportunity (vendor) ------------------
app.post('/api/opportunity/vendor', upload.single('proposalDoc'), async (req, res) => {
  try {
    console.log('Vendor endpoint body keys:', Object.keys(req.body), 'file:', !!req.file);
    const body = req.body;
    const required = ['firstName','lastName','email','phone','whatsapp','address','city','state','zipcode','companyName','collaboration','proposal'];
    for (const f of required) if (!body[f]) return res.status(400).json({ error: `Missing ${f}` });
    if (!req.file) return res.status(400).json({ error: 'Proposal file required' });

    const payload = {
      ...body,
      opportunityType: 'partnership',
      proposalFilename: req.file.filename,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      await new Opportunity(payload).save();
      console.log('Vendor saved to DB:', body.companyName);
      return res.json({ success: true, message: 'Partnership application saved' });
    } else {
      const ok = appendToJson(path.join(DATA_DIR, 'opportunities.json'), payload);
      if (ok) {
        console.log('Vendor saved to local JSON:', body.companyName);
        return res.json({ success: true, message: 'Vendor application saved locally (DB offline)' });
      }
      throw new Error('Failed to save vendor locally');
    }
  } catch (err) {
    console.error('Vendor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ API: Opportunity (funding) ------------------
app.post('/api/opportunity/funding', upload.single('pitchDoc'), async (req, res) => {
  try {
    console.log('Funding endpoint body keys:', Object.keys(req.body), 'file:', !!req.file);
    const body = req.body;
    const required = ['firstName','lastName','email','phone','whatsapp','address','city','state','zipcode','investmentInterest','whyInterested','fundName'];
    for (const f of required) if (!body[f]) return res.status(400).json({ error: `Missing ${f}` });
    if (!req.file) return res.status(400).json({ error: 'Pitch file required' });

    const payload = {
      ...body,
      opportunityType: 'investment',
      pitchFilename: req.file.filename,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      await new Opportunity(payload).save();
      console.log('Funding saved to DB:', body.email);
      return res.json({ success: true, message: 'Funding inquiry saved' });
    } else {
      const ok = appendToJson(path.join(DATA_DIR, 'opportunities.json'), payload);
      if (ok) {
        console.log('Funding saved to local JSON:', body.email);
        return res.json({ success: true, message: 'Funding inquiry saved locally (DB offline)' });
      }
      throw new Error('Failed to save funding locally');
    }
  } catch (err) {
    console.error('Funding error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------ Admin & health ------------------
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

app.get('/api/admin/opportunities', async (req, res) => {
  try {
    if (isDbConnected()) {
      const ops = await Opportunity.find().sort({ createdAt: -1 });
      return res.json(ops);
    }
    const file = path.join(DATA_DIR, 'opportunities.json');
    const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '[]';
    return res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Admin opportunities error:', err);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', dbConnected: isDbConnected(), uptime: process.uptime() });
});

// ------------------ Error & 404 ------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error middleware:', err && err.message ? err.message : err);
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max 10MB' });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.use('/api/', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// ------------------ Start ------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});  
