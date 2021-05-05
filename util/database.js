var mysql = require('mysql');
const util = require( 'util' );
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'newuser',
    password : 'pass',
    database : 'db_schedules'
});
const query = util.promisify(connection.query).bind(connection);

login = async function(email) {
        const result = await query("SELECT * FROM users WHERE email = ?",[email]);
        if (result.length > 0) {          
            const newResult = await query("select user_status from user_code where user_id = ?",[result[0].id]);
            if (newResult.length > 0)
                if (newResult[0].user_status === 'a')
                    return result[0];
                else {
                    return 0;
                }
                   
        }
          
        return -1;   
}

schedules = async function(){
    const result = await query ("select u.id,u.firstname,u.lastname,u.email,s.start_at,s.end_at, s.s_date from users u, schedules s where s.user_id = u.id order by u.email, s.s_date;")
    if (result.length > 0) {
        return result;
    }
    throw "error";

}

user =  async function(id){
    const result = await query ("select * from users where id = ?",[id]);   
    if (result.length > 0) {
        return result;
    }
    throw "error";
}

user_schedules = async function(id){
    const result = await query ("select s.id,s.user_id,s.start_at,s.end_at, s.s_date from schedules s where s.user_id = ? order by s.s_date,s.start_at",[id]);    
    return result;
   
}

new_schedule = async function(s){
    const result = await query("insert into schedules(user_id,s_date,start_at,end_at) values (?,?,?,?)",[s.user_id,s.date,s.start_at,s.end_at]);
    if (result.length > 0)
        throw "error";
    
}

delete_schedule = async function(id){

    const result = await query("delete from schedules where id = ?",[id]);
 
    if (result.affectedRows < 1)
        throw "error";
    
}

update_schedule = async function(id,date,start,end){
    
    const result = await query("update schedules set s_date = ?, start_at = ?, end_at = ? where id = ?",[date,start,end,id]);
    
    if (result.affectedRows < 1)
        throw "error";
    
}

check_email = async function(email){

    const result = await query("select * from users where email = ?",[email]);

    if (result.length !== 0) {
        throw "error";
    }

    return true;
       
    
}

db_signup = async function(u,code){
    
    const result = await query("insert into users (email,firstname,lastname,pass) values (?,?,?,?)",[u.email,u.firstname,u.lastname,u.password]);
    if (result.affectedRows === 1){
        const newResult = await query("insert into user_code (user_id,user_status,temp_code) values (?,?,?)",[parseInt(result.insertId),'w',code]);
        if (newResult.affectedRows === 1 )
            return true;
    } 
    return false;
    
}

activate = async function(code){
    const result = await query("select * from user_code where temp_code = ?",[code]);
    if (result.length === 1){
        const newResult = await query("update user_code set user_status = ? where id = ?",['a',parseInt(result[0].id)]);
        if (newResult.affectedRows === 1 )
            return true;
    } return false;
}

module.exports = {
    connection: function(){
        connection.connect(function(err) {
            if (err) {
                console.log("Unable to connect database"+err.stack);
            } 
        });
    },
    login,
    schedules,
    user,
    user_schedules,
    new_schedule,
    delete_schedule,
    update_schedule,
    check_email,
    db_signup,
    activate
}

