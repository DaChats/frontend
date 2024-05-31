let socket;
let currentChatId;
let lastMessageId;
let moreMessages = true
let currentDate = new Date().toDateString();
let lastMessageDate = null;

const button = document.getElementById('send-btn');

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}


document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        button.click();

        pressed = true;
    }
});

setTimeout(() => {
    if (pressed) {
        pressed = false;
        return;
    }
}, 700);

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

    const chats = await fetch(`https://api.dachats.online/api/chats?token=${token}`);
    const chatsData = await chats.json();
    console.log(chatsData)

    if (chatsData.status != 200) {
        console.error(chatsData.message);
        return;
    }

    const chatList = chatsData.data;
    let chatid;

    for (let i = 0; i < friendsList.length; i++) {
        const friendid = friendsList[i].id;

        const friendUsername = friendsList[i].username;
        const friendavatar = friendsList[i].avatar;
        const friendstatus = friendsList[i].status;

        console.log(friendUsername);
        console.log(friendavatar);
        console.log(friendstatus);

        for (let i = 0; i < chatList.length; i++) {
            if (chatList[i].members.includes(friendid)) {
                chatid = chatList[i].chatId;
                console.log(chatid);
            }
        }


        html += `
        <div class="chat" onclick="getChat('${chatid}')" id="${chatid}">
                        <div class="chat-img-container">
                        <img src="https://api.dachats.online/api/files?filename=${friendavatar}" alt="${friendUsername}" class="chat-img" onerror="this.style.display='none'; document.querySelector('.status-dot').classList.add('${friendstatus}');">
                            
                            <div class="status-dot-${friendstatus}"></div>
                        </div>
                        <a onclick="getChat('${chatid}')" id="${chatid}"><p class="chat-name">${friendUsername}</p></a>
                    </div>    
        `;
    }

    div.innerHTML = html;
}

getChats();

async function getChat(chatid) {
    console.log('getChat() called');
    console.log(chatid);

    currentMessages = [];
    moreMessages = true;

    const chatElements = document.querySelectorAll('.chat');
    chatElements.forEach(element => {
        element.classList.remove("active");
    });

    const div = document.getElementById(chatid);
    div.classList.add("active");

    const cookie = document.cookie;
    let token = "";
    token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    const chat = await fetch(`https://api.dachats.online/api/chat?token=${token}&chatid=${chatid}&limit=20`);
    const chatData = await chat.json();

    console.log(chatData);

    if (chatData.status != 200) {
        console.error(chatData.message);
        return;
    }

    const chatMessages = chatData.data.messages;

    console.log(chatMessages);

    const messagesContainer = document.getElementById('messages');
    const userinfo2 = document.getElementById('user2-info');

    let html = '';

    const currentUser = chatData.data.members[0];
    const friend = chatData.data.members[1];

    console.log(currentUser);
    console.log(friend);

    userinfo2.innerHTML = ""

    userinfo2.innerHTML = `
        <div class="chat-user" id="chat-user">
            <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
            <p class="chat-name">${friend.username}</p>
        </div>

        <button class="call-btn" type="button" onclick="voiceCall('${chatid}')">
            <img src="../images/call.svg" alt="call" class="call-img">
        </button>
    `;

    messagesContainer.innerHTML = '';

    for (let i = 0; i < chatMessages.length; i++) {
        const message = chatMessages[i].message;
        const time = chatMessages[i].time;
        const from = chatMessages[i].from;
        const MessageTime = chatMessages[i].createdAt;
        const messageDate = new Date(MessageTime).toDateString();
        console.log('Message date:', messageDate);
    
        if (messageDate !== lastMessageDate) {
            console.log('Creating date separator...');
            lastMessageDate = messageDate;
            html += `<div class="chat-date-separator"><span>${formatDate(new Date(messageDate))}</span></div>`;
        }
    
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        var linkedMessage = message.replace(urlRegex, function (url) {
            return '<a href="' + url + '">' + url + '</a>';
        });
    
        if (from === currentUser.id) {
            html += `
                <div class="chat-message">
                    <img src="https://api.dachats.online/api/files?filename=${currentUser.avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${linkedMessage}</p>
                    <p class="chat-time">${time}</p>
                </div>
            `;
        } else {
            html += `
                <div class="chat-message user2">
                    <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${linkedMessage}</p>
                    <p class="chat-time">${time}</p>
                </div>
            `;
        }
    }
    
    messagesContainer.innerHTML = html;

    function scrollToBottom() {
        var container = document.getElementById("messages");
        messagesContainer.scrollTop = container.scrollHeight;
    }

    scrollToBottom();

    socket.emit('join', chatid);

    currentChatId = chatid;

    lastMessageId = chatMessages[0]._id;
}

let pressed = false;

async function sendMessage() {
    const usermessage = document.getElementById('message-input').value;

    if (!usermessage) {
        console.warn('Missing message');
        return;
    }

    if (usermessage.length > 1000) {
        console.warn('Message too long');
        return;
    }

    if (usermessage.length < 1) {
        console.warn('Message too short');
        return;
    }

    if (usermessage.trim().length < 1) {
        console.warn('Message too short');
        return;
    }

    const htmlTag = usermessage.match(/<[^>]*>/g);
    if (htmlTag) {
        console.warn('HTML tag found');
        return;
    }

    document.getElementById('message-input').value = '';

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

    const time = new Date().toLocaleTimeString();
    const from = userid;
    const data = { usermessage, time, from, chatid: currentChatId };
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

    var linkedMessage = usermessage.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    });

    let html = `
        <div class="chat-message">
            <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img">
            <p class="chat-text">${linkedMessage}</p>
            <p class="chat-time">${time}</p>
        </div>
    `;

    messagesContainer.innerHTML += html;

    function scrollToBottom() {
        var container = document.getElementById("messages");
        messagesContainer.scrollTop = container.scrollHeight;
    }

    scrollToBottom();
}

const cookie = document.cookie;
const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

async function connectWS() {
    socket = await io(`https://api.dachats.online?token=${token}`);
}

connectWS();

document.addEventListener('DOMContentLoaded', function () {
    socket.on('connect', () => {
        console.log('Connected to WS server.');
    });

    socket.on('notify', (data) => {
        console.log('Received notify:', data);

        Notification.requestPermission().then(async function (result) {
            console.log(result);

            const user = await fetch(`https://api.dachats.online/api/user/${data.from}`);
            const userData = await user.json();

            if (userData.status != 200) {
                console.log('caca')
                return;
            }

            const username = userData.data.username;

            if (result == 'granted') {
                const notification = new Notification('Új üzenet', {
                    body: `${username} Üzenetet küldött: ${data.usermessage}`,
                    icon: 'https://api.dachats.online/api/files?filename=logo.png'
                });

                notification.onclick = () => {
                    window.focus();
                }

                const audio = new Audio('../sounds/notify.wav');
                audio.play();
            }
        });
    })

    socket.on('message', async (data) => {
        console.log('Received message:', data);

        if (data.chatid !== currentChatId) {
            console.log('segg2');
            return;
        }

        const cookie = document.cookie;
        const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

        console.log(data.from, data.usermessage, data.time);

        const user = await fetch(`https://api.dachats.online/api/user/${data.from}`);
        const userData = await user.json();

        console.log(userData);

        if (userData.status != 200) {
            console.error(userData.message);
            return;
        }

        const avatar = userData.data.avatar;
        const id = userData.data.id;

        if (id == userid) {
            console.log('segg');
            return;
        }

        const messagesContainer = document.getElementById('messages');

        const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop === messagesContainer.clientHeight;

        var urlRegex = /(https?:\/\/[^\s]+)/g;

        var linkedMessage = data.usermessage.replace(urlRegex, function (url) {
            return '<a href="' + url + '">' + url + '</a>';
        });

        let html = `
        <div class="chat-message user2">
            <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img">
            <p class="chat-text">${linkedMessage}</p>
            <p class="chat-time">${data.time}</p>
        </div>
        `;

        messagesContainer.innerHTML += html;

        if (isAtBottom) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    socket.io.on('ping', () => {
        console.log('Ping');
    });
});

async function fetchMoreMessages() {
    const chat = await fetch(`https://api.dachats.online/api/chat?token=${token}&chatid=${currentChatId}&limit=20&beforeId=${lastMessageId}`);

    const chatData = await chat.json();

    if (chatData.status != 200) {
        console.error(chatData.message);
        return;
    }

    if (chatData.data.messages.length < 1) {
        moreMessages = false;
        return
    }

    return chatData.data
}

let isFetchingMessages = false;

document.querySelector('#messages').addEventListener('scroll', async function () {
    const messagesContainer = document.getElementById('messages');

    if (messagesContainer.scrollTop === 0 && moreMessages && !isFetchingMessages) {
        isFetchingMessages = true;
        console.log('Fetching more messages...');

        const chatData = await fetchMoreMessages();

        if (!chatData) {
            isFetchingMessages = false;
            return;
        }

        const chatMessages = chatData.messages;

        console.log('Fetched messages:', chatMessages);

        const currentUser = chatData.members[0];
        const friend = chatData.members[1];

        const fragment = document.createDocumentFragment();
        chatMessages.reverse().forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            const MessageTime = message.createdAt;
            const messageDate = new Date(MessageTime).toDateString();
            console.log('Message date:', messageDate);

            if (messageDate !== lastMessageDate) {
                console.log('Creating date separator...');
                lastMessageDate = messageDate;

                const dateSeparator = document.createElement('div');
                dateSeparator.classList.add('chat-date-separator');
                dateSeparator.innerHTML = `<span>${formatDate(new Date(messageDate))}</span>`;
                fragment.appendChild(dateSeparator);
            }

            if (message.from !== currentUser.id) {
                messageElement.classList.add('user2');
                messageElement.innerHTML = `
                    <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${message.message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')}</p>
                    <p class="chat-time">${message.time}</p>
                `;
            } else {
                messageElement.innerHTML = `
                    <img src="https://api.dachats.online/api/files?filename=${currentUser.avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${message.message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')}</p>
                    <p class="chat-time">${message.time}</p>
                `;
            }
            fragment.appendChild(messageElement);
        });

        const scrollPosition = messagesContainer.scrollHeight - messagesContainer.scrollTop;
        messagesContainer.insertBefore(fragment, messagesContainer.firstChild);
        messagesContainer.scrollTop = messagesContainer.scrollHeight - scrollPosition;

        lastMessageId = chatMessages[chatMessages.length - 1]._id;

        setTimeout(() => {
            isFetchingMessages = false;
        }, 500);
    }
});


function scrollToBottom() {
    const container = document.getElementById("messages");
    container.scrollTop = container.scrollHeight;
}