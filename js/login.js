const form = document.getElementById('login');

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
    }

    try {
        const loginResponse = await fetch('http://localhost:3000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        if (!loginResponse.ok) {
            alert('Hiba történt a bejelentkezés során!');
            return;
        }

        const responseData = await loginResponse.json();
        console.log(responseData);
        const token = responseData.token;

        const logging = await fetch(`http://localhost:3000/api/auth/login?token=${token}`)

        if (!logging.ok) {
            alert('Hiba történt a bejelentkezés során!');
            return;
        }

        const userData = await logging.json();

        if (userData.status == 200) {
            const Mainap = new Date();
            Mainap.setDate(Mainap.getDate() + 14);
            document.cookie = `token=${token}; path=/; expires=${Mainap.toUTCString()};`;

            console.log('Token added to coockie');
            location.href = './index.html';
        } else {
            alert('Hiba történt a bejelentkezés során!');
            return;
        }
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}
