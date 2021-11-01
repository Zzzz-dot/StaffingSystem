var mysql=require('mysql');
var moment=require('moment');
const { query } = require('express');
var pool =  mysql.createPool({
	host : 'localhost',
	user : 'root',
	password: '201768',
    database: 'Staffing',
    multipleStatements: true
});
var mydb = new Object();

//root用户添加员工信息
mydb.registerstaff=function(name,sex,identity_card,phone,department,title,account,password,privilege,callback){
    //status='在职'
    //root=false
    var check_query="SELECT id FROM staff WHERE account=\'" + account + "\' OR identity_card=\'" + identity_card+"\' OR phone=\'"+ phone+"\'";
    console.log(check_query);
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When RegisterStaff');
            return;
        }
        connection.query(check_query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When RegisterStaff');
                callback("Failed")
                return;
            }
            if (result.length != 0) {
                callback("Existed");
                return;
            }
            var register_query="INSERT INTO staff(name,sex,identity_card,phone,department,title,account,password,privilege,status,root) VALUES"+"(\'"+name+"\',\'"+sex+"\',\'"+identity_card+"\',\'"+phone+"\',\'"+department+"\',\'"+title+"\',\'"+account+"\',\'"+password+"\',"+privilege+",\'在职\',false)";
            console.log(register_query);
            connection.query(register_query,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When RegisterStaff');
                    callback("Failed")
                    return;
                }
                callback("Inserted");
            });
        });
        connection.release();
    });
}

//root用户删除员工信息
mydb.deletestaff=function(id,account,callback){
    var check_query="SELECT id,account FROM staff WHERE id=\'" + id + "\'";
    console.log(check_query);
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When DeleteStaff');
            return;
        }
        connection.query(check_query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When DeleteStaff');
                callback("Failed")
                return;
            }
            if (result.length == 0) {
                callback("NoExisted");
                return;
            }
            if(result[0].account==account){
                console.log('Delete Error When DeleteStaff');
                callback("Failed")
                return;
            }
            var delete_query="DELETE FROM staff WHERE id=\'" + id + "\'";
            console.log(delete_query);
            connection.query(delete_query,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When DeleteStaff');
                    callback("Failed")
                    return;
                }
                callback("Deleted");
            });
        });
        connection.release();
    });
}

mydb.fire=function(id,callback){
    var query="UPDATE staff SET status =\'离职\' WHERE id=" + id;
    console.log(query);
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When UpdateStaff');
            callback("Failed");
            return;
        }
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When Fire');
                callback("Failed");
                return;
            }
            callback("Updated");
        });
    })
}

mydb.authorize=function(id,callback){
    var query="UPDATE staff SET privilege =true WHERE id=" + id;
    console.log(query);
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When UpdateStaff');
            callback("Failed");
            return;
        }
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When Authorize');
                callback("Failed");
                return;
            }
            callback("Updated");
        });
    })
}

//root用户更新员工信息
mydb.updatestaff_root=function(name,phone,department,title,account,password,callback){
    var check_query="SELECT account FROM staff WHERE account=\'" + account + "\'";
    console.log(check_query);
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When UpdateStaff');
            return;
        }
        connection.query(check_query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When UpdateStaff');
                return;
            }
            if (result.length == 0) {
                callback("NoExisted");
                return;
            }
            var update_query="UPDATE staff SET name=\'"+name+"\',phone=\'"+phone+"\',department=\'"+department+"\',title=\'"+title+"\',password=\'"+password+"\' WHERE account=\'" + account + "\'";
            console.log(update_query);
            connection.query(update_query,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When UpdateStaff');
                    return;
                }
                callback("Updated");
            });
        });
        connection.release();
    });
}

//员工更新自己信息
mydb.updatestaff_self=function(phone,account,password,callback){
    var check_query="SELECT account FROM staff WHERE account=\'" + account + "\'";
    console.log(check_query);
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When UpdateStaff');
            return;
        }
        connection.query(check_query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When UpdateStaff');
                return;
            }
            if (result.length == 0) {
                callback("NoExisted");
                return;
            }
            var update_query="UPDATE staff SET phone=\'"+phone+"\',password=\'"+password+"\' WHERE account=\'" + account + "\'";
            console.log(update_query);
            connection.query(update_query,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When UpdateStaff');
                    return;
                }
                callback("Updated");

            });
        });
        connection.release();
    });
}

//查看自己具体信息
mydb.myprofile=function(account,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetMyProfile');
            return;
        }
        var query="SELECT * FROM staff WHERE account=\'"+account+"\'";
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetMyProfile');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//查看自己任务列表
mydb.mytask=function(account,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetMyTask');
            return;
        }
        var query="SELECT id,name FROM task WHERE id IN (SELECT taskid FROM staff2task WHERE staffid IN (SELECT id FROM staff WHERE account=\'"+account+"\')) AND status=\'进行中\'";
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetMyTask');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//查看自己消息列表
mydb.mymsg=function(account,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetMyTask');
            return;
        }
        var query="SELECT id,name,time FROM message WHERE id IN (SELECT msgid FROM staff2msg WHERE staffid = (SELECT id FROM staff WHERE account=\'"+account+"\')) ORDER BY id ASC";
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetMyMsg');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//查看自己消息状态
mydb.mymsgstatus=function(account,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetMyTask');
            return;
        }
        var query="SELECT msgid,readed FROM staff2msg WHERE staffid = (SELECT id FROM staff WHERE account=\'"+account+"\') ORDER BY msgid ASC";
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetMyMsgStatus');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//------------------------------------------------

//由staffid查看员工具体信息
mydb.profile=function(staffid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetProfile');
            return;
        }
        var query="SELECT * FROM staff WHERE id="+staffid;
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetProfile');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//由staffid找出拥有的任务
mydb.owntask=function(staffid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When OwnTask');
            return;
        }
        var query="SELECT id,name FROM task WHERE id IN (SELECT taskid FROM staff2task WHERE staffid = \'"+staffid+"\')";
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When OwnTask');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//所有员工简要信息 id,name,sex,phone,department,title
mydb.allstaff=function(callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetStaff');
            return;
        }
        var query="SELECT id,name,sex,phone,department,title,status FROM staff";
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetStaff');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//由staffid查看任务具体信息
mydb.task=function(taskid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetTask');
            return;
        }
        var query="SELECT * FROM task WHERE id="+taskid;
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetTask');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//由taskid找出拥有者
mydb.taskbelongto=function(taskid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When TaskBelongTo');
            return;
        }
        var query="SELECT id,name FROM staff WHERE id = (SELECT staffid FROM staff2task WHERE taskid = \'"+taskid+"\')";
        console.log(query);
        connection.query(query, function(err, result){
            if(err)	{
                console.log('Mysql Query Error When TaskBelongTo');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

//所有任务简要信息 id,name,status
mydb.alltask=function(callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When GetTasks');
            return;
        }
        var query="SELECT id,name,creater,score,status FROM task";
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When GetTasks');
                return;
            }
            callback(result);
        });
        connection.release();
    });
}

mydb.deletemsg=function(account,msgid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When DeleteMsg');
            callback("Failed");
            return;
        }
        var query="SELECT id FROM staff WHERE account=\'"+account+"\'";
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When DeleteMsg');
                callback("Failed");
                return;
            }
            var query="DELETE FROM staff2msg WHERE staffid="+result[0].id+" AND msgid="+msgid;
            console.log(query)
            connection.query(query,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When DeleteMsg');
                    callback("Failed");
                    return;
                }
                callback("Deleted");
            });
        });
        connection.release();
    });
}

mydb.readmsg=function(account,msgid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When ReadMsg');
            callback("Failed");
            return;
        }
        var query="SELECT id FROM staff WHERE account=\'"+account+"\'";
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When ReadMsg');
                callback("Failed");
                return;
            }
            var query="UPDATE staff2msg SET readed=true WHERE staffid="+result[0].id+" AND msgid="+msgid;
            connection.query(query,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When ReadMsg');
                    callback("Failed");
                    return;
                }
                callback("Readed");
            });
        });
        connection.release();
    });
}

mydb.scanmsg=function(msgid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When ReadMsg');
            callback("Failed");
            return;
        }
        var query="SELECT name,description FROM message WHERE id="+msgid;
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When ReadMsg');
                callback("Failed");
                return;
            }
            callback("Find",result[0])
        });
        connection.release();
    });

}

//注册任务以及各个状态
mydb.registertask=function(account,name,description,deadline,status,staff,callback){
    //status='进行中'
    //start
    pool.getConnection(function(err, connection){
        if (err){
            callback("Failed")
            console.log('Get Connection Error When RegisterTask');
            return;
        }
        connection.beginTransaction(function(err) {
            if (err){
                callback("Failed")
                console.log('Get Connection Error When RegisterTask');
                return;
            }
            var q1="SELECT id from staff where account=\'"+account+"\'";
            console.log(q1);
            connection.query(q1,  function(err, result){
                if(err)	{
                    callback("Failed")
                    console.log('Mysql Query Error When RegisterTask');
                    return;
                }
                var start=moment().format('YYYY-MM-DD HH:mm:ss');
                var q2="INSERT INTO task(creater,name,description,status,start,deadline) VALUES ("+result[0].id+",\'"+name+"\',\'"+description+"\',\'进行中\',\'"+start+"\',\'"+deadline+"\')";
                console.log(q2);
                connection.query(q2,  function(err, result){
                    if(err)	{
                        return connection.rollback(function() {
                            callback("Failed")
                            throw err;
                        });
                    }
                    var id=result.insertId
                    var q3="INSERT INTO taskstatus(stage,description,status,taskid) VALUES "
                    for (let i=0;i<status.length;i++){
                        var stage=i+1;
                        if(i==0){
                            q3+="("+stage+",\'"+status[i]+"\',\'进行中\',"+id+"),"
                        }else{
                            q3+="("+stage+",\'"+status[i]+"\',\'未开始\',"+id+"),"
                        }
                    }
                    q3=q3.substr(0,q3.length-1);
                    console.log(q3);
                    connection.query(q3,  function(err, result){
                        if(err)	{
                            return connection.rollback(function() {
                                callback("Failed")
                                throw err;
                            });
                        }
                        var q4="SELECT id from staff where identity_card IN (";
                        for (let i=0;i<staff.length;i++){
                            q4+="\'"+staff[i]+"\',"
                        }
                        q4=q4.substr(0,q4.length-1);
                        q4+=")";
                        console.log(q4);
                        connection.query(q4,  function(err, result){
                            if(err)	{
                                return connection.rollback(function() {
                                    callback("Failed")
                                    throw err;
                                });
                            }
                            if(result.length<staff.length){
                                return connection.rollback(function() {
                                    callback("WrongID")
                                });
                            }
                            var q5="INSERT INTO staff2task(staffid,taskid) VALUES "
                            for (let i=0;i<result.length;i++){
                                q5+="("+result[i].id+","+id+"),"
                            }
                            q5=q5.substr(0,q5.length-1);
                            console.log(q5);
                            connection.query(q5,  function(err, result){
                                if(err)	{
                                    return connection.rollback(function() {
                                        throw err;
                                    });
                                }
                                connection.commit(function(err) {
                                    if (err) {
                                      return connection.rollback(function() {
                                        throw err;
                                      });
                                    }
                                    callback("Inserted");
                                });
                            })
                        })
                    })
                    //callback("Inserted",result);
                });
            });
        })


        connection.release();
    });
}

mydb.deletetask=function(id,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When DeleteMsg');
            callback("Failed");
            return;
        }
        var query="DELETE FROM task WHERE id=\'" + id + "\'";
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When DeleteMsg');
                callback("Failed");
                return;
            }
            callback("Deleted")
        });
        connection.release();
    });
}

//任务完成，写入完成时间，修改任务状态（查询仅当所有阶段完成，且任务状态不为未完成）
mydb.finishtask=function(id,score,callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When DeleteMsg');
            callback("Failed");
            return;
        }
        var now=moment().format('YYYY-MM-DD HH:mm:ss');
        var query="UPDATE task SET status = \'已完成\',score = " +score+ ",end=\'" +now+"\' WHERE id=" + id + " AND status=\'进行中\'";
        console.log(query);
        connection.query(query,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When DeleteMsg');
                callback("Failed");
                return;
            }
            callback("Updated")
        });
        connection.release();
    });
}

//任务未完成，修改任务状态 系统定时查询
mydb.unfinishtask=function(callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When DeleteMsg');
            callback("Failed");
            return;
        }
        var query1="SELECT id,name,creater,deadline FROM task WHERE status=\'进行中\'";
        console.log(query1);
        connection.query(query1,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When DeleteMsg');
                callback("Failed");
                return;
            }
            var count=0;
            var deadtaskid=new Array();
            var deadtaskname=new Array();
            var creater=new Array();
            var now=moment().format('YYYY-MM-DD HH:mm:ss');
            console.log(now)
            var query2="UPDATE task SET status = \'未完成\' WHERE id IN (";
            for(let i=0;i<result.length;i++){
                if(moment(now).isBefore(result[i].deadline)==false){
                    count++;
                    deadtaskid.push(result[i].id);
                    deadtaskname.push(result[i].name);
                    creater.push(result[i].creater);
                    query2+=result[i].id+","
                }
            }
            if(count==0){
                callback("NoFind")
                return;
            }
            query2=query2.substr(0,query2.length-1);
            query2+=")";
            console.log(query2);
            connection.query(query2,  function(err, result){
                if(err)	{
                    console.log('Mysql Query Error When DeleteMsg');
                    callback("Failed");
                    return;
                }
                var name="任务未完成通知"
                var query3="INSERT INTO message(name,description,time) VALUES ";
                for (let i=0;i<deadtaskid.length;i++){
                    let description="任务ID:"+deadtaskid[i]+",任务名:"+deadtaskname[i]+";超时未完成，请及时查看"
                    query3+="(\'"+name+"\',\'"+description+"\',\'"+now+"\'),"
                }
                query3=query3.substr(0,query3.length-1);
                console.log(query3);
                connection.query(query3,  function(err, result){
                    if(err)	{
                        console.log('Mysql Query Error When DeleteMsg');
                        callback("Failed");
                        return;
                    }
                    var msgidstart=result.insertId;
                    var query4="INSERT INTO staff2msg(staffid,msgid) VALUES "  
                    for (let i=0;i<deadtaskid.length;i++){
                        query4+="("+creater[i]+","+(msgidstart+i)+"),"
                    }
                    query4=query4.substr(0,query4.length-1);       
                    console.log(query4);
                    connection.query(query4,  function(err, result){
                        if(err)	{
                            console.log('Mysql Query Error When DeleteMsg');
                            callback("Failed");
                            return;
                        }
                        callback("Updated");
                    })       
                });
            });
        });
        connection.release();
    }); 
}

mydb.remindtask=function(callback){
    pool.getConnection(function(err, connection){
        if (err){
            console.log('Get Connection Error When DeleteMsg');
            callback("Failed");
            return;
        }
        var query1="SELECT id,name,deadline FROM task WHERE status=\'进行中\'";
        console.log(query1);
        connection.query(query1,  function(err, result){
            if(err)	{
                console.log('Mysql Query Error When DeleteMsg');
                callback("Failed");
                return;
            }
            var count=0;
            var deadtaskid=new Array();
            var name="任务即将超时";
            var now=moment();
            var query2="INSERT INTO message(name,description,time) VALUES ";
            for(let i=0;i<result.length;i++){
                let ddl=moment(result[i].deadline,"YYYY-MM-DD HH:mm:ss")
                if(ddl.diff(now,'hour')<=24&&ddl.diff(now,'hour')>23){
                    count++;
                    deadtaskid.push(result[i].id)
                    let description="任务ID:"+result[i].id+",任务名:"+result[i].name+";将在24小时内过期，请及时完成，截止时间"+moment(result[i].deadline).format("YYYY-MM-DD HH:mm:ss");
                    query2+="(\'"+name+"\',\'"+description+"\',\'"+now.format("YYYY-MM-DD HH:mm:ss")+"\'),"
                }
            }
            if(count==0){
                callback("NoFind")
                return;
            }
            query2=query2.substr(0,query2.length-1);
            console.log(query2)
            connection.query(query2,function(err,result){
                if(err)	{
                    console.log('Mysql Query Error When DeleteMsg');
                    callback("Failed");
                    return;
                }
                var longquery="";
                var msgidstart=result.insertId;
                for (let i=0;i<deadtaskid.length;i++){
                    longquery+="INSERT INTO staff2msg(msgid,staffid) SELECT a.msgid,b.staffid FROM (SELECT id as msgid FROM message WHERE id="+(msgidstart+i)+") a JOIN (SELECT staffid FROM staff2task WHERE taskid="+deadtaskid[i]+") b;";
                }
                console.log(longquery);
                connection.query(longquery,function(err,result){
                    if(err)	{
                        console.log('Mysql Query Error When DeleteMsg');
                        callback("Failed");
                        return;
                    }
                    callback("Updated")
                })
            })
        })
        connection.release();
    })
}


mydb.scantask=function(taskid,callback){
    pool.getConnection(function(err, connection){
        if (err){
            callback("Failed")
            console.log('Get Connection Error When ScanTask');
            return;
        }
        var task;
        var s1;
        var s2;
        var q1="SELECT * FROM task WHERE id = "+ taskid;
        console.log(q1);
        connection.query(q1,function(err,result){
            if (err){
                callback("Failed")
                console.log('Get Connection Error When ScanTask');
                return;
            }
            task=result;
            var q2="SELECT * FROM taskstatus WHERE taskid ="+ taskid+ " ORDER BY stage";
            console.log(q2);
            connection.query(q2,function(err,result){
                if (err){
                    callback("Failed")
                    console.log('Get Connection Error When ScanTask');
                    return;
                }
                s1=result;
                var q3="SELECT id,name FROM staff WHERE id IN (SELECT staffid FROM staff2task WHERE taskid ="+ taskid+")";
                console.log(q3);
                connection.query(q3,function(err,result){
                    if (err){
                        callback("Failed")
                        console.log('Get Connection Error When ScanTask');
                        return;
                    }
                    s2=result;
                    callback("Find",task,s1,s2)
                })
            })
        })
        connection.release();
    })

}

//完成某个阶段，修改当前阶段为完成，若存在下个阶段，改为进行中
mydb.finishstage=function(taskid,stage,callback){
    pool.getConnection(function(err, connection){
        if (err){
            callback("Failed")
            console.log('Get Connection Error When FinishStage');
            return;
        }
        var q1="UPDATE taskstatus SET status=\'已完成\' WHERE taskid="+taskid+" AND stage="+stage;
        console.log(q1);
        connection.query(q1,function(err){
            if (err){
                callback("Failed")
                console.log('Get Connection Error When FinishStage');
                return;
            }
            var next=stage/1+1;
            var q2="UPDATE taskstatus SET status=\'进行中\' WHERE taskid="+taskid+" AND stage="+next;
            console.log(q2);
            connection.query(q2,function(err){
                if (err){
                    callback("Failed")
                    console.log('Get Connection Error When FinishStage');
                    return;
                }
                callback("Updated")
            })
        })
    })

}


module.exports = mydb;