const router = require('express').Router();
const Schedule = require('../model/Schedule');
const db = require('../database');




router.get('/schedule', async function(req,res) {
    if (req.session.user){
        var type = req.query.type;
        var r = req.query.result;
        var message = "";
     
        
        if (r === "success"){
            if (type === "add")
                message = "Schedule successfully added!";  
            if (type === "delete") 
                message = "Schedule successfully removed!";            
        } else if (r == "error") {
            if (type === "add")
                message = "Schedule not added";
            if (type === "delete") 
                message = "Schedule not removed"; 
        }
            var result = await db.user_schedules(req.session.user);  
            res.render("pages/user_page",{schedules:result,message:message,type:r});

    } else {
        res.redirect("/");
    } 
});

router.post('/schedule/delete/:id', async function(req,res)   {
    var type = "delete", r;
    if (req.session.user){
        try {
            await db.delete_schedule(req.params.id);
            var result = await db.user_schedules(req.session.user);
            r = "success";
        } catch {
           r = "error";
        }   
        res.redirect("/schedule/?type="+type+"&result="+r);
    } else 
        res.redirect("/");   
}); 

router.get('/schedule/update/:id', async function(req,res)   {  
    res.send("Update "+req.params.id);
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

module.exports = router;