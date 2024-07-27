async function checklogin() {
    const div = document.getElementById('login');
    let token = null;

    try {
        const cookie = document.cookie;
        token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    } catch (error) {
        document.cookie = 'token=; path=/;';
        document.cookie = 'userid=; path=/;';
        location.reload();
    }

    if (token) {
        const getUserData = await fetch(`https://api.dachats.online/api/auth/login?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        const userData = await getUserData.json();

        if (!userData) {
            alert(userData.message);
            return;
        }

        if (userData.status !== 200) {
            alert(userData.message);
            document.cookie = 'token=; path=/;';
            document.cookie = 'userid=; path=/;';
            location.reload();
            return;
        }

        div.innerHTML = ``

        const username = await userData.data.name;
        const avatar = await userData.data.avatar;


        div.innerHTML = `
        <div>
            <li class="nav-item dropdown usermenu" style="list-style-type: none; ">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img style="border-radius: 360px; width: 40px; height: 40px; gap: 100px; object-fit: cover;" src="https://api.dachats.online/api/files?filename=${avatar}" alt="">
                    <span style="font-size: 120%; color: white; padding: 15px;">${username}</span>
                </a>
                <ul class="dropdown-menu">
                    <li>
                        <a class="dropdown-item"  href="./dashboard/index.html">Üzenőfal</a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" onclick="document.cookie = 'token=; path=/;'; location.reload(); document.cookie = 'userid=; path=/;'; location.reload();">Kijelentkezés</a>
                    </li>
                </ul>
            </li>
        </div>`;
    } else {
        div.innerHTML = '<a class="nav-link" type="button" href="./login.html"><img src="images/login button.png" alt="Login"></a>';
    }
}

checklogin();