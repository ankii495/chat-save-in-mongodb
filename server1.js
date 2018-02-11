var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server);
usernames = [];
var rand = require('random-number-between');
var mongojs = require('mongojs');
var db = mongojs('ChatDB', ['chat']);
var bodyParser = require('body-parser');

server.listen(3005);

console.log("server running ......")

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.use(bodyParser.json());


io.on('connection', (socket) =>{
    console.log("Socket connected");
	
	 socket.on('getMessage', (msg)=>{
        console.log('message from client: ' + msg)
        index=[]
        if(msg === 'no')
            index[0] = 7
		
        else
            index = rand(0, 6, 1)
        
        https.get('http://127.0.0.1:5004/sign_users'+'?name='+msg, (resp) => {
		  let data = '';
		 
		  // A chunk of data has been recieved.
		  resp.on('data', (chunk) => {
		    data += chunk;
		  });

		 resp.on('end', () => {
		    socket.emit('message', data);
		  });
		 
		 }).on("error", (err) => {
		  console.log("Error: " + err.message);
		});
    });

    socket.on('new user', function(data,callback){
        if(usernames.indexOf(data) != -1){
            callback(false);
        }else{
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsernames();
        }
    });

    //update username
    function updateUsernames(){
        io.sockets.emit('usernames', usernames);
    }

    //Send message
    socket.on('send message', function(data){
		var objHash = {
		  user : socket.username,
          chat: data
        };
		db.chat.insert(objHash,function(err, doc){
		  console.log("doc"+doc);
		  io.sockets.emit('new message',{msg:data, user:socket.username});
        });
    });

    //Disconnect
    socket.on('disconnect',function(data){
         if(!socket.usernames){
             return;
         }

         usernames.splice(usernames.indexOf(socket.username, 1));
         updateUsernames();
    });
});