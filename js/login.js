const form = document.getElementById('login');

const getTokenFromCookie = () => {
    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    return token;
};

const redirectIfLoggedIn = () => {
    const token = getTokenFromCookie();
    if (token) {
        location.href = './index.html';
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
        const loginResponse = await fetch('http://localhost:3000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        if (!loginResponse.ok) {
            alert('Hiba történt a bejelentkezés során! (Szerver nem elérhető!)');
            return;
        }

        const responseData = await loginResponse.json();
        console.log(responseData);
        const token = responseData.token;

        const logging = await fetch(`http://localhost:3000/api/auth/login?token=${token}`);

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
            const Mainap = new Date();
            Mainap.setDate(Mainap.getDate() + 14);
            document.cookie = `token=${token}; expires=${Mainap.toUTCString()}; path=/;`;
            console.log('Token added to cookie');
            location.href = './index.html';
        } else {
            alert('Hiba történt a bejelentkezés során! (Rossz adatok!)');
            return;
        }
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}