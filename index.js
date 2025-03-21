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

//Connect to MongoD
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

/*mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});*/

app.use(bodyParser.json());
app.use(morgan('common'));

app.use(bodyParser.urlencoded({ extended: true }));

//Run CORS
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234'];

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

//Require Authentic logic
let auth = require('./auth.js')(app);

//Require Passport module
const passport = require('passport');
require('./passport.js');

const { check, validationResult } = require('express-validator');

//Server static files from publec folder
app.use(express.static('public'));

//Get route for homepage
app.get('/', (req, res) => {
    res.send('Welcome to my movie-API!');
});

//Return all movies
app.get('/movies', async (req, res) => {
    await Movies.find()
    .then((movies) => res.status(200).json(movies))
    .catch((err) => res.status(500).send('Error: ' + err));
});

// Return data about movie by title
app.get('/movies/:title', async (req, res) => {
    await Movies.findOne({ title: req.params.title })
    .then((movie) => {
        if (!movie) {
            res.status(404).send('Movie not found');
        } else {
            res.json(movie);
        }
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

//Return data about a genre by name
app.get('/genres/:name', async (req, res) => {
    await Movies.findOne({ 'genre.name': req.params.name })
    .then((movie) => {
        if (!movie) {
            res.status(404).send('Genre not found');
        } else {
            res.json(movie.genre);
        }
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

//Return data about director by name
app.get('/directors/:name', async (req, res) => {
    await Movies.findOne({ 'director.name': req.params.name })
    .then((movie) => {
        if (!movie) {
            res.status(404).send('Director not found');
        } else {
            res.json(movie.director);
        }
    })
    .catch((err) => res.status(500).send('Error: ' + err));
});

//Return data about user
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((users) => {
        if (!users) {
        return res.status(404).send('User not found');
    }
        res.json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Return a new user
app.post('/users',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
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


//Update user's info, by username
app.put('/users/:Username',
    [
        passport.authenticate('jwt', {session: false }),
        check('Username', 'Username is required').optional().isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed').optional().isAlphanumeric(),
        check('Password', 'Password is required').optional().not().isEmpty(),
        check('Email', 'Email does not appear to be valid').optional().isEmail()
    ], 
async (req, res) => {
    //Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array() });
    }

    //Check permission
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }

    //Hash the password if it's being updated
    const updatedData = { ...req.body};
    if (updatedData.password) {
        updatedData.password = Users.hashPassword(updatedData.password);
    }

    //Update database
    await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $set: updatedData },
        { new: true } // this ensures updated document is returned
    )
    .then((updatedUser) => {
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
 }
);

//Add a movie to user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false }), async (req, res) => {
    await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $push: { FavoriteMovies: req.params.MovieID } },
        { new: true }
    )
    .then((updatedUser) => res.json(updatedUser))
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });    
});

//Remove a movie from a user's favorites
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true }
    )
    .then(() => res.json({ message: `Movie ${req.params.MovieID} was removed form ${req.params.Username}'s favorites.` }))
    .catch((err) => res.status(500).send('Error: ' + err));
});

//Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
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
