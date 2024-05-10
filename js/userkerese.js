async function userkerese(kereses) {
    console.log('userkerese() called');
    console.log(kereses);

    if (kereses.length < 1) {
        console.log('így nehéz lesz..')
        return;
    }

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    const useridCookie = document.cookie.split('; ').find(row => row.startsWith('userid='));
    const userid = useridCookie ? useridCookie.split('=')[1] : null;
    console.log(userid);

    const user = await fetch(`https://api.dachats.online/api/user/friends?token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const userData = await user.json();
    console.log(userData);

    const users = await fetch('https://api.dachats.online/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (users.status == 200) {
        const userData = await users.json();
        console.log(userData);

        const filteredUsers = userData.users.filter(user => user.username.includes(kereses));

        console.log(filteredUsers)

        const container = document.getElementById('users');

        filteredUsers.forEach(user => {
            if (userData.data.includes(id)) {
                container.innerHTML = `
                <div>
                <a role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img style="border-radius: 360px; width: 40px; height: 40px; gap: 100px;" src="https://api.dachats.online/api/files?filename=${user.avatar}" alt="">
                    <span style="font-size: 120%; color: white; padding: 15px;">${user.username}</span>
                </a>
                <a href="#" onclick="removefriend('${user.id}')"><img src="../images/gomb.png"></a>
            </div>`;
            } else {
                container.innerHTML = `
        <div>
            <a role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img style="border-radius: 360px; width: 40px; height: 40px; gap: 100px;" src="https://api.dachats.online/api/files?filename=${user.avatar}" alt="">
                <span style="font-size: 120%; color: white; padding: 15px;">${user.username}</span>
            </a>
            <a href="#" onclick="addfriend('${user.id}')"><img src="../images/gomb(1).png"></a>
        </div>
    `;
            }
            container.appendChild(container.content);
        });

    } else {
        alert('Nincs felhasználó!');
        return;
    }
}