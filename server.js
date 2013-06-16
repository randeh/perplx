var WebSocketServer = require("websocket").server;
var http = require("http");
var accounts = require("./accounts");
var clients = require("./clients");

var server = http.createServer(function(request, response) {
  console.log((new Date()) + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(8080, function() {
  console.log((new Date()) + " Server is listening on port 8080");
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

var originIsAllowed = function(origin) {
  return true;
}

wsServer.on("request", function(request) {
  if(!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
    return;
  }

  var connection = request.accept(null, request.origin);
  console.log((new Date()) + " Connection accepted.");

  connection.on("message", function(message) {
    if(message.type !== "utf8") {
      // Received message in unsupported format
    }
    var messageContent = JSON.parse(message.utf8Data);
    var action = messageContent.action;
    var data = messageContent.data;
    if(messageContent.hasOwnProperty("session")) {
      var session = messageContent.session;
      if(session !== connection.session) {
        // Session is wrong for this connection
      }
      switch(action) {
        case "logout":
          accounts.logout(connection, data);
          break;
        default:
          // Unexpected action
          break;
      }
    } else {
      switch(action) {
        case "register":
          accounts.register(connection, data);
          break;
        case "login":
          accounts.login(connection, data);
          break;
        case "checkSession":
          accounts.checkSession(connection, data);
          break;
        default:
          // Unexpected action
          break;
      }
    }
  });

  connection.on("close", function(reasonCode, description) {
    if(connection.session !== undefined) {
      clients.removeClient(connection);
    }
    console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
  });

});
