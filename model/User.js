function User(id,firstname,lastname,email,password){
    this.id = id || null;
    this.firstname = firstname || null;
    this.lastname = lastname || null;
    this.email = email || null;
    this.password = password || null;
}

User.prototype.setId = function(id){
    this.id = id;
}
User.prototype.setFirstname = function(firstname){
    this.firstname  = firstname;
}

User.prototype.setLastname = function(lastname){
    this.lastname  = lastname;
}

User.prototype.setEmail = function(email){
    this.email  = email;
}

User.prototype.setPassword = function(password){
    this.password  = password;
}

User.prototype.getId = function(){
    return this.id;
}

User.prototype.getFirstname = function() {
    return this.firstname;
}

User.prototype.getLastname = function() {
    return this.lastname;
}

User.prototype.getEmail = function() {
    return this.email;
}

User.prototype.getPassword = function() {
    return this.password;
}
module.exports = User;

