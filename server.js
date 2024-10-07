const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt')
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT  = 3000;

const secretKey = "My super secret key";
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    { id: 1, username: 'admin', password: 'admin1' },
    { id: 2, username: 'user', password: 'user1' }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for(let user of users) {
        if(username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, {expiresIn: '3m'});
            res.json({
                success: true,
                err: null,
                token
            });
            return;
        }  
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
    console.log('This is me', username, password);
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});


app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        settings: 'These are the settings '
    });
});



// app.get('/api/prices', jwtMW, (req, res) => {
//     res.json({
//         success: true,
//         myContent: 'this is the price $100'
//     });
// });


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officalError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
