use Staffing;
show tables;
CREATE TABLE IF NOT EXISTS `staff`(
`id` INT UNSIGNED AUTO_INCREMENT,
`name` VARCHAR(10) NOT NULL,
`sex` ENUM('男','女') NOT NULL,
`identity_card` CHAR(18) NOT NULL UNIQUE,
`phone` VARCHAR(15) NOT NULL UNIQUE,
`department` VARCHAR(15) NOT NULL,
`title` VARCHAR(15) NOT NULL,
`account` VARCHAR(15) NOT NULL UNIQUE,
`password` VARCHAR(15) NOT NULL,
`status` ENUM('在职','离职') NOT NULL,
`privilege` BOOL DEFAULT false NOT NULL,
`root` BOOL DEFAULT false NOT NULL,
PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `task`(
`id` INT UNSIGNED AUTO_INCREMENT,
`creater` INT UNSIGNED NOT NULL,
`name` VARCHAR(25) NOT NULL,
`description` VARCHAR(500) NOT NULL,
`status` ENUM('进行中','已完成','未完成') NOT NULL,
`score` TINYINT UNSIGNED,
`start` DATETIME NOT NULL, 
`end` DATETIME,
`deadline` DATETIME NOT NULL,
PRIMARY KEY(`id`),
FOREIGN KEY(`creater`) REFERENCES staff(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `taskstatus`(
`id` INT UNSIGNED AUTO_INCREMENT,
`stage` TINYINT UNSIGNED NOT NULL,
`description` VARCHAR(250) NOT NULL,
`status` ENUM('未开始','进行中','已完成') NOT NULL,
`finish` DATETIME,
`taskid` INT UNSIGNED NOT NULL,
PRIMARY KEY(`id`),
UNIQUE(taskid,stage),
FOREIGN KEY(`taskid`) REFERENCES task(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `staff2task`(
`staffid` INT UNSIGNED,
`taskid` INT UNSIGNED,
PRIMARY KEY(`staffid`,`taskid`),
FOREIGN KEY(`staffid`) REFERENCES staff(id) ON DELETE CASCADE,
FOREIGN KEY(`taskid`) REFERENCES task(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `message`(
`id` INT UNSIGNED AUTO_INCREMENT,
`name` VARCHAR(25) NOT NULL,
`description` VARCHAR(500) NOT NULL,
`time` DATETIME NOT NULL,
PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `staff2msg`(
`staffid` INT UNSIGNED,
`msgid` INT UNSIGNED,
`read` BOOL DEFAULT false NOT NULL,
PRIMARY KEY(`staffid`,`msgid`),
FOREIGN KEY(`staffid`) REFERENCES staff(id) ON DELETE CASCADE,
FOREIGN KEY(`msgid`) REFERENCES message(id) ON DELETE CASCADE
);

show tables;
-- show columns from staff;
-- show columns from task;
-- show columns from taskstatus;
-- show columns from staff2task;

