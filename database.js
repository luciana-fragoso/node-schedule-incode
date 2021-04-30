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
            return result[0];
        }
          
        throw "error";   
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
    const result = await query ("select s.id,s.user_id,s.start_at,s.end_at, s.s_date from schedules s where s.user_id = ? order by s.s_date",[id]);    
    return result;
   
}

new_schedule = async function(s){
    const result = await query("insert into schedules(user_id,s_date,start_at,end_at) values (?,?,?,?)",[s.user_id,s.date,s.start_at,s.end_at]);
    if (result.length > 0)
        throw "error";
    
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
    new_schedule
}

