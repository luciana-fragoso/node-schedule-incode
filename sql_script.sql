use db_schedules;
drop table if exists user_code;
drop table if exists schedules;
drop table if exists users;
create table schedules(
	id int not null auto_increment,
    user_id int not null,
    s_date date,
    start_at time,
    end_at time,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

create table users(
	id int not null auto_increment,	
    firstname varchar(50),
    lastname varchar(50),
    email varchar(150) unique,
    pass varchar(100),
    primary key (id)
);
create table user_code(
	id int not null auto_increment,
    user_id int not null,
	user_status char(1),
    temp_code varchar(200),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
