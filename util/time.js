const db = require('../util/database');
const dateFormat = require("dateformat");


checkDateOverlapping = async function(id,date,start,end) {
    
    if (!checkDuration(start,end)){
        return -1;
    }
      
    const result = await db.user_schedules(id);
       
    if (result.length === 0) {
        return 0;
    }
    
    for (var i = 0; i < result.length; i++) {
        if (result[i].id !== id) {
        let formattedDate = dateFormat(result[i].s_date,"yyyy-mm-dd");
        if (date < formattedDate || date > formattedDate) {
            // if date smaller than the smallest date on the database
            return 0;
        }
            
        else if (date === formattedDate) {
           
            if (!checkTimeOverlapping(start,end,result[i].start_at,result[i].end_at))
                return -2;
        } 
    }
}
    return 0;
}

checkTimeOverlapping = function(new_start,new_end,start,end) { 
    new_start+=":00";
   
    let start_hour = new_start.split(":")[0];
    let end_hour = end.split(":")[0];

    if (start_hour < end_hour)
        return false;

    if (start_hour > end_hour)
        return true;
    
    else {
        let start_min = new_start.split(":")[1];
        let end_min = end.split(":")[1];   
        
        return (start_min >= end_min) ;
    }
   
}

checkDuration = function(start,end) {
    
    var hours = end.split(':')[0] - start.split(':')[0];
    var minutes = end.split(':')[1] - start.split(':')[1];

    minutes = minutes.toString().length<2?'0'+minutes:minutes;
    if(minutes<0){ 
        hours--;
        minutes = 60 + minutes;
    }
    
    if(minutes < 0){ 
        hours--;
        minutes = 60 + minutes;
    }

    if (hours < 0)
        return false;
    
    if (hours === 0 && minutes < 30)
        return false;

    return true;
   

}

module.exports = {
    checkDateOverlapping,
    checkTimeOverlapping,
    checkDuration
}