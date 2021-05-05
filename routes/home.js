const router = require('express').Router();
const nodemailer = require('nodemailer');
const db = require('../util/database');
const util = require("../util/util");
const validator = require("../util/password");
const User = require("../model/User");
const mail = require("../config/nodemailer.config");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");

router.get('/', async function(req,res) {
    if (req.session.user){
            var schedules = await db.schedules(); 
          
    }
    let sessionSchedules = schedules;
    res.render("pages/index",{schedules:sessionSchedules});  
});

router.get('/signup',function(req,res) {
    res.render("pages/signup");
});

router.post('/signup', async function(req,res) {

    const info = req.body;
    
    const email = info.email;
    const firstname = info.firstname;
    const lastname = info.lastname;
    const password = info.password;
    const confirm = info.confirm;
    
    if (util.emptyCheck(firstname) ||util.specialCharCheck(firstname)|| util.emptyCheck(lastname) || util.specialCharCheck(lastname))  {
        info.firstname = "";
        info.lastname = "";
        res.render("pages/signup",{message:"Please,provide a valid firstname and lastname",type:"error",data:info}); 
    } 
     
    else {
        var message = "",type="signup",r;
        
        try {
            await db.check_email(email);
        } 
        catch {
            r = "error";
            message = util.getMessage(type,r);
            res.render("pages/signup",{message:message,type:r}); 
        }
        if (password !== confirm) {
            r = "different";
            message = util.getMessage(type,r);
            res.render("pages/signup",{message:message,type:r,data:info});  
        } 
        else { // passwords are the same
            if(!validator.schema.validate(password)) {
                let msg = "Your passwords is not strong enough. The following rules are missing: "+validator.schema.validate(password, { list: true });
                res.render("pages/signup",{message:msg,type:"error",data:info});  
            } 

            else {
                var newUser = new User("",firstname,lastname,email,password);
                try {
                   
                    let confirmationCode = jwt.sign({email: newUser.email}, config.secret);
                    await db.db_signup(newUser,confirmationCode);
                    try {  
                        mail.sendConfirmationEmail(newUser.firstname,newUser.email,confirmationCode);
                        res.redirect("/");
                    } catch {
                        console.log("Error sending the e-mail");
                    }
                }
                catch {
                    r =  "error_";
                    message = util.getMessage(type,r);
                    res.render("pages/signup",{message:message,type:r});  
                }
               
            }
        }
    }
   
});

router.get('/login',function(req,res) {
    if (req.session.user){
            res.redirect("/");
    }
    else {
        res.render('pages/login');
    }   
});

router.post('/login', async function(req,res)   {
    var user = req.body;
    var email = user.email;
    let password = user.password;
    //let password = crypto.createHmac("sha256","encrypted message").update(user.password).digest('hex');
   
        let returnedUser = await db.login(email);
        if (returnedUser === -1){
            res.render("pages/login",{message: 'User not found',type:"error"})
        } else if (returnedUser === 0) {
            res.render("pages/login",{message: 'A verification e-mail has been sent',type:"error"})
        } else {
            let returnedId = returnedUser.id;
        let returnedPassword = returnedUser.pass;
        let returnedFirstname = returnedUser.firstname;
        let returnedLastname = returnedUser.lastname;   
    
        if (password === returnedPassword){
            req.session.user=returnedId;
            
            res.redirect("/");
           
        } else
        res.render("pages/login",{message: 'Wrong password',type:"error"})
        }
        
 
});

router.get('/logout',function(req,res) {
    req.session.destroy();
    res.redirect("/");
});

router.get('/confirm/:confirmationCode', async function(req,res) {
  
 if (await db.activate(req.params.confirmationCode)) {
     res.redirect("/")
 } else 
 res.send("code not found");
});

module.exports = router;





