use Staffing;
INSERT INTO staff(name,sex,identity_card,phone,account,password,status,privilege) VALUES ('小泽 ','男','330326199909073015','17844532006','admin','123456','在职',true);
-- select * from staff;
-- INSERT INTO task(name,description,status,start) VALUES ('测试任务','任务描述','进行中',now());
-- SELECT LAST_INSERT_ID() FROM task;
-- select * from task;
-- INSERT INTO taskstatus(stage,description,status,taskid) VALUES (1,'过程描述1','进行中',LAST_INSERT_ID());
-- INSERT INTO taskstatus(stage,description,status,taskid) VALUES (2,'过程描述2','未开始',LAST_INSERT_ID());
-- INSERT INTO taskstatus(stage,description,status,taskid) VALUES (3,'过程描述3','未开始',LAST_INSERT_ID());
select * from taskstatus;
INSERT INTO staff2task(staffid,taskid) VALUES (LAST_INSERT_ID(),LAST_INSERT_ID());
select * from staff2task;



