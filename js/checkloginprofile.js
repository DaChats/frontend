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

        const userData = await getUserData.json();
        console.log(userData);

        if (!getUserData.ok) {
            alert(userData.message);
            window.location.href = '../login.html';
            return;
        }

        const username = await userData.data.name;
        const avatar = await userData.data.avatar;
        const email = await userData.data.email;
        const id = await userData.data.id;
        const twofa = await userData.data.twofa;

        console.log(twofa)

        const button = document.getElementById('openPopupButton')

        if (twofa) {
            button.innerHTML = 'Kikapcsolás';
            button.addEventListener('click', async () => {
                const disable2fa = await fetch(`https://api.dachats.online/api/2fa?token=${token}&remove=true`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })

                const disable2faData = await disable2fa.json();
                console.log(disable2faData);

                if (disable2faData.status === 200) {
                    alert('2FA sikeresen kikapcsolva');
                    window.location.reload();
                }
            });
        } else {
            button.innerHTML = 'Bekapcsolás'; 
        }

        console.log(username);
        console.log(avatar);

        const div = document.getElementById('profile');
        div.innerHTML = `
        <div class="align-items-center d-flex flex-column">
                    <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img" style="width: 150px; height: 150px; border-radius: 50%;  border: 12.5px solid #1C1C1C;" onerror="this.style.display='none'; document.querySelector('.status-dot').classList.add('online');">
                    <a class="nav-link" class="mt-2"><img src="../../images/pp.png" alt="avatar" class="mt-3"></a>
                </div>
                <div class="row m-3">
                    <div class="col-4"><h6>Megjelenített Név</h6><p>${username}</p></div>
                    <div class="col-4"><h6>E-mail</h6><p>${email}</p></div>
                    <div class="col-4"><h6>Felhasználó Azonosító</h6><p>${id}</p></div>
                </div>
        `;

    } else {
        window.location.href = '../login.html';
        return;
    }
}

checklogin();