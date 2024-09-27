require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const APIKEYS = [process.env.API_KEY, process.env.BROOKE_API_KEY, process.env.KAELEY_API_KEY];
const productURL = process.env.PRODUCT_API_URL;
const filterURL = process.env.FILTER_API_URL;
const oneProductURL = process.env.ONE_PRODUCT_API_URL;

// Enable CORS for all routes
app.use(cors());

app.use(express.json()); // Middleware to parse JSON requests

// Helper function to try API keys
const fetchWithAPIKey = async (url, bodyData, method = 'post') => {
    for (const APIKEY of APIKEYS) {
        try {
            // Attempt to fetch the data with the current API key
            if (method === 'post') {
                return await axios.post(`${url}&mykey=${APIKEY}`, bodyData);
            } else {
                return await axios.get(`${url}&mykey=${APIKEY}`);
            }
        } catch (error) {
            // If the error response indicates that the API key has exceeded its limit or some other issue
            if (error.response && error.response.status === 403) {
                console.log(`API key ${APIKEY} failed. Trying next key...`);
                // Move to the next API key
            } else {
                // For other types of errors, stop and throw the error
                throw error;
            }
        }
    }
    throw new Error('All API keys have failed or exceeded their limits.');
};

// Define a route to fetch products
app.post('/api/fetch-products', async (req, res) => {
    const { sortingID, page, bodyData } = req.body; // Get data from the frontend request

    try {
        // Try fetching data with fallback to different API keys
        const apiResponse = await fetchWithAPIKey(
            `${productURL}sortingId=${sortingID}&page=${page}`,
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

// Route to fetch filter data
app.get('/api/filter', async (req, res) => {
    try {
        // Try fetching data with fallback to different API keys
        const apiResponse = await fetchWithAPIKey(`${filterURL}`, null, 'get');

        res.json(apiResponse.data);
    } catch (error) {
        console.error('Error fetching filter data:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch filter data' });
    }
});

// Route to fetch a single product
app.post('/api/fetch-one-product', async (req, res) => {
    const { productId } = req.body;

    try {
        // Try fetching data with fallback to different API keys
        const apiResponse = await fetchWithAPIKey(
            `${oneProductURL}${productId}`,
            null,
            'get'
        );

        res.json(apiResponse.data);
    } catch (error) {
        console.error('Error fetching one product:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(500).json({ error: 'Failed to fetch product' });
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
