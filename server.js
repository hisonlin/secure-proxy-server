// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS to allow requests from your frontend
app.use(cors({
    origin: '*', // or specify your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  

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

// Proxy setup specifically for images
app.use('/images', createProxyMiddleware({
    target: 'http://api-lulu.hibitbyte.com', // Image target
    changeOrigin: true,
    pathRewrite: {
        '^/images': '/static/images', // Rewrite /images path to match API's static images path
    },
    onProxyReq: (proxyReq, req, res) => {
        // Modify the URL to include the API key as a query parameter
        const url = new URL(proxyReq.path, 'http://api-lulu.hibitbyte.com');
        url.searchParams.append('mykey', 'G6wXG76aYN53Gn37zchRsl%2BZx%2B8fsd%2BB2WBpaDx2K9rk6KpfEtluSRD0z5b59xC7iD8/FaxoJeuPk4fdVNt3Fw=='); // Append the API key
        proxyReq.path = url.pathname + url.search;
    },
}));


app.get('/', (req, res) => {
    res.send('Proxy server is running');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
