var webSocket = require("websocket");
var http = require("http");
var accounts = require("./accounts");
var clients = require("./clients");
var levels = require("./levels");

var httpServer = http.createServer(function(request, response) {
  console.log((new Date()) + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

httpServer.listen(8080, function() {
  console.log((new Date()) + " Listening on port 8080");
});

webSocketServer = new webSocket.server({
  httpServer: httpServer,
  autoAcceptConnections: false
});

var originIsAllowed = function(origin) {
  return true;
};

var callbacks = {
  loggedOut: {
    login: {
      register: accounts.register,
      login: accounts.login,
      checkSession: accounts.checkSession,
      checkAvailability: accounts.checkAvailability
    }
  },
  loggedIn: {
    lobby: {
      logout: accounts.logout,
      getAllLevels: levels.getAll,
      getOwnLevels: levels.getOwn,
      newLevel: levels.create,
      playLevel: levels.play,
      rateLevel: levels.rate,
      editLevel: levels.edit,
      deleteLevel: levels.remove
    },
    editor: {
      saveLevel: levels.save,
      exitEditor: levels.discard
    },
    play: {
      //
    }
  }
};

webSocketServer.on("request", function(request) {
  if(!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
    return;
  }

  var connection = request.accept(null, request.origin);
  console.log((new Date()) + " " + connection.remoteAddress + " connected.");

  connection.area = "login";

  connection.on("message", function(message) {
    if(message.type !== "utf8") {
      console.log("Received message in unsupported format.");
      return;
    }
    var messageContent = JSON.parse(message.utf8Data);
    var action = messageContent.action;
    var data = messageContent.data;
    var status = "loggedOut";
    if(messageContent.hasOwnProperty("session")) {
      if(messageContent.session === connection.session) {
        status = "loggedIn";
      } else {
        accounts.logout(connection);
        return;
      }
    }
    var validCallbacks = callbacks[status][connection.area];
    if(action in validCallbacks) {
      validCallbacks[action](connection, data);
    } else {
      console.log("Invalid action: " + action + ".");
    }
  });

  connection.on("close", function(reasonCode, description) {
    if(typeof connection.session !== "undefined") {
      clients.removeClient(connection);
    }
    console.log((new Date()) + " " + connection.remoteAddress + " disconnected.");
  });

});
