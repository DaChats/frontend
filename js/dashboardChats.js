let socket;
let currentChatId;
let lastMessageId;
let moreMessages = true
let currentDate = new Date().toDateString();
let lastMessageDate = null;

const cookie = document.cookie;
const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

async function connectWS() {
    socket = await io(`https://api.dachats.online?token=${token}`);
}

connectWS();

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
    } else if (diffInDays >= 7) {
        return `A week ago`;
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

    if (friendsData.status != 200) {
        console.error(friendsData.message);
        return;
    }

    const friendsList = friendsData.data;
    const div = document.getElementById('chats');
    let html = '';

    const chats = await fetch(`https://api.dachats.online/api/chats?token=${token}`);
    const chatsData = await chats.json();

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

    if (chatData.status != 200) {
        console.error(chatData.message);
        return;
    }

    const chatMessages = chatData.data.messages;

    const messagesContainer = document.getElementById('messages');
    const userinfo2 = document.getElementById('user2-info');
    const chatcontainer = document.getElementById('chat-container');

    let html = '';

    const currentUser = chatData.data.members[0];
    const friend = chatData.data.members[1];

    userinfo2.innerHTML = ""

    userinfo2.innerHTML = `
    <div class="chat-header">
        <div class="chat-user" id="chat-user">
            <img src="https://api.dachats.online/api/files?filename=${friend.avatar}" alt="user" class="chat-img">
            <p class="chat-name">${friend.username}</p>
        </div>
        <button class="call-btn" type="button" onclick="voiceCall('${friend.id}', '${userid}')">
            <img src="../images/call.svg" alt="call" class="call-img">
        </button>
    </div>
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
    if (!currentChatId) {
        console.warn('No chat selected');
        return;
    }

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

document.addEventListener('DOMContentLoaded', function () {
    function requestNotificationPermission() {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.log("Notification permission denied.");
                }
            });
        } else if (Notification.permission === "granted") {
            console.log("Notification permission already granted.");
        } else {
            console.log("Notification permission denied.");
        }
    }

    function requestMediaPermissions() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
                console.log("Microphone and camera permission granted.");
            })
            .catch(error => {
                console.error("Microphone and camera permission denied or error occurred:", error);
            });
    }

    requestNotificationPermission();
    requestMediaPermissions();

    socket.on('connect', () => {
        console.log('Connected to WS server.');
    });

    socket.on('notify', (data) => {

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

        localStorage.setItem('friendid', data.from);
        localStorage.setItem('userid', userid);

        // sound notification

        const audio = new Audio('../sounds/ringtone.mp3');
        audio.volume = 0.1;
        audio.play();

        setTimeout(() => {
            localStorage.removeItem('friendid');
            localStorage.removeItem('userid');

            audio.pause();
            audio.currentTime = 0;
            closePopup();
        }, 30000);
    });

    socket.on('message', async (data) => {

        if (data.chatid !== currentChatId) {
            console.log('segg2');
            return;
        }

        const cookie = document.cookie;
        const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

        const user = await fetch(`https://api.dachats.online/api/user/${data.from}`);
        const userData = await user.json();

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
    })
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

        const chatData = await fetchMoreMessages();

        if (!chatData) {
            isFetchingMessages = false;
            return;
        }

        const chatMessages = chatData.messages;

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

async function voiceCall(friendid) {
    console.log('Calling friend:', friendid);

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

    localStorage.setItem('friendid', friendid);
    localStorage.getItem('userid', userid);

    window.location.href = './call.html?callTo=' + friendid;
}

function closePopup() {
    const popupContainer = document.getElementById('popup-container');
    popupContainer.style.display = 'none';
}

function acceptCall() {
    const friendid = localStorage.getItem('friendid');
    window.location.href = `./call.html?callFrom=${friendid}`
    closePopup();
}

function rejectCall() {
    console.log('Call rejected');

    const friendid = localStorage.getItem('friendid');
    const userid = localStorage.getItem('userid');

    console.log(friendid, userid);

    window.location.reload();

    localStorage.removeItem('friendid');
    localStorage.removeItem('userid');

    closePopup();
}