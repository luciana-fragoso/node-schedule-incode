const router = require("express").Router;

router.get('/', async function(req,res) {
        if (req.session.user){
                var schedules = await db.schedules();     
        }
        let sessionSchedules = schedules;
        res.render("pages/index",{user_session:userSession,schedules:sessionSchedules});  
});


module.exports = {router};