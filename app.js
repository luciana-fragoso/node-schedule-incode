var express = require('express');
const app = express();
const dateFormat = require("dateformat");
const session = require('express-session');



const homeRoute = require('./routes/home');



app.use(session({
    name: "session-id",
    secret: "my-secret", // Secret key,
    saveUninitialized: false,
    cookie : {
        maxAge: 1000 * 60 * 60 *24 * 365
    },
    resave: false
}));
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.dateFormat = dateFormat;
    next();
  });
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.use('/',homeRoute);


app.listen(3000,function() {});
