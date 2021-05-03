const router = require('express').Router();
const db = require('../database');
const Schedule = require('../model/Schedule');
const User = require('../model/User');
const util = require("../util");
const nodemailer = require('nodemailer');
const validator = require("../password");






router.get('/', async function(req,res) {
    if (req.session.user){
            var schedules = await db.schedules(); 
          
    }
    let sessionSchedules = schedules;
    res.render("pages/index",{schedules:sessionSchedules});  
});



router.get('/user/:id',async function(req,res) {
    
    if (!req.session.user){
        res.redirect("/");
    } else {
        try {
            var type = req.query.type;
            var r = req.query.result;
        
            var message = util.getMessage(type,r);

            var result = await db.user(req.params.id);
            let id = result[0].id;
            let firstname = result[0].firstname;
            let lastname = result[0].lastname;
            let email = result[0].email;

            result = await db.user_schedules(req.params.id);
            var detailedUser = new User(id,firstname,lastname,email,"");
            
            res.render("pages/user",{user_detail:detailedUser,schedules:result,message:message,type:r});
    } catch {
        res.render("pages/user",{message:"Not able to retrieve this user's details",type:"error"});
    }
}
});



/* Acess routes - signup, login and logout */

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
    
    if (emptyCheck(firstname) || specialCharCheck(firstname)|| emptyCheck(lastname) || specialCharCheck(lastname))  {
        info.firstname = "";
        info.lastname = "";
        res.render("pages/signup",{message:"Please,provide a valid firstname and lastname",type:"error",data:info}); 
    } 
     
    else {
        var message = "",type="signup",r;
        
        try {
            await db.check_email(email);
            if (password !== confirm) { 
                r = "different";
                message = util.getMessage(type,r);
                res.render("pages/signup",{message:message,type:r,data:info});  
            } else { // passwords are the same
                
                if(!validator.schema.validate(password)) {
                    let msg = "Your passwords is not strong enough. The following rules are missing: "+validator.schema.validate(password, { list: true });
                    res.render("pages/signup",{message:msg,type:"error",data:info});  
                }
                  
                else {
                var newUser = new User("",firstname,lastname,email,password);
                try {
                    await db_signup(newUser);
                    try {
                        sendEmail("YOUR-EMAIL@gmail.com",newUser.firstname)
                        res.redirect("/");
                    } catch {
                        //e-mail not sent  
                    }
                } catch {
                    r =  "error_";
                    message = util.getMessage(type,r);
                    res.render("pages/signup",{message:message,type:r});  
                }
            }
            }


        } catch { // e-mail not available
            r = "error";
            message = util.getMessage(type,r);
            res.render("pages/signup",{message:message,type:r});  
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
    //let password = crypto.createHmac("sha256", user.password).update("encrypted message").digest('hex');
    try {
        let returnedUser = await db.login(email);
        let returnedId = returnedUser.id;
        let returnedPassword = returnedUser.pass;
        let returnedFirstname = returnedUser.firstname;
        let returnedLastname = returnedUser.lastname;   
    
        if (password === returnedPassword){
            req.session.user=returnedId;
            
            res.redirect("/");
           
        } else
            res.render("pages/login",{message: 'Wrong password',type:"error"})
        } catch (err) {
            res.render("pages/login",{message: 'User not found',type:"error"})
        }
 
});

router.get('/logout',function(req,res) {
    req.session.destroy();
    res.redirect("/");
});

/* Schedule routes - list, new, update, delete */
router.get('/schedule', async function(req,res) {
    if (req.session.user){
        var type = req.query.type;
        var r = req.query.result;
        
        var message = util.getMessage(type,r);
       
        var result = await db.user_schedules(req.session.user);  
        res.render("pages/user_page",{schedules:result,message:message,type:r});

    } else {
        res.redirect("/");
    } 
});

router.post('/schedule/new', async function(req,res)   {
    
    var aux = req.body;
    var type = "add", r;

    var s = new Schedule(parseInt(req.session.user),aux.date,aux.start_at,aux.end_at);
    try {      
        await db.new_schedule(s);
        var result = await db.user_schedules(req.session.user);  
        r = "success";
    } catch {
        r = "error";      
    }  
    res.redirect("/schedule/?type="+type+"&result="+r);
}); 

router.post('/schedule/update/:id', async function(req,res)   {  
    var type = "update", r,url;
    
    
    if (req.headers.referer.includes("user"))
        url = "/user/"+req.session.user;
    else if (req.headers.referer.includes("schedule"))
        url = "/schedule";

    if (req.session.user){
        let new_date = req.body.date;
        let new_start = req.body.start_at;
        let new_end = req.body.end_at;
        try {
            await db.update_schedule(req.params.id,new_date,new_start,new_end);
            var result = await db.user_schedules(req.session.user);
            r = "success";
        } catch {
            r = "error";
        }   
        res.redirect(url+"?type="+type+"&result="+r);
        } 
    else 
        res.redirect("/"); 
}); 

router.post('/schedule/delete/:id', async function(req,res)   {
    var type = "delete", r,url;
    

    if (req.headers.referer.includes("user"))
        url = "/user/"+req.session.user;
        else if (req.headers.referer.includes("schedule"))
        url = "/schedule";
    if (req.session.user){
        try {
            await db.delete_schedule(req.params.id);
            var result = await db.user_schedules(req.session.user);
            r = "success";
        } catch {
           r = "error";
        }   
        res.redirect(url+"?type="+type+"&result="+r);
    } else 
        res.redirect("/");   
}); 





module.exports = router;


function sendEmail(email,firstname){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'YOUR-EMAIL@gmail.com',
          pass: 'YOUR-PASSWORD'
        }
      });

      var mailOptions = {
        from: 'YOUR-EMAIL@GMAIL.COM',
        to: email,
        subject: 'Welcome',
        text: 'Hello '+firstname+"! Welcome to our webapp."
      };
   
      transporter.sendMail(mailOptions, function(error, info){
      });
}

// returns true if string is empty
function emptyCheck(field){
   
    return (!field || /^\s*$/.test(field));
}

// returns true if string has special char
function specialCharCheck(field){
    var regex = /^[a-zA-Z\s]*$/;
   
    return (!regex.test(field));
}