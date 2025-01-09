//
// Node.js modules
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a single HTTP server
http.createServer((request, response) => {
    try {
        // Parse the request URL
        const requestUrl = new URL(request.url, `http://${request.headers.host}`);
        let filePath = '';

        // Determine the file path based on the URL pathname
        if (requestUrl.pathname.includes('documentation')) {
            filePath = path.join(__dirname, 'documentation.html');
        } else {
            filePath = path.join(__dirname, 'index.html');
        }

        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err.message);
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end('404 Not Found');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data);
            }
        });
    } catch (error) {
        console.error('Error handling request:', error.message);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('500 Internal Server Error');
    }
}).listen(8080, () => {
    console.log('Server is running on Port 8080.');
});

    