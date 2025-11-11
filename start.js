// Simple static server for development
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(__dirname));

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/opportunity', (req, res) => {
    res.sendFile(path.join(__dirname, 'opportunity.html'));
});

// Mock API endpoints for demo purposes
app.use(express.json());

app.post('/api/contact', (req, res) => {
    console.log('Contact form submitted:', req.body);
    res.json({ success: true, message: 'Contact form submitted successfully' });
});

app.post('/api/opportunity/job', (req, res) => {
    console.log('Job application submitted:', req.body);
    res.json({ success: true, message: 'Job application submitted successfully' });
});

app.post('/api/opportunity/vendor', (req, res) => {
    console.log('Partnership application submitted:', req.body);
    res.json({ success: true, message: 'Partnership application submitted successfully' });
});

app.post('/api/opportunity/funding', (req, res) => {
    console.log('Investment inquiry submitted:', req.body);
    res.json({ success: true, message: 'Investment inquiry submitted successfully' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const server = app.listen(PORT, () => {
    console.log(`Bhairav Dynamics website running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
        server.listen(PORT + 1, () => {
            console.log(`Bhairav Dynamics website running on http://localhost:${PORT + 1}`);
        });
    } else {
        console.error('Server error:', err);
    }
});