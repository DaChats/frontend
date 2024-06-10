
async function checklogin() {
    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;;
    if (token) {
        const getUserData = await fetch(`https://api.dachats.online/api/auth/login?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const userData = await getUserData.json();
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

        const div = document.getElementById('profile');
        div.innerHTML = `
                <div class="align-items-center d-flex flex-column">
                    <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="chat-img" style="width: 150px; height: 150px; border-radius: 50%;  border: 12.5px solid #1C1C1C; object-fit: cover;" onerror="this.style.display='none'; document.querySelector('.status-dot').classList.add('online');">
                    <button onclick="openPopup('avatar')" class="mt-2"><img src="../../images/pp.png" alt="avatar" class="mt-3"></button>
                </div>
                <div class="row m-3">
                    <div class="col-xl-4 col-md-6 col-12 my-3"><h6>Megjelenített Név</h6><p>${username}</p></div>
                    <div class="col-xl-4 col-md-6 col-12 my-3"><h6>E-mail</h6><p>${email}</p></div>
                    <div class="col-xl-4 col-md-6 col-12 my-3"><h6>Felhasználó Azonosító</h6><p>${id}</p></div>
                </div>
                <div class="d-flex flex-row justify-content-between align-items-center px-4 pb-2">
                    Two Factor Authentication
                    <button id="openPopupButton" onclick="openPopup('2fa')" class="btn btn-primary"></button>
                </div>
        `;

        const button = document.getElementById('openPopupButton');
        if (twofa) {
            button.innerText = 'Kikapcsolás';
            button.addEventListener('click', async () => {
                const disable2fa = await fetch(`https://api.dachats.online/api/2fa?token=${token}&remove=true`, {
                    method: 'GET',
                });
            });
        } else {
            button.innerText = 'Bekapcsolás';
        }

    } else {
        window.location.href = '../login.html';
        return;
    }
}
checklogin();