const router = require('express').Router();
const User = require('../model/User');
const util = require("../util/util");
const db = require('../util/database');

router.get('/:id',async function(req,res) {
    
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



module.exports = router;