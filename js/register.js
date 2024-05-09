async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password1').value;
    const email = document.getElementById('email').value;
    const password2 = document.getElementById('password2').value;

    if (!username || !password || !email || !password2) {
        alert('Nem adtál meg minden adatot!');
        return;
    }

    if (password !== password2) {
        alert('A két jelszó nem egyezik!');
        return;
    }

    const registerData = {
        Username: username,
        Password: password,
        Email: email
    }

    try {
        const registerResponse = await fetch('https://api.dachats.online/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });

        if (!registerResponse.ok) {
            alert('Hiba történt a regisztráció során! (Szerver nem elérhető!)');
            return;
        }

        const responseData = await registerResponse.json();
        console.log(responseData);

        if (responseData.status == 200) {
            location.href = './verify.html';
        } else {
            alert('Hiba történt a regisztráció során! (Rossz adatok!)');
            return;
        }
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}