window.onload = function () {
	var hichat = new HiChat();
	hichat.init();
};
var HiChat =  function () {
	this.socket = null;
}
HiChat.prototype = {
	init: function () {
		var that = this;
		this.socket = io.connect();
		this.socket.on('connect',function(){
			document.getElementById('info').textContent = '为自己取个昵称吧！';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
		});
		//昵称重复
		this.socket.on('nickExisted',function(){
			document.getElementById('info').textContent = '该昵称已被占用，请重新取一个！';
		});
		//登录成功
		this.socket.on('loginSuccess',function(nickName){
			document.title = 'hichat | ' + nickName ;
			document.getElementById('loginWrapper').style.display = 'none';
			document.getElementById('messageInput').focus();
		});
		//人员进入时系统统一提示
		this.socket.on('system',function(nickName, userCount, type){
			var msg = nickName + (type == 'login' ? '进入群聊':'退出群聊');
			document.getElementById('status').textContent = '当前有' + userCount + '个用户在线';
			that._displayNewMsg('系统消息',msg,'red');
		});
		//接收文本消息
		this.socket.on('newMsg',function(user,msg,color){
			that._displayNewMsg(user,msg,color);
		});
		//接收图片消息
		this.socket.on('newImg',function(user,img){
			that._displayImage(user,img);
		});

		//点击登入
		document.getElementById('loginBtn').addEventListener('click',function () {
			var nickName = document.getElementById('nicknameInput').value;
			if(nickName.trim().length != 0){
				that.socket.emit('login',nickName);
			}else{
				document.getElementById('nicknameInput').focus();
			}
		},false);
		//回车登入
		document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
			if(e.keyCode == 13){
				var nickName = document.getElementById('nicknameInput').value;
				if(nickName.trim().length != 0){
					that.socket.emit('login',nickName);
				}
			}
		},false);

		//发送消息
		document.getElementById('sendBtn').addEventListener('click',function(){
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value,
				color = document.getElementById('colorStyle').value;
			messageInput.value = '';  //清空输入
			messageInput.focus();	  //输入框获取焦点
			if(msg.trim().length != 0){
				that._displayNewMsg('me',msg,color);
				that.socket.emit('postMsg',msg,color);
			}
		},false);
		//回车发送消息
		document.getElementById('messageInput').addEventListener('keyup', function(e) {
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value,
				color = document.getElementById('colorStyle').value;
			if(e.keyCode == 13 && msg.trim().length != 0){
				messageInput.value = '';  //清空输入
				that._displayNewMsg('me',msg,color);
				that.socket.emit('postMsg',msg,color);
			}
		},false);

		//发送图片
		document.getElementById('sendImage').addEventListener('change',function(){
			if(this.files.length > 0){
				console.log(this.files[0])
				var file = this.files[0],
					reader = new FileReader();
				if(!reader){
					that._displayNewMsg('系统消息','您的浏览器不支持相关插件','red');
					return false
				}
				reader.onload = function(e){
					that.socket.emit('img',e.target.result);
					that._displayImage('me',e.target.result)
				}
				reader.readAsDataURL(file);

			}
		},false);

		this._initialEmoji() //初始化表情

		//显示表情框
		document.getElementById('emoji').addEventListener('click',function(e){
			document.getElementById('emojiWrapper').style.display = 'block';
			e.stopPropagation();
		},false);

		//点击其他地方影藏表情框
		document.body.addEventListener('click',function(e){
			var emojiWrapper = document.getElementById('emojiWrapper');
			if(e.target != emojiWrapper){
				emojiWrapper.style.display = 'none';
			}
		},false);

		//选取表情
		document.getElementById('emojiWrapper').addEventListener('click',function(e){
			var MessageInput = document.getElementById('messageInput')
			if(e.target.nodeName.toLowerCase() == 'img'){
				MessageInput.value = MessageInput.value + '[emoji:' + e.target.title + ']';
				MessageInput.focus();
			}
		},false);
	},

	// 显示文本消息
	_displayNewMsg: function(user,msg,color){
		var container = document.getElementById('historyMsg'),
			date = new Date().toTimeString().substring(0,8),
			displayMsg = document.createElement('p');
		msg = this._showEmoji(msg);
		displayMsg.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
		displayMsg.style.color = color || '#000';
		container.append(displayMsg);
		container.scrollTop = container.scrollHeight;
	},
	//显示图片消息
	_displayImage: function(user,img,color){
		var container = document.getElementById('historyMsg'),
			date = new Date().toTimeString().substring(0,8),
			displayMsg = document.createElement('p');
		displayMsg.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + '<img src="' + img +'"/>';
		displayMsg.style.color = color || '#000';
		container.append(displayMsg);
		container.scrollTop = container.scrollHeight;
	},
	//初始渲染表情框
	_initialEmoji: function(){
		var emojiWrapper = document.getElementById('emojiWrapper'),
			docFragment  = document.createDocumentFragment();
		for(var i = 1;i<=75;i++){
			var emojiItem = document.createElement('img');
			emojiItem.src = '../content/emoji/' + i + '.gif';
			emojiItem.title = i;
			docFragment.append(emojiItem);
		}
		emojiWrapper.append(docFragment);
	},
	//消息中显示表情
	_showEmoji: function(msg) {
		console.log(msg)
	    var matchStr, result = msg,
	        reg = /\[emoji:\d+\]/g,
	        emojiIndex,
	        totalEmojiNum = document.getElementById('emojiWrapper').children.length;
	    while (matchStr = reg.exec(msg)) {
	        emojiIndex = matchStr[0].slice(7, -1);  //表情图片名 eg 20
	        // console.log(matchStr)
	        // console.log(emojiIndex)
	        if (emojiIndex > totalEmojiNum) {
	            result = result.replace(matchStr[0], '[X]');
	            // console.log(result)
	        } else {
	            result = result.replace(matchStr[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
	        	// console.log(result)
	        };
	    };
	    return result;
	}
}