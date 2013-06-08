var WebSocketServer = require('websocket').server;
var http = require('http');

var accounts = [];
var clients = [];

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            // Received message in unsupported format
        }
        var data = JSON.parse(message.utf8Data);
        var activity = data.activity;
        delete data.activity;
        if(data.hasOwnProperty("session")) {
            // check session is valid first
            if(activity === 'blah') {
                //
            } else if(activity === 'blah') {
                //
            } else {
                // Unexpected activity
            }
        } else {
            var response;
            if(activity === 'register') {
                // Validate using require("client/js/validate")
                var account = {
                    username: data.username,
                    email: data.email,
                    password: data.password
                };
                accounts.push(account);
                response = {
                    callback: "registerSuccess",
                    data: {
                        username: data.username
                    }
                };
            } else if(activity === 'login') {
                //
            } else if(activity === '') {
                // check name availability
            } else {
                // Unexpected activity
            }
            var responseString = JSON.stringify(response);
            connection.sendUTF(responseString);
        }
    });
    connection.on('close', function(reasonCode, description) {
        var i;
        for(i=0; i<clients.length; i++)
        {
            if(clients[i] === connection) {
                break;
            }
        }
        clients.splice(i, 1);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
