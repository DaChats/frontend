let token;

document.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token');
    localStorage.removeItem('token');

    if (!token) {
        alert('Nem vagy bejelentkezve!');
        location.href = './index.html';
    }
});

async function verify() {
    const code = document.getElementById('code').value;

    if (!code) {
        alert('Nem adtad meg a kódot!');
        return;
    }

    try {
        const verifyResponse = await fetch(`https://api.dachats.online/api/2fa?token=${token}&code=${code}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!verifyResponse.ok) {
            alert('Hiba történt a hitelesítés során! (Szerver nem nem elérhető!)');
            return;
        }

        const responseData = await verifyResponse.json();

        if (responseData.status == 200) {
            const Mainap = new Date();
            Mainap.setDate(Mainap.getDate() + 14);
            document.cookie = `token=${token}; path=/; expires=${Mainap.toUTCString()};`;
            location.href = './dashboard/index.html';
        } else {
            alert('Hiba történt a hitelesítés során! (Rossz kód!)');
            return;
        }
    } catch (error) {
        console.error('Hiba történt:', error);
    }
}