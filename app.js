var express = require('express');
var dateFormat = require("dateformat");
const db = require('./database');
const session = require('express-session');
const crypto = require('crypto');
const User = require('./model/User');
const Schedule = require('./model/Schedule');
var userSession = null;
//var scheduleRouter = require("./routes/schedules");


var app=express();
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



  
app.get('/', async function(req,res) {
    if (req.session.user){
            var schedules = await db.schedules();     
    }
    let sessionSchedules = schedules;
    res.render("pages/index",{user_session:userSession,schedules:sessionSchedules});  
});

app.get('/schedule', async function(req,res) {
        /*
        var result = await db.user_schedules(req.session.user);
        res.render("pages/user_page",{schedules:result});  
     */
    
   
    if (req.session.user){
        var result = await db.user_schedules(req.session.user);
        res.render("pages/user_page",{schedules:result});  
    } else {
        res.redirect("/");
    }
    
});

app.get('/schedule/delete/:id', async function(req,res)   {

     
     res.send("Delete "+req.params.id);
}); 

app.get('/schedule/update/:id', async function(req,res)   {

    res.send("Update "+req.params.id);
}); 

app.post('/schedule', async function(req,res)   {
    
    var aux = req.body;
    

    var s = new Schedule(parseInt(req.session.user),aux.date,aux.start_at,aux.end_at);
    try {
        db.new_schedule(s);
        res.redirect("back");
    } catch {
        res.render("pages/newSchedule",{message:"Unable to add new schedule"});
    }
  
}); 

app.get('/user/:id',async function(req,res) {
    if (!req.session.user){
        res.redirect("/");
    } else {
    try {
    var result = await db.user(req.params.id);
    let id = result[0].id;
    let firstname = result[0].firstname;
    let lastname = result[0].lastname;
    let email = result[0].email;
    
    
    result = await db.user_schedules(req.params.id);
    var detailedUser = new User(id,firstname,lastname,email,"");
    
    res.render("pages/user",{user_detail:detailedUser,schedules:result});
    } catch {
        res.render("pages/user",{message:"Not able to retrieve this user's details"});
    }
}
});

app.get('/logout',function(req,res) {
   
    req.session.destroy();
    userSession = null;
    res.redirect("/");
});

app.get('/login',function(req,res) {
    if (req.session.user){
            res.redirect("/");
    }
    else {
        res.render('pages/login');
    }
    
});

app.post('/login', async function(req,res)   {
    var user = req.body;
    var email = user.email;
    let password = user.password;
    //let password = crypto.createHmac("sha256", user.password).update("encrypted message").digest('hex');
    try {
    let returnedUser = await db.login(email);
    let returnedId = returnedUser.id;
    let returnedPassword = returnedUser.pass;
    let returnedFirstname = returnedUser.firstname;
    let returnedLastname = returnedUser.lastname;   
    
    if (password === returnedPassword){
        req.session.user=returnedId;
        userSession = new User(returnedId,returnedFirstname,returnedLastname,user.email,returnedPassword);
        res.redirect("/");
    } else
        res.render("pages/login",{message: 'Wrong password'})
    } catch (err) {
        res.render("pages/login",{message: 'User not found'})
    }
 
});


var server=app.listen(3000,function() {});
