async function userloggedin() {
    console.log('userloggedin() called');

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

        if (getUserData.status == 200) {
            const userData = await getUserData.json();
            const h1 = document.getElementById('udv');

            h1.innerHTML = `Üdvözöllek ${userData.data.name}!`;

            console.log('user is logged in: ' + userData.data.name);
        } else {
            alert('Kérlek jelentzzbe előbb!');
            window.location.href = '../login.html';
            return;
        }
    } else {
        alert('Kérlek jelentzzbe előbb!');
        window.location.href = '../login.html';
        return;
    }
}

userloggedin();