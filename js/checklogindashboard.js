console.log('checklogin.js loaded');

async function checklogin() {
    console.log('checklogin() called');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    console.log(token);

    if (token) {
        const getUserData = await fetch(`https://api.dachats.online/api/auth/login?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!getUserData.ok) {
            alert('Hiba történt a bejelentkezés során!');
            window.location.href = '../login.html';
            return;
        }

        const userData = await getUserData.json();
        console.log(userData);

        const username = await userData.data.name;
        const avatar = await userData.data.avatar;
        const status = await userData.data.status;

        console.log(username);
        console.log(avatar);

        const div = document.getElementById('user-info');
        div.innerHTML = `
        <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="user-img">

        <div class="user-info">
            <p class="user-name">${username}</p>
            <p class="user-status">${status}</p>
        </div>`;

    } else {
        window.location.href = '../login.html';
        return;
    }
}

checklogin();