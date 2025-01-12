//Import express and morgan
const express = require('express');
const morgan = require('morgan');
const app = express();

// Morgan middleware for logging
app.use(morgan('combined'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Movies based on Nicholas Sparks books
let topMovies = [
    { title: 'The Notebook', year: '1994' },
    { title: 'Message in a Bottle', year: '1999' },
    { title: 'Nights in Rodanthe', year: '2008' },
    { title: 'Dear John', year: '2010' },
    { title: 'The Last Song', year: '2010' },
    { title: 'The Lucky One', year: '2012' },
    { title: 'Safe Haven', year: '2013' },
    { title: 'The Best of Me', year: '2014' },
    { title: 'The Longest Ride', year: '2016' },
    { title: 'The Choice', year: '2016' },
];

// Routes

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
});

// Documentation route
app.get('/documentation', (req, res) => {
    res.sendFile('documentation.html', { root: 'public' });
});

// Movies route
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for request
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
