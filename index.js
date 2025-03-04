//Import mongoose
const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid');
const path = require('path');
const cors = require('cors');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Connect to MongoDB
 mongoose.connect( process.env.CONNECTION_URI, {
   useNewUrlParser: true, 
   useUnifiedTopology: true
 });

 /* mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}); */

app.use(bodyParser.json());
app.use(morgan('common'));

app.use(bodyParser.urlencoded({ extended: true }));

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback (null, true);
    }
}));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');

//Get route for homepage
app.get('/', (req, res) => {
    res.send('Welcome to my movie-API!');
});

//Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
    .then((movies) => req.status(200).json(movies))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// Get data about movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ title: req.params.title })
    .then((movie) => {
        if (!movie) {
            res.status(404).send('Movie not found');
        } else {
            res.json(movie);
        }
    })
    .catch((err) => res.status(500).send('Error: ', err));
});

//Get data about a genre by name
app.get('/genres/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ 'genre.name': req.params.name })
    .then((movie) => {
        if (!movie) {
            res.status(404).send('Genre not found');
        } else {
            res.json(movie.genre);
        }
    })
    .catch((err) => res.status(500).send('Error: ', err));
});

//Get data about director by name
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ 'director.name': req.params.name })
    .then((movie) => {
        if (!movie) {
            res.status(404).send('Director not found');
        } else {
            res.json(movie.director);
        }
    })
    .catch((err) => req.status(500).send('Error: ', err));
});

//Add a user
app.post('/user',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],  async (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{ res.status(201).json(user) })
           .catch((error) => {
            console.error(error);
            res.status(500).send('Error:' + error);
           }); 
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error:' + error);
    });
});

//Get all users
app.get('/users', passport.authenticate('jwt', {session: false }), async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((users) => {
        res.json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Update user's info, by username
app.put('/users/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

//Add a movie to user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username}, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Delete a user by username
app.delete('/user/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


// Listen for request
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port' + port);
});
