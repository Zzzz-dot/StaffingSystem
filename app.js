var express = require('express');
var app = express();
var session=require('express-session')
var moment=require('moment')
var cron=require('node-cron')
var login=require('./login.js')
var mydb=require('./db.js');
const { insert } = require('./db.js');

//设置静态资源目录
app.use(express.static(__dirname + '/FlexStart'));

//解析发送数据，两种格式
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//render html文件
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', 'FlexStart');

app.use(session({
  secret: 'This is a secret', //建议使用 128 个字符的随机字符串
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 3600 * 1000 }
}));

//初始页面 ok
app.get('/', function (req, res) {
  req.session.login = false; 
  req.session.account = null;
  req.session.name = null;
  req.session.root = null;
  req.session.privilege = null;
  res.render('index.html');
});

//登陆成功 ok
app.get('/homepage', function (req, res) {
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  res.render('homepage.html',{name:req.session.name});
});

//登录操作 ok
app.post('/login', function (req, res) {
  var account = req.body.account;
  var password = req.body.password;
  login(account, password, function (result) {
    if (result.length == 1 && result[0].status=='在职') {
      req.session.login = true; 
      req.session.account = account;
      req.session.name = result[0].name;
      if (result[0].root == true) {
        req.session.root = true;
      }
      else {
        req.session.root = false;
      }
      if (result[0].privilege == true) {
        req.session.privilege = true;
      }
      else {
        req.session.privilege = false;
      }
      console.log("Login Successed");
      res.json({login: true, code: 200 });
    }
    else {
      req.session.login = false;
      req.session.account = null;
      req.session.name = null;
      req.session.root = null;
      req.session.privilege = null;
      console.log("Login Failed");
      res.json({ login: false, code: 200 });
    }
  })
});

//登出操作 ok
app.get('/logout', function (req, res) {
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  req.session.login = false; 
  req.session.account = null;
  req.session.name = null;
  req.session.root = null;
  req.session.privilege = null;
  res.render('index.html');
});

//ok
app.post('/registerstaff',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.root==false){
    console.log("NOT Root");
    res.json({ state: "NoRoot", code: 200 });
    return;
  }
  var name = req.body.name;
  var sex = req.body.sex;
  var identity_card = req.body.identity_card;
  var phone = req.body.phone;
  var department = req.body.department;
  var title = req.body.title;
  var account = req.body.account;
  var password = req.body.password;
  var privilege = req.body.privilege;
  mydb.registerstaff(name,sex,identity_card,phone,department,title,account,password,privilege,function(state){
    if(state=="Existed"){
      res.json({ state: "Existed", code: 200 });
    }
    else if(state=="Inserted"){
      res.json({ state: "Inserted", code: 200 });
    }
    else{
      res.json({ state: "Failed", code: 200 });
    }
  })
})

//ok
app.post('/deletestaff',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.root==false){
    console.log("NOT Root");
    res.json({ state: "NoRoot", code: 200 });
    return;
  }
  var account=req.session.account
  var id = req.body.id;
  mydb.deletestaff(id,account,function(state){
    if(state=="NoExisted"){
      res.json({ state: "NoExisted", code: 200 });
    }
    else if(state=="Deleted"){
      res.json({ state: "Deleted", code: 200 });
    }
    else{
      res.json({ state: "Failed", code: 200 });
    }
  })
})

//ok
app.post('/updatestaff',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  //前端中对修改行为进行限制
  if (req.session.root==true){
    let name = req.body.name;
    let phone = req.body.phone;
    let department = req.body.department;
    let title = req.body.title;
    let account = req.body.account;
    let password = req.body.password;
    mydb.updatestaff_root(name,phone,department,title,account,password,function(state){
      if(state=="NoExisted"){
        res.json({ state: "NoExisted", code: 200 });
      }
      else if(state=="Updated"){
        res.json({ state: "Updated", code: 200 });
      }
      else{
        res.json({ state: "Failed", code: 200 });
      }
    })
  }
  else{
    let phone = req.body.phone;
    let account = req.session.account;
    let password = req.body.password;
    mydb.updatestaff_self(phone,account,password,function(state){
      if(state=="NoExisted"){
        res.json({ state: "NoExisted", code: 200 });
      }
      else if(state=="Updated"){
        res.json({ state: "Updated", code: 200 });
      }
      else{
        res.json({ state: "Failed", code: 200 });
      }
    })
  }
})

//ok
app.post('/authorize',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.root==false){
    console.log("NOT Allow");
    res.json({allow:false});
    return;
  }
  var staffid=req.body.staffid;
  mydb.authorize(staffid,function(status){
    if(status=="Updated"){
      res.json({state: "Updated"})
    }else{
      res.json({state:"Failed"})
    }
  })
})

//ok
app.post('/fire',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.root==false){
    console.log("NOT Allow");
    res.json({allow:false});
    return;
  }
  var staffid=req.body.staffid;
  mydb.fire(staffid,function(status){
    if(status=="Updated"){
      res.json({state: "Updated"})
    }else{
      res.json({state:"Failed"})
    }
  })
})

//查看个人信息 ok
app.get('/myinfo',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var account=req.session.account;
  var temp;
  var taskid=new Array();
  var taskname=new Array();
  mydb.myprofile(account,function(result){
    if(result.length==1){
      temp=result[0]
      temp.privilege=temp.privilege==true?'是':'否';
      temp.root=temp.root==true?'是':'否';
      mydb.mytask(account,function(result){
        for(let i=0;i<result.length;i++){
          taskid.push(result[i].id)
          taskname.push(result[i].name)
        }
        res.render("profile.html",{profile:temp,taskid:taskid,taskname:taskname,myself:true})
      })
    }
    else{
      console.log("Failed To Load Personal Info")
    }
  })
})

//查看个人消息通知 ok
app.get('/mymsg',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var account=req.session.account;
  mydb.mymsg(account,function(result){
    mydb.mymsgstatus(account,function(status){
      for(let i=0;i<result.length;i++){
        result[i].time=moment(result[i].time).format("YYYY-MM-DD HH:mm:ss");
        status[i].readed=status[i].readed==0?'未读':'已读'
      }
      res.render('msglist.html',{result:result,status:status,name:req.session.name});
    })
  })
})

//员工列表中单个员工信息 ok
app.get('/profile',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.root==false){
    console.log("NOT Allow");
    res.json({allow:false});
    return;
  }
  var staffid=req.query.staffid;
  var temp;
  var taskid=new Array();
  var taskname=new Array();
  mydb.profile(staffid,function(result){
    if(result.length==1){
      temp=result[0]
      temp.privilege=temp.privilege==true?'是':'否';
      temp.root=temp.root==true?'是':'否';
      mydb.owntask(staffid,function(result){
        for(let i=0;i<result.length;i++){
          taskid.push(result[i].id)
          taskname.push(result[i].name)
        }
        res.render("profile.html",{profile:temp,taskid:taskid,taskname:taskname,myself:false})
      })
    }
    else{
      console.log("Failed To Load Personal Info")
    }
  })
})

//任务列表中单个任务信息
app.get('/task',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.privilege==false){
    console.log("NOT Allow");
    res.json({allow:false});
    return;
  }
  var taskid=req.body.taskid;
  mydb.task(taskid,function(result){
    if(result.length==1){
      mydb.taskbelongto(taskid,function(result){
        if(result.length!=0){
          //res
        }
      })
    }
  })
})

//员工列表 ok
app.get('/allstaff',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.privilege==false){
    console.log("NOT Allow");
    res.json({allow:false});
    return;
  }
  mydb.allstaff(function(result){
    res.render("stafflist.html",{result:result,name:req.session.name});
  })
})

//任务列表 ok
app.get('/alltask',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.privilege==false){
    console.log("NOT Allow");
    res.json({allow:false});
    return;
  }
  mydb.alltask(function(result){
    res.render("tasklist.html",{result:result,name:req.session.name});
  })
})

//ok
app.post('/deletemsg',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var account=req.session.account;
  var msgid=req.body.msgid;
  mydb.deletemsg(account,msgid,function(status){
    res.json({state:status});
  })
})

//ok
app.post('/readmsg',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var account=req.session.account;
  var msgid=req.body.msgid;
  mydb.readmsg(account,msgid,function(status){
    res.json({state:status});
  })
})

//ok
app.post('/scanmsg',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var msgid=req.body.msgid;
  mydb.scanmsg(msgid,function(status,result){
    res.json({state:status,result:result});
  })
})

//ok
app.post('/registertask',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var account=req.session.account;
  var name=req.body.name;
  var description=req.body.description;
  var deadline=req.body.deadline;
  var status=req.body.status;
  var staff=req.body.staff;
  mydb.registertask(account,name,description,deadline,status,staff,function(status){
    res.json({state:status});
  })
})

//ok
app.post('/deletetask',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  if (req.session.root==false){
    console.log("NOT Root");
    res.json({ state: "NoRoot"});
    return;
  }
  var taskid=req.body.taskid;
  mydb.deletetask(taskid,function(status){
    res.json({state:status});
  })
})

//ok
app.post('/finishtask',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var taskid=req.body.taskid;
  var score=req.body.score;
  mydb.finishtask(taskid,score,function(status){
    res.json({state:status});
  })
})

//ok
app.post('/scantask',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var taskid=req.body.taskid;
  mydb.scantask(taskid,function(state,task,s1,s2){
    if(state=="Find"){
      description=new Array();
      status=new Array();
      for(let i=0;i<s1.length;i++){
        description.push(s1[i].description);
        status.push(s1[i].status);
      }
      task[0].start=moment(task[0].start).format("YYYY-MM-DD HH:mm:ss")
      if(task[0].end){
        task[0].end=moment(task[0].end).format("YYYY-MM-DD HH:mm:ss")
      }
      task[0].deadline=moment(task[0].deadline).format("YYYY-MM-DD HH:mm:ss")
      res.json({state:state,task:task[0],description:description,status:status,staff:s2});
    }else{
      res.json({state:state});
    }
  })
})

app.post('/finishstage',function(req,res){
  if (req.session.login==false||req.session.login==undefined){
    console.log("NOT Login");
    res.render('session_expire.html');
    return;
  }
  var taskid=req.body.taskid;
  var stage=req.body.stage
  mydb.finishstage(taskid,stage,function(state){
    res.json({state:state})
  })
})


app.use(express.static('public'));

//minute
cron.schedule("0 * * * * *",function(){
  mydb.unfinishtask(function(state){
    console.log("UnfinishedTask:"+state);
  })
})

//hour
cron.schedule("0 0 * * * *",function(){
  mydb.remindtask(function(state){
    console.log("RemindTask:"+state);
  })
})
 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
});
