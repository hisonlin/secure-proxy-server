require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const APIKEY = process.env.API_KEY;
const productURL = process.env.PRODUCT_API_URL;
const filterURL = process.env.FILTER_API_URL;

// Enable CORS for all routes
app.use(cors());

app.use(express.json()); // Middleware to parse JSON requests

// Define a route to fetch products
app.post('/api/fetch-products', async (req, res) => {
    const { sortingID, page, bodyData } = req.body; // Get data from the frontend request

    try {
        // Fetch data from the API
        const apiResponse = await axios.post(
            `${productURL}sortingId=${sortingID}&page=${page}&mykey=${APIKEY}`,
            bodyData
        );

        // Send the response back to the frontend
        res.json(apiResponse.data);
    } catch (error) {
        // Improved error logging for better diagnosis
        console.error('Error fetching products:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Proxy route to serve images securely
app.get('/proxy-image', async (req, res) => {
    const { imageUrl } = req.query;
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image:', error.message);
        res.status(500).send('Failed to fetch image');
    }
});

// Proxy route to serve images securely
app.get('/proxy-color-image', async (req, res) => {
    const { imageUrl } = req.query;
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image:', error.message);
        res.status(500).send('Failed to fetch image');
    }
});

app.get('/api/filter', async (req, res) => {

    try {
        const apiResponse = await axios.get(
            `${filterURL}mykey=${APIKEY}`
        );

        res.json(apiResponse.data);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Test route to verify server is running
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start the server on a specific port
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
