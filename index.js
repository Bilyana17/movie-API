//Import mongoose
const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid');

const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.Users;

mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());

app.use(morgan('common'));

app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');


//Add a user
app.post('/user',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], 
     passport.authenticate('jwt', {session: false }), async (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array( )});
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
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{ res.status(201).json(user) })
           .catch((error) => {
            console.error(error);
            res.status(500).semd('Error:' + error);
           }) 
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error:' + error);
    });
});

//Get all users
app.get('/users', passport.authenticate('jwt', {session: false }), async (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
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
    let hashedPassword = Users.hashPassword(req.body.Password);
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
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            email: req.body.Email,
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
    let hashedPassword = Users.hashPassword(req.body.Password);
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
app.delete('/user/:Username', passport.authenticate('jwt', {session: false }), async (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
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
