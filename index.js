//Import express and morgan
const express = require('express');
app = express();
bodyParser = require('body-parser'),
uuid = require('uuid');

app.use(bodyParser.json());


//Create users array
let users = [
    {
        id: 1,
        name: "Sam",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Jessie",
        favoriteMovies: ["The Choice"]
    },
    {
        id: 3,
        name: "Larry",
        favoriteMovies: ["The Longest Ride"]
    },
    {
        id: 4,
        name: "Tom",
        favoriteMovies: ["Dear John"]
    },
    {
        id: 5,
        name: "Lina",
        favoriteMovies: []
    },
];


// Create movies array
let movies = [
    {
        "Title":"The Notebook",
        "Description":"A young couple who fall in love in the 1940s. Their story is read from a notebook in the present day by an elderly man, telling the tale to a fellow nursing home resident.",
        "Genre": {
            "Name":"Romantic Drama",
            "Description":"At a modern-day nursing home, the elderly Duke reads a romantic story from a notebook to a female patient.",
        },
        "Director": {
            "Name":"Nick Cassavetes",
            "Bio":"Nicholas David Rowland Cassavetes (born May 21, 1959)[1] is an American actor, director, and writer. He has directed such films as She's So Lovely (1997), John Q. (2002), The Notebook (2004), Alpha Dog (2006), and My Sister's Keeper (2009). His acting credits include an uncredited role in Husbands (1970)—which was directed by his father, John Cassavetes—as well as roles in the films The Wraith (1986), Face/Off (1997), and Blow (2001).",
            "Birth":1959.0
        },
        "Images":"url here",
        "Featured":false
    },
    {
        "Title":"Dear John",
        "Description":"It follows the life of a soldier (Channing Tatum) after he falls in love with a young woman (Amanda Seyfried). They decide to exchange letters to each other after he is deployed.",
        "Genre": {
            "Name":"Romantic War-Drama",
            "Description":"When soldier John Tyree (Channing Tatum) meets an idealistic college student, Savannah Curtis (Amanda Seyfried), it's the beginning of a strong romance. Over the next seven tumultuous years and separated by John's increasingly dangerous deployment, the lovers stay in touch through their letters, meeting in person only rarely. However, their correspondence triggers consequences that neither could foresee. ",
        },
        "Director": {
            "Name":"Lasse Hallstrom",
            "Bio":"Lasse Hallstrom (Swedish:; born 2 June 1946) is a Swedish film director. He first became known for directing almost all the music videos by the pop group ABBA, but came to international attention with his 1985 feature film My Life as a Dog, for which he was nominated for an Academy Award for Best Director. He is also known for What's Eating Gilbert Grape (1993), The Cider House Rules (1999), and Chocolat (2000).",
            "Birth":1973.0
        },
        "Images":"url here",
        "Featured":false
    },
    {
        "Title":"The Lucky One",
        "Description":"The film stars Zac Efron as Logan Thibault, a US Marine who finds a photograph of a young woman while serving in Iraq, carries it around as a good luck charm, and later tracks down the woman, with whom he begins a relationship.",
        "Genre": {
            "Name":"Romantic Drama",
            "Description":"U.S. Marine Sgt. Logan Thibault (Zac Efron) returns home from his third tour of duty in Iraq with the one thing he believes kept him alive: a photograph of a woman he doesn't even know. He learns the woman's name is Beth (Taylor Schilling) and goes to meet her, eventually taking a job at her family-run kennel. Though Beth is full of mistrust and leads a complicated life, a romance blooms, giving Logan hope that Beth could become more than just his good-luck charm.",
        },
        "Director": {
            "Name":"Scott Hicks",
            "Bio":"Robert Scott Hicks (born 4 March 1953) is an Australian film director, producer and screenwriter. He is best known as the director of Shine, the biopic of pianist David Helfgott. Hicks was nominated for two Academy Awards. Other movies he has directed include the film adaptations of Stephen King's Hearts in Atlantis and Nicholas Sparks' The Lucky One.",
            "Birth":1974.0
        },
        "Images":"url here",
        "Featured":false
    },
    {
        "Title":"The Longest Ride",
        "Description":"The Longest Ride is a 2015 American romantic drama film directed by George Tillman Jr. and written by Craig Bolotin. Based on Nicholas Sparks' 2013 novel of the same name, the film stars Britt Robertson, Scott Eastwood, Jack Huston, Oona Chaplin, and Alan Alda. The film was released on April 10, 2015 by 20th Century Fox.",
        "Genre": {
            "Name":"Romance",
            "Description":"Former bull-riding champion Luke (Scott Eastwood) and college student Sophia (Britt Robertson) are in love, but conflicting paths and ideals threaten to tear them apart: Luke hopes to make a comeback on the rodeo circuit, and Sophia is about to embark on her dream job in New York's art world. As the couple ponder their romantic future, they find inspiration in Ira (Alan Alda), an elderly man whose decades-long romance with his beloved wife withstood the test of time.",
        },
        "Director": {
            "Name":"George Tillman",
            "Bio":"George Tillman Jr. (born January 26, 1969) is an American filmmaker.Tillman directed the films Soul Food (1997) and Men of Honor (2000). He is also the producer of Soul Food: The Series on television and the four films in the Barbershop series: Barbershop, Barbershop 2: Back in Business, Beauty Shop and Barbershop: The Next Cut. He directed the 2009 biopic Notorious, about the late Brooklyn-born rapper The Notorious B.I.G.,[2] and directed and produced the drama The Hate U Give (2018).",
            "Birth":1969.0
        },
        "Images":"url here",
        "Featured":false
    },
    {
        "Title":"The Choice",
        "Description":"The Choice is a 2016 American romantic drama film directed by Ross Katz and written by Bryan Sipe, based on Nicholas Sparks' 2007 novel of the same name about two neighbors who fall in love at their first meeting. ",
        "Genre": {
            "Name":"Romantic Comedy",
            "Description":"Travis Shaw (Benjamin Walker) is a ladies' man who thinks a serious relationship would cramp his easygoing lifestyle. Gabby Holland (Teresa Palmer) is a feisty medical student who's preparing to settle down with her long-term boyfriend (Tom Welling). Fate brings the two together as Gabby moves next door to Travis, sparking an irresistible attraction that upends both of their lives. As their bond grows, the unlikely couple must decide how far they're willing to go to keep the hope of love alive.",
        },
        "Director": {
            "Name":"Ross Katz",
            "Bio":"Ross Katz (born May 19, 1971 in Philadelphia, Pennsylvania) is an American film producer, screenwriter and film director. He has executive produced films including In the Bedroom and Lost in Translation, and has directed the films Adult Beginners (2014) and The Choice (2016), and the HBO film Taking Chance (2009).",
            "Birth":1971.0
        },
        "Images":"url here",
        "Featured":false
    },
];

//Create
app.post('/users', (req, res) => {
   const newUser = req.body;

   if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
   } else {
    res.status(400).send('users need names');
   }
});



//Update
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
 
    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).sen('no such user');
    }
 });

 //Create
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
 
    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).json(`${movieName} has been added to user ${id}'s array`);
    } else {
        res.status(400).sen('no such user');
    }
 });

  //Delete
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
 
    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).json(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).sen('no such user');
    }
 });

  //Delete
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
 
    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).json(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user');
    }
 });


//Read
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//Read
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie');
    }
});

//Read
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre');
    }
});

//Read
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director');
    }
});

// Listen for request
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
