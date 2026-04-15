const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = 'mongodb+srv://cabrera_kert:YOUR_PASSWORD@cluster0.mongodb.net/FuelTrackerDB';
mongoose.connect(MONGO_URI).then(() => console.log('✅ DB Connected'));

// --- SCHEMAS ---
const FuelLog = mongoose.model('FuelLog', new mongoose.Schema({
    liters: Number, cost: Number, stationName: String, date: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. Get/Post local logs (Your CRUD)
app.get('/api/logs', async (req, res) => res.json(await FuelLog.find().sort({date: -1})));
app.post('/api/logs', async (req, res) => {
    const log = new FuelLog(req.body);
    await log.save();
    res.status(201).json(log);
});

// 2. The External API (The "Online" Global Prices)
app.get('/api/external-prices', async (req, res) => {
    try {
        const response = await axios.get('https://api.collectapi.com/gasPrice/otherCountriesGasoline', {
            headers: {
                'authorization': 'apikey YOUR_TOKEN_HERE', // Put your token here
                'content-type': 'application/json'
            }
        });
        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ error: 'External API Failed' });
    }
});

app.listen(3000, () => console.log('🚀 Server at port 3000'));