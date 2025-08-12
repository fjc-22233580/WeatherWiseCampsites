
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const campsiteRoutes = require('./routes/campsiteRoutes');
app.use('/api/campsites', campsiteRoutes);

app.get('/api/test', (req, res) => {
  res.json('Welcome to WeatherWise Campsites API');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






/*
app.get('/api/test', (req, res) => {
  res.json('Welcome to WeatherWise Campsites API');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});*/