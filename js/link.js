let code;
let token;

document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    code = urlParams.get('code');
    console.log(code);

    if (!code) {
        window.location.href = './index.html';
        return;
    }

    const ptag = document.getElementById('kapott_kod');
    ptag.innerHTML = `Fiókod össze kapcsolása a discord fiókkal! Kapott kód: <span class="text-primary">${code}</span>`;

    const cookie = document.cookie;
    token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!token) {
        window.location.href = './index.html';
        return;
    }
});

async function link() {
    const response = await fetch('https://api.dachats.online/api/user/link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code,
            token,
        })
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        alert(data.message);
        return;
    }

    alert(data.message);
    window.location.href = './index.html';
}


