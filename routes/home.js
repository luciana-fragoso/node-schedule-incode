const router = require('express').Router();
const nodemailer = require('nodemailer');
const db = require('../util/database');
const util = require("../util/util");
const validator = require("../util/password");
const User = require("../model/User");
const mail = require("../config/nodemailer.config");
const crypto = require('crypto');
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const { user, reset } = require('../util/database');
var user_id = "";

router.get('/', async function(req,res) {
    let sessionSchedules;
    

    if (req.session.user) {
            var schedules = await db.schedules(); 
            sessionSchedules = schedules;
          
    }
   
res.render("pages/index",{schedules:sessionSchedules});
   
    
});

router.get('/recover',function(req,res) {
    res.render("pages/recover");
});


router.post('/recover',async function(req,res) {
   
    const email = req.body.email;
 
    var message = ""; 
    try {
        const user = await db.check_email(email);
        let name = user.firstname;
        
        let confirmationCode = jwt.sign({email: req.body.email}, config.secret);
        message = "A passwor reset link was sent to your e-mail" ;
        await db.fogottten_password(req.body.email,confirmationCode);
       try {
            await mail.sendPasswordResetLink(name,email,confirmationCode); 
            res.render("pages/recover",{message:message,type:"success"}); 
       } catch {
        res.render("pages/recover",{message:"Unable to send e-mail",type:"error"}); 
           console.log("Reset password e-mail not sent, check credentials");
       }
         
     
    } catch {
        message = "This e-mail is not registered in our system";
        res.render("pages/recover",{message:message,type:"error"});
       
    }
   
});

router.get('/reset/:confirmationCode', async function(req,res) {
    user_id = await db.reset(req.params.confirmationCode);
    if (user_id != false) {
        res.render("pages/reset_password")
    } else 
    res.render("pages/error");
   });

   router.post('/reset', async function(req,res) {
    const first = req.body.first_password;
    const second = req.body.second_password;

    if (first !== second){
        res.render("pages/reset_password",{message:"Passwords don't match",type:"error"});
    }

    else if(!validator.schema.validate(first)) {
        let msg = "Your passwords is not strong enough. The following rules are missing: "+validator.schema.validate(first, { list: true });
        res.render("pages/reset_password",{message:msg,type:"error"});  
    }  
    else {
        
       try {
        let encrypted = crypto.createHmac("sha256","encrypted message").update(first).digest('hex');
           await db.change_password(user_id,encrypted);
           res.redirect("/login");
       }
       catch {
        res.render("pages/reset_password",{message:"Unable to reset the password",type:"error"});  
       }
    }
    
    
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
            r = "error";
            message = util.getMessage(type,r);
            res.render("pages/signup",{message:message,type:r}); 
        } 
        catch {
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
                    let encrypted = crypto.createHmac("sha256","encrypted message").update(password).digest('hex');
                    var newUser = new User("",firstname,lastname,email,encrypted);
                    try {
                       
                        let confirmationCode = jwt.sign({email: newUser.email}, config.secret);
                        
                        await db.db_signup(newUser,confirmationCode);
                        try {  
                            await mail.sendConfirmationEmail(newUser.firstname,newUser.email,confirmationCode);
                            res.redirect("/");
                        } catch {
                            res.render("pages/signup",{message:"Unable to send e-mail",type:"error"});  
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
    let encrypted = crypto.createHmac("sha256","encrypted message").update(user.password).digest('hex');
   
        let returnedUser = await db.login(email);
        if (returnedUser === -1){
            res.render("pages/login",{message: 'User not found',type:"error"})
        } else if (returnedUser === 0) {
            res.render("pages/login",{message: 'A verification e-mail has been sent',type:"success"})
        } else {
            let returnedId = returnedUser.id;
        let returnedPassword = returnedUser.pass;
       
        if (encrypted === returnedPassword){
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
 res.render("pages/error");
});

module.exports = router;





