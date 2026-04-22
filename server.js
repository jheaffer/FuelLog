const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://cabrera_kert:YOUR_PASSWORD@cluster0.mongodb.net/FuelTrackerDB';
mongoose.connect(MONGO_URI).then(() => console.log('✅ DB Connected'));

const FuelLog = mongoose.model('FuelLog', new mongoose.Schema({
    liters: Number, 
    cost: Number, 
    stationName: String, 
    date: { type: Date, default: Date.now }
}));

app.get('/api/logs', async (req, res) => res.json(await FuelLog.find().sort({date: -1})));
app.post('/api/logs', async (req, res) => {
    const log = new FuelLog(req.body);
    await log.save();
    res.status(201).json(log);
});

app.get('/api/external-prices', async (req, res) => {
    try {
        const response = await axios.get('https://api.collectapi.com/gasPrice/otherCountriesGasoline', {
            headers: {
                'authorization': 'apikey YOUR_TOKEN_HERE',
                'content-type': 'application/json'
            }
        });
        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ error: 'External API Failed' });
    }
});

app.get('/api/nearby-stations', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const sLat = parseFloat(lat) || 16.4023;
        const sLon = parseFloat(lon) || 120.5960;
        const offset = 0.03;

        const osmQuery = `
            [out:json];
            node["amenity"="fuel"](${sLat - offset},${sLon - offset},${sLat + offset},${sLon + offset});
            out body;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`;
        const response = await axios.get(url);
        const stations = response.data.elements.map(s => ({
            id: s.id,
            name: s.tags.name || "Gas Station",
            lat: s.lat,
            lon: s.lon,
            brand: s.tags.brand || "Independent"
        }));
        res.json(stations);
    } catch (error) {
        res.status(500).json({ error: 'Map API Failed' });
    }
});

app.listen(3000, () => console.log('🚀 Server running at port 3000'));