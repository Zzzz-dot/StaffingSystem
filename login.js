var mysql=require('mysql');

//root/manager/staff登录
function login(account, password, callback) {
    var connection = mysql.createConnection({     
        host : 'localhost',
        user : 'root',
        password: '201768',
        database: 'Staffing',
    }); 

    connection.connect(function(err){
        if(err){        
            console.log('Connection Start Error When Login: '+err);
            return;
        }
    });  
    var query = "SELECT name,status, root, privilege FROM staff WHERE account=\'" + account + "\' and password=" + "\'" + password + "\'";
    console.log(query);
    connection.query(query, function (err, result) {
        if (err) {
            console.log("Mysql Query Error When Login");
            return;
        }
        callback(result);
    })
    connection.end(function(err){
        if(err){        
            console.log('Connection End Error When Login: '+err);
            return;
        }
    });
}

module.exports = login;