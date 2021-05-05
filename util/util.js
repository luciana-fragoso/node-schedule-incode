getMessage =  function(type,r){
    var message;
    if (r === "success"){
        if (type === "add")
            message = "Schedule successfully added!";  
        if (type === "delete") 
            message = "Schedule successfully removed!"; 
        if (type === "update")
            message = "Schedule successfully updated!"            
    } else if (r == "error") {
        if (type === "add")
            message = "Schedule not added";
        else if (type === "delete") 
            message = "Schedule not removed"; 
        else if (type === "update")
            message = "Schedule not updated"
        else if (type === "signup")
            message = "Email not available";
        else if (type === "overlap")
            message = "Schedule overlapping"
        else if (type === "short")
            message = "Schedules must be at least 30 min long" 
           
                
    } else if (r === "different"){
        message = "Passwords don't match";
    } else if (r === "error_"){
        message = "Sign up not done";
    }

    return message;
}

 // returns true if string has special char
specialCharCheck = function specialCharCheck(field){
    var regex = /^[a-zA-Z\s]*$/;
    return (!regex.test(field));
}

// returns true if string is empty
emptyCheck = function emptyCheck(field){ 
    return (!field || /^\s*$/.test(field));
}



module.exports = {
    getMessage,
    specialCharCheck,
    emptyCheck, 
    
}