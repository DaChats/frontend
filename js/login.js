const form = document.getElementById('login');

const getTokenFromCookie = () => {
    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    return token;
};

const redirectIfLoggedIn = () => {
    const token = getTokenFromCookie();
    if (token) {
        location.href = './dashboard/index.html';
    }
};

redirectIfLoggedIn();

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Nem adtál meg minden adatot!');
        return;
    }

    const loginData = {
        Username: username,
        Password: password
    };

    try {
        const loginResponse = await fetch('https://api.dachats.online/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const responseData = await loginResponse.json();
        console.log(responseData);
        const token = responseData.token;

        if (!loginResponse.ok) {
            alert(responseData.message);
            return;
        }

        const logging = await fetch(`https://api.dachats.online/api/auth/login?token=${token}`);

        if (!logging.ok) {
            alert('Hiba történt a bejelentkezés során! (Szerver nem elérhető!)');
            return;
        } else if (logging.message == "User is not verified") {
            alert('Kérlek hitelesítsd az email címed! (Ellenőrizd a spam mappádat is!)');
            window.location.href = './verify.html';
            return;
        }

        const userData = await logging.json();

        if (userData.status == 200) {
            if (userData.data.twofa) {
                localStorage.setItem('token', token);
                console.log('Token set....')
                location.href = './2fa.html';
            } else {
                const Mainap = new Date();
                Mainap.setDate(Mainap.getDate() + 14);
                document.cookie = `token=${token}; path=/; expires=${Mainap.toUTCString()};`;
                location.href = './dashboard/index.html';
            }
        } else {
            alert(responseData.message);
            return;
        }
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}