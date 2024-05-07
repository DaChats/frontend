async function userkerese(kereses) {
    console.log('userkerese() called');
    console.log(kereses);

    if (kereses.length < 3) {
        console.log('így nehéz lesz..')
        return;
    }

    const useridCookie = document.cookie.split('; ').find(row => row.startsWith('userid='));
    const userid = useridCookie ? useridCookie.split('=')[1] : null;
    console.log(userid);

    const users = await fetch('http://localhost:3000/api/users', {
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
            container.innerHTML = `
        <div>
            <a role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img style="border-radius: 360px; width: 40px; height: 40px; gap: 100px;" src="http://localhost:3000/api/files?filename=${user.avatar}" alt="">
                <span style="font-size: 120%; color: white; padding: 15px;">${user.username}</span>
                <!-- Add here the friend button! onclick="addfriend(user.id)" and then the + button pic -->
            </a>
        </div>
    `;
        container.appendChild(container.content);
        });

    } else {
        alert('Nincs felhasználó!');
        return;
    }
}