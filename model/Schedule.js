function Schedule(user_id,date,start_at,end_at){
    this.user_id = user_id;
    this.date = date;
    this.start_at = start_at;
    this.end_at = end_at;
}

Schedule.prototype.setId = function(user_id){
    this.user_id = user_id;
}

Schedule.prototype.getUserId = function() {
    return this.user_id;
}

Schedule.prototype.setStartAt = function(start_at){
    this.start_at = start_at;
}

Schedule.prototype.getStartAt = function() {
    return this.start_at;
}

Schedule.prototype.setEndAt = function(end_at){
    this.end_at = end_at;
}

Schedule.prototype.getEndAt = function() {
    return this.end_at;
}
module.exports = Schedule;
