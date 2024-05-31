console.log('checklogin.js loaded');

async function checklogin() {
    console.log('checklogin() called');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    ;

    if (token) {
        setTimeout(async () => {
            const getUserData = await fetch(`https://api.dachats.online/api/auth/login?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            const userData = await getUserData.json();
            console.log(userData);

            if (!getUserData.ok) {
                alert(userData.message);
                window.location.href = '../index.html';
                return;
            }
            let status;

            const username = await userData.data.name;
            const avatar = await userData.data.avatar;
            status = await userData.data.status;

            console.log(username);
            console.log(avatar);

            const div = document.getElementById('user-info');
            div.innerHTML = `
        <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="user-img">
        
        <div class="user-info">
            <p class="user-name">${username}</p>
            <p class="user-status">${status}</p>
        </div>`;
        }, 1000);
    } else {
        window.location.href = '../index.html';
        return;
    }
}

checklogin();