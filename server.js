//Node.js modules
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a single HTTP server
http.createServer((request, response) => {
    let addr = request.url;
    q = new URL(addr, 'http: //localhost:8080');
    let filePath = '';
    
    
    // Determine file path based on URL
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname, 'documentation.html');
    } else {
        filePath = (__dirname, 'index.html');
    }

    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
           throw err;
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end(data);
        }
    });
}).listen(8080, () => {
    console.log('Server is running on Port 8080.');
});

    