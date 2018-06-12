//服务器及页面响应部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server), //引入socket.io模块并绑定到服务器
    users = [];
app.use('/', express.static(__dirname + '/www'));
server.listen(8088);

//socket部分
io.on('connection',function(socket){
	socket.on('login', function(nickName){
		if(users.indexOf(nickName) > -1){
			socket.emit('nickExisted');
		}else{
			socket.userIndex = users.length;
			socket.userName = nickName;
			users.push(nickName);
			socket.emit('loginSuccess',nickName);
			io.sockets.emit('system',nickName,users.length,'login');
		}
	});
	socket.on('disconnect',function(){
		users.splice(socket.userIndex,1)
		io.sockets.emit('system',socket.userName,users.length,'logout');
	});
	//广播文本消息
	socket.on('postMsg',function(msg,color){
		socket.broadcast.emit('newMsg',socket.userName,msg,color);
	});
	//广播图片消息
	socket.on('img',function(imgData){
		socket.broadcast.emit('newImg',socket.userName,imgData);
	});

})
// io.on('connection', function(socket) {
//     //接收并处理客户端发送的foo事件
//     socket.on('my other event', function (data) {
//         console.log(data +  new Date());
//         io.sockets.emit('name', {username: 'litingting ' + new Date()});

//     });
// });

