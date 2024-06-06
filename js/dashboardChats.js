let socket;
let currentChatId;
let lastMessageId;
let moreMessages = true
let currentDate = new Date().toDateString();
let lastMessageDate = null;

const formatDateToPretty = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`
    } else if (diffInDays < 7) {
        return `${daysOfWeek[d.getDay()]}`
    } else {
        return d.toLocaleDateString()
    }
}

const button = document.getElementById('send-btn');

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
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

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
        <button class="call-btn" type="button" onclick="voiceCall('${friend.id}', '${userid}')">
            <img src="../images/call.svg" alt="call" class="call-img">
        </button>
    `;

    messagesContainer.innerHTML = '';

    for (let i = 0; i < chatMessages.length; i++) {
        const message = chatMessages[i].message;
        const from = chatMessages[i].from;
        const MessageTime = chatMessages[i].createdAt;

        var urlRegex = /(https?:\/\/[^\s]+)/g;
        var linkedMessage = message.replace(urlRegex, function (url) {
            return '<a href="' + url + '">' + url + '</a>';
        });

        if (from === currentUser.id) {
            html += ` 
            <div class="chat-message">
                <div class="message-details">
                    <p class="user-info">${currentUser.username}<span class="timestamp-real">${formatDateToPretty(MessageTime)}</span></p>
                    <div class="message-main">
                        <img src="https://api.dachats.online/api/files?filename=${currentUser.avatar}" alt="user" class="chat-img">
                        <p class="chat-text">${linkedMessage}</p>
                    </div>
                </div>
            </div>
            `;
        } else {
            html += `
            <div class="chat-message user2">
                <div class="message-details">
                    <p class="user-info">${friend.username} <span class="timestamp-real">${formatDateToPretty(MessageTime)}</span></p>
                    <div class="message-main">
                        <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
                        <p class="chat-text">${linkedMessage}</p>
                    </div>
                </div>
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
    const username = userData.data.username;

    var urlRegex = /(https?:\/\/[^\s]+)/g;

    var linkedMessage = usermessage.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    });

    // Data.now() ban nem vagyok biztos

    let html = `
    <div class="chat-message">
        <div class="message-details">
            <p class="user-info">${username}<span class="timestamp-real">${formatDateToPretty(Date.now())}</span></p>
            <div class="message-main">
                <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img">
                <p class="chat-text">${linkedMessage}</p>
            </div>
        </div>
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

    socket.on('answer', async (data) => {
        console.log('Received answer:', data);

        if (data.answer) {
            console.log('Call accepted');
            alert('Call accepted')
        } else {
            console.log('Call rejected');
            alert('Call rejected')
        }
    });

    socket.on('call', async (data) => {
        console.log('Received call:', data);

        const popupContainer = document.getElementById('popup-container');
        const popupContent = document.getElementById('popup-content');
        const profilePicture = document.getElementById('profile-picture');

        profilePicture.src = `https://api.dachats.online/api/files?filename=${data.avatar}`;
        popupContent.innerText = `Incoming call from ${data.username}`;
        popupContainer.style.display = 'flex';

        const cookie = document.cookie;
        const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

        localStorage.setItem('friendid', data.id);
        localStorage.setItem('userid', userid);

        // sound notification

        setTimeout(() => {
            localStorage.removeItem('friendid');
            localStorage.removeItem('userid');

            closePopup();
        }, 30000);
    });

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
        const username = userData.data.username;
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

        //  Date.now() ban nem vagyok biztos

        let html = `
        <div class="chat-message user2">
            <div class="message-details">
                <p class="user-info">${username} <span class="timestamp-real">${formatDateToPretty(Date.now())}</span></p>
                <div class="message-main">
                    <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img">
                    <p class="chat-text">${linkedMessage}</p>
                </div>
            </div>
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

            if (message.from !== currentUser.id) {
                messageElement.classList.add('user2');
                messageElement.innerHTML = `
                <div class="message-details">
                    <p class="user-info">${friend.username} <span class="timestamp-real">${formatDateToPretty(MessageTime)}</span></p>
                    <div class="message-main">
                        <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
                        <p class="chat-text">${message.message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')}</p>
                    </div>
                </div>
                `;
            } else {
                messageElement.innerHTML = `
                <div class="message-details">
                    <p class="user-info">${currentUser.username}<span class="timestamp-real">${formatDateToPretty(MessageTime)}</span></p>
                    <div class="message-main">
                        <img src="https://api.dachats.online/api/files?filename=${currentUser.avatar}" alt="user" class="chat-img">
                        <p class="chat-text">${message.message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')}</p>
                    </div>
                </div>
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

async function voiceCall(friendid, userid) {
    console.log('Calling friend:', friendid);
    socket.emit('call', { from: userid, to: friendid });
}

function closePopup() {
    const popupContainer = document.getElementById('popup-container');
    popupContainer.style.display = 'none';
}

function acceptCall() {
    console.log('Call accepted');

    const friendid = localStorage.getItem('friendid');
    const userid = localStorage.getItem('userid');

    console.log(friendid, userid);

    localStorage.removeItem('friendid');
    localStorage.removeItem('userid');

    const data = {
        answer: true,
        from: userid,
        to: friendid
    }

    socket.emit('answer', data);

    alert('Call accepted')
    closePopup();
}

function rejectCall() {
    console.log('Call rejected');

    const friendid = localStorage.getItem('friendid');
    const userid = localStorage.getItem('userid');

    console.log(friendid, userid);

    localStorage.removeItem('friendid');
    localStorage.removeItem('userid');

    const data = {
        answer: false,
        from: userid,
        to: friendid
    }

    socket.emit('answer', data);
    closePopup();
}