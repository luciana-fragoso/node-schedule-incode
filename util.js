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
        if (type === "delete") 
            message = "Schedule not removed"; 
            if (type === "update")
            message = "Schedule not updated"
            if (type === "signup")
            message = "Email not available";
           
                
    } else if (r === "different"){
        message = "Passwords don't match";
    } else if (r === "error_"){
        message = "Sign up not done";
    }

    return message;
}
module.exports = {getMessage}