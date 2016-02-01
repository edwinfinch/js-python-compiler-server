// Load the TCP Library
var mongo = require('mongojs');
var database = mongo("culminating", ["users"]);

//Find the requested user through mongodb
var findUser = function(userInfo, callback){
    database.users.find(userInfo, function(error, docs){
        if(error){
            callback("Error connecting to database");
            return;
        }
        console.log("Got database data " + JSON.stringify(docs));
        callback(null, docs);
    });
}

//Insert a new user
var insertUser = function(data, callback){
    database.users.insert(data, function(error, docs){
        if(error){
            callback("Error insertting to database");
            return;
        }
        console.log("insertt database data " + JSON.stringify(docs));
        callback(null, docs);
    });
}

//Export those functions for access outside of this module
module.exports = {
    findUser: findUser,
    insertUser: insertUser
};