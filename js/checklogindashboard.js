console.log('checklogin.js loaded');

async function checklogin() {
    console.log('checklogin() called');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    console.log(token);

    if (token) {
        const getUserData = await fetch(`http://localhost:3000/api/auth/login?token=${token}`, {
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

        console.log(username);
        console.log(avatar);

    } else {
        window.location.href = '../login.html';
        return;
    }
}

checklogin();