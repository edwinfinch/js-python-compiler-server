var PythonShell = require('python-shell');
var net = require('net');
var fs = require('fs');
var UserManager = require('.././api/user_manager');

// Keep track of the server clients
var clients = [];

var requestType = {
    JOIN_SERVER: 0,
    PROCESS_PYTHON: 1,
    FETCH_SCRIPTS: 2
};

function sendMessageToClient(socket, jsonMessage){
    console.log("Sending " + JSON.stringify(jsonMessage));
    socket.write(JSON.stringify(jsonMessage));
}

/*
PythonShell.run('test.py', function (err, results) {
    if (err) throw err;
    console.log('finished' + JSON.stringify(results));
});
*/

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname + filename, 'utf-8', function(err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                if(filename !== ".DS_Store"){
                    //console.log(filename);
                    onFileContent(filename, content);
                }
                else{
                    console.log("readFiles rejecting .DS_store file.");
                }
            });
        });
    });
}

var createServer = function(){
    // Start a TCP Server
    net.createServer(function (socket) {

        // Identify this client
        socket.name = socket.remoteAddress + ":" + socket.remotePort

        // Put this new client in the list
        clients.push(socket);

        // Send a nice welcome message and announce
        socket.write("Connected. Please sign in!");
        broadcast(socket.name + " joined the server\n", socket);

        // Handle incoming messages from clients.
        socket.on('data', function (data) {
            broadcast(socket.name + "> " + data + "\n", socket);
            var incomingMessage = JSON.parse(data + "");
            switch(incomingMessage.requestType){
                case requestType.JOIN_SERVER:{
                    var userJSON = {
                        username: incomingMessage.username
                    };
                    UserManager.findUser(userJSON, function(error, docs){
                        if(error){
                            sendMessageToClient(socket, { status: 500, error: error });
                            return;
                        }
                        console.log(docs.length);
                        if(docs.length === 1){
                            socket.userData = docs[0];
                            sendMessageToClient(socket, { requestType: requestType.JOIN_SERVER, status: 200, message: "Logged in" });
                        }
                        else{
                            UserManager.insertUser(userJSON, function(error, docs){
                                if(error){
                                    sendMessageToClient(socket, { status: 500, error: error });
                                    return;
                                }
                                sendMessageToClient(socket, { status: 200, error: "User created", requestType: requestType.JOIN_SERVER });
                            });
                        }
                    });
                    break;
                }
                case requestType.PROCESS_PYTHON:{
                    console.log("Processing python");
                    //TODO check if they are actually logged in as well
                    if(incomingMessage.username){
                        var directory = "scripts/" + incomingMessage.username + "/";
                        if (!fs.existsSync(directory)){
                            fs.mkdirSync(directory);
                            console.log("Created directory");
                        }
                        var filename = directory + Date.now() + ".py";
                        fs.writeFile(filename, incomingMessage.python, function(error){
                            if(error){
                                console.error("Error writing to " + filename + ": " + error);
                                return;
                            }
                            PythonShell.run(filename, function (err, results) {
                                if (err){
                                    var jsonMessage = {
                                        status: 401,
                                        message: "Error processing code",
                                        error: err
                                    };
                                    sendMessageToClient(socket, jsonMessage);
                                    return;
                                }

                                var jsonMessage = {
                                    status: 200,
                                    message: "Finished processing code",
                                    results: results
                                };
                                sendMessageToClient(socket, jsonMessage);
                            });
                        });
                        break;
                    }
                    else{
                        sendMessageToClient(socket, { requestType: requestType.PROCESS_PYTHON, statuts:401, message:"Not logged in" });
                    }
                }
                case requestType.FETCH_SCRIPTS:{
                    var files = [];
                    var windowsError;

                    readFiles("scripts/" + incomingMessage.username + "/",
                        function(filename, content) { //File was read
                            files.push(content);
                        },
                        function(error) { //Windows error
                            windowsError = error;
                        }
                    );
                    setTimeout(function(){
                        var toSend = {};
                        if(windowsError){
                            toSend = {
                                status: 401,
                                message: "Error reading your user directory",
                                error: windowsError
                            }
                        }
                        else{
                            toSend = {
                                status: 200,
                                message: "Read files",
                                files: files
                            }
                        }
                        sendMessageToClient(socket, toSend);
                    }, 300);
                    break;
                }
            }
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            clients.splice(clients.indexOf(socket), 1);
            broadcast(socket.name + " left the server.\n");
        });

        // Send a message to all clients
        function broadcast(message, sender) {
            clients.forEach(function (client) {
                // Don't want to send it to sender
                if (client === sender) return;
                client.write(message);
            });
            // Log it to the server output too
            process.stdout.write(message)
        }

    }).listen(5000);

    // Put a friendly message on the terminal of the server.
    console.log("Culminating server running at port 5000!\n");
}

module.exports = {
    createServer: createServer
}