console.log('checklogin.js loaded');

function addToken(token) {
    console.log('addToken() called');
    localStorage.setItem('token', token);
}

async function checklogin() {
    console.log('checklogin() called');
    const div = document.getElementById('login');
    const token = localStorage.getItem('token');

    if (token) {
        const getUserData = await fetch(`http://localhost:3000/api/auth/login?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (!getUserData.ok) {
            alert('Hiba történt a bejelentkezés során!');
            return;
        }

        const userData = await getUserData.json();
        console.log(userData);

        const username = await userData.data.name;
        const avatar = await userData.data.avatar;

        console.log(username);
        console.log(avatar);

        div.innerHTML = `
        <div>
        <li class="nav-item dropdown" style="list-style-type: none; ">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        <img style="border-radius: 360px; width: 40px; height: 40px; gap: 100px;" src="http://localhost:3000/api/files?filename=${avatar}" alt="">
        <span style="font-size: 120%; color: white; padding: 15px;">${username}</span>
        </a>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item"  href="#">Profilom</a></li>
          <li><a class="dropdown-item" href="#" onclick="localStorage.removeItem('token'); location.reload();">Kijelentkezés</a></li>
        </ul>
        </li>
        </div>`;
    } else {
        div.innerHTML = '<a class="nav-link" href="./login.html"><img src="images/login button.png" alt="Login"></a>';
    }
}

checklogin();