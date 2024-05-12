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

        html += `
        <div class="chat" onclick="getChat('${friendid}')" id="${friendid}">
        <img src="https://api.dachats.online/api/files?filename=${friendavatar}" alt="user" class="chat-img">
        <p class="chat-name">${friendUsername}</p>
        </div>
        `;
    }

    div.innerHTML = html;
}

getChats();

async function getChat(friendid) {
    console.log('getChat() called');
    console.log(friendid);

    const chatElements = document.querySelectorAll('.chat');
    chatElements.forEach(element => {
        element.classList.remove("active");
    });

    const div = document.getElementById(friendid);
    div.classList.add("active");
}
