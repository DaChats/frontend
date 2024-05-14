let socket;

async function getChats() {
    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!token) {
        console.error('Missing token');
        window.location.href = '../login';
        return;
    }

    const friends = await fetch(`https://api.dachats.online/api/friends?token=${token}`);
    const friendsData = await friends.json();

    console.log(friendsData);

    if (friendsData.status != 200) {
        console.error(friendsData.message);
        return;
    }

    const friendsList = friendsData.data;
    const div = document.getElementById('chats');
    let html = '';

    for (let i = 0; i < friendsList.length; i++) {
        const friendid = friendsList[i];

        const friend = await fetch(`https://api.dachats.online/api/user/${friendid}`);
        const friendData = await friend.json();

        if (friendData.status != 200) {
            console.error(friendData.message);
            return;
        }

        const friendUsername = friendData.data.username;
        const friendavatar = friendData.data.avatar;
        const friendstatus = friendData.data.status;

        console.log(friendUsername);
        console.log(friendavatar);
        console.log(friendstatus);

        const chats = await fetch(`https://api.dachats.online/api/chats?token=${token}`);
        const chatsData = await chats.json();
        console.log(chatsData)

        if (chatsData.status != 200) {
            console.error(chatsData.message);
            return;
        }

        const chatList = chatsData.data;
        let chatid = '';

        for (let i = 0; i < chatList.length; i++) {
            if (chatList[i].members.includes(friendid)) {
                chatid = chatList[i].chatId;
                console.log(chatid);
            }
        }


        html += `
        <div class="chat" onclick="getChat('${chatid}')" id="${chatid}">
                        <div class="chat-img-container">
                            <img src="https://api.dachats.online/api/files?filename=${friendavatar}" alt="user" class="chat-img" onerror="this.style.display='none'; document.querySelector('.status-dot').classList.add('${friendstatus}');">
                            <div class="status-dot-${friendstatus}"></div>
                        </div>
                        <p class="chat-name">${friendUsername}</p>
                    </div>    
        `;
    }

    div.innerHTML = html;
}

getChats();

async function getChat(chatid) {
    console.log('getChat() called');
    console.log(chatid);

    const chatElements = document.querySelectorAll('.chat');
    chatElements.forEach(element => {
        element.classList.remove("active");
    });

    const div = document.getElementById(chatid);
    div.classList.add("active");

    const cookie = document.cookie;
    let token = "";
    token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    const chat = await fetch(`https://api.dachats.online/api/chat?token=${token}&chatid=${chatid}`);
    const chatData = await chat.json();

    console.log(chatData);

    if (chatData.status != 200) {
        console.error(chatData.message);
        return;
    }

    const chatMessages = chatData.data[0].messages;

    console.log(chatMessages);

    let html = '';
    const messagesContainer = document.getElementById('messages');

    messagesContainer.innerHTML = '';

    const currentUser = chatData.data[0].members[0];
    const friend = chatData.data[0].members[1];

    console.log(currentUser);
    console.log(friend);

    for (let i = 0; i < chatMessages.length; i++) {
        const message = chatMessages[i].message;
        const time = chatMessages[i].time;
        const from = chatMessages[i].from;

        var urlRegex = /(https?:\/\/[^\s]+)/g;
    
        var linkedMessage = message.replace(urlRegex, function(url) {
            return '<a href="' + url + '">' + url + '</a>';
        });

        if (from === currentUser.id) {
            html += `
                <div class="chat-message">
                    <img src="https://api.dachats.online/api/files?filename=${currentUser.avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${linkedMessage}</p>
                </div>
            `;
        } else {
            html += `
                <div class="chat-message user2">
                    <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${linkedMessage}</p>
                </div>
            `;
        }

        messagesContainer.innerHTML = html;
    }

    async function connectWS() {
        socket = io(`https://api.dachats.online?token=${token}&chaid=${chatid}`);
        socket.on('connect', () => {
            console.log('Connected to WS server.');
        });

        socket.emit('join', { chatid });
    }

    connectWS();
}

async function sendMessage() {
    const usermessage = document.getElementById('message-input').value;
    const button = document.getElementById('send-btn');
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            button.click();
        }
    });

    if (!usermessage) {
        console.error('Missing message');
        return;
    }

    if (usermessage.length > 1000) {
        console.error('Message too long');
        return;
    }

    if (usermessage.length < 1) {
        console.error('Message too short');
        return;
    }

    const htmlTag = usermessage.match(/<[^>]*>/g);
    if (htmlTag) {
        console.error('HTML tag found');
        return;
    }

    // const link = usermessage.match(/(https?:\/\/[^\s]+)/g);
    // if (link) {
    //     usermessage = usermessage.replace(link[0], `<a href="${link[0]}" target="_blank">${link[0]}</a>`);
    // }

    document.getElementById('message-input').value = '';

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

    const time = new Date().toLocaleTimeString();
    const from = userid;
    const data = { usermessage, time, from };
    socket.emit('message', data);

    const messagesContainer = document.getElementById('messages');

    const user = await fetch(`https://api.dachats.online/api/user/${from}`);
    const userData = await user.json();

    console.log(userData)

    if (userData.status != 200) {
        console.error(userData.message);
        return;
    }

    const avatar = userData.data.avatar;

    var urlRegex = /(https?:\/\/[^\s]+)/g;
    
    var linkedMessage = usermessage.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });

    let html = `
        <div class="chat-message">
            <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img">
            <p class="chat-text">${linkedMessage}</p>
        </div>
    `;

    messagesContainer.innerHTML += html;
}

socket.on('message', (data) => {
    console.log('Received message:', data);

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

    console.log(data.from, data.message, data.time);

    const user = fetch(`https://api.dachats.online/api/user/${data.from}`);
    const userData = user.json();

    console.log(userData);

    if (userData.status != 200) {
        console.error(userData.message);
        return;
    }

    const username = userData.data.username;
    const avatar = userData.data.avatar;
    const id = userData.data.id;

    if (id == userid) {
        console.log('segg')
        return;
    }

    const messagesContainer = document.getElementById('messages');

    var urlRegex = /(https?:\/\/[^\s]+)/g;
    
    var linkedMessage = data.usermessage.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });

    let html = `
    <div class="chat-message user2">
        <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img">
        <p class="chat-text">${linkedMessage}</p>
    </div>
    `;

    messagesContainer.innerHTML += html;
});

socket.on('message', function(data){
    console.log('messagem: ' + data);
});

socket.on('disconnect', () => {
    console.log('Disconnected from WS server.');
});