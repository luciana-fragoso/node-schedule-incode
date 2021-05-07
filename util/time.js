const db = require('../util/database');
const dateFormat = require("dateformat");


checkDateOverlapping = async function(user_id,id,date,start,end) {
 
    if (!checkDuration(start,end)){
        return -1;
    }
      
    const result = await db.user_schedules(user_id);
       
        
    
    for (var i = 0; i < result.length; i++) {
        if (result[i].id !== id) {
            let formattedDate = dateFormat(result[i].s_date,"yyyy-mm-dd");
        
        if (date < formattedDate || date > formattedDate) {
            return 0;
        }
            
        else if (date === formattedDate) {
            if (!checkTimeOverlapping(date,start,end,result[i].start_at,result[i].end_at))
                return -2;
        } 
    
        }
        
}
    return 0;
}



checkTimeOverlapping = function(date,new_start,new_end,old_start,old_end) { 
    new_start+=":00";
    new_end+=":00";

    let new_start_hour = new_start.split(":")[0];
    let new_start_minute = new_start.split(":")[1];

    let new_end_hour = new_end.split(":")[0];
    let new_end_minute = new_end.split(":")[1];

    let old_start_hour = old_start.split(":")[0];
    let old_start_minute = old_start.split(":")[1];

    let old_end_hour = old_end.split(":")[0];
    let old_end_minute = old_end.split(":")[1];

    let year = date.split("-")[0];
    let month = date.split("-")[1];
    let day = date.split("-")[2];

    var d1 = new Date(year,month,day,new_end_hour,new_end_minute,"00");
    var d2 = new Date(year,month,day,old_start_hour,old_start_minute,"00");

    var d3 = new Date(year,month,day,new_start_hour,new_start_minute,"00");
    var d4 = new Date(year,month,day,old_end_hour,old_end_minute,"00");

    if ((d1<=d2) || (d3>=d4))
        return true;

    return false;

   

   
   


    
   
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