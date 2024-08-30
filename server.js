// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS to allow requests from your frontend
app.use(cors());

// Proxy setup
app.use('/api', createProxyMiddleware({
    target: 'http://api-lulu.hibitbyte.com', // Replace with your HTTP-only API
    changeOrigin: true,
    secure: false, // Disable SSL verification for the target
    pathRewrite: {
        '^/api': '', // Remove '/api' prefix when forwarding to the target
    },
    onProxyReq: (proxyReq, req, res) => {
        // Modify the proxy request headers if necessary
        proxyReq.setHeader('Custom-Header', 'value');
    },
}));

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
