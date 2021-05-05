
const router = require('express').Router();
const db = require('../util/database');
const util = require("../util/util");
const time = require("../util/time");
const Schedule = require('../model/Schedule');

router.get('/', async function(req,res) {
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

router.post('/delete/:id', async function(req,res)   {
    
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

router.post('/update/:id', async function(req,res)   {  
    var type = "update", r,url;
    
    if (req.headers.referer.includes("user"))
        url = "/user/"+req.session.user;
    else if (req.headers.referer.includes("schedule"))
        url = "/schedule";

    if (req.session.user){
        let new_date = req.body.date;
        let new_start = req.body.start_at;
        let new_end = req.body.end_at;
        
        const output = await time.checkDateOverlapping(req.session.user,req.params.id,new_date,new_start,new_end);
        
        if (output === -1){
            type = "short";
            r = "error";
            res.redirect("/schedule/?type="+type+"&result="+r);
        }

        else if (output === -2) {
            type = "overlap";
            r = "error";
            res.redirect("/schedule/?type="+type+"&result="+r);
        }
        else if (output === 0) {
        try {
            await db.update_schedule(req.params.id,new_date,new_start,new_end);
            var result = await db.user_schedules(req.session.user);
            r = "success";
        } catch {
            r = "error";
        }   
        res.redirect(url+"?type="+type+"&result="+r);
        } 
    }
    else 
        res.redirect("/"); 
        
});

router.post('/new', async function(req,res)   {
    
    var aux = req.body;
    var type = "add", r;

    var s = new Schedule(parseInt(req.session.user),aux.date,aux.start_at,aux.end_at);
    const output = await time.checkDateOverlapping(req.session.user,aux.date,aux.start_at,aux.end_at);
    
    if (output === -1) {
        type = "short";
        r = "error";
        res.redirect("/schedule/?type="+type+"&result="+r);
    } else if (output === -2) {
        type = "overlap";
        r = "error";
        res.redirect("/schedule/?type="+type+"&result="+r);
    }
    if (output === 0) {
    try {      
        await db.new_schedule(s);
      
        r = "success";
    } catch {
        r = "error";      
            }  
            res.redirect("/schedule/?type="+type+"&result="+r);
    }
   
}); 

module.exports = router;