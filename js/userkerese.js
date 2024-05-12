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

    const friends = await fetch(`https://api.dachats.online/api/friends?token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const friendsData = await friends.json();

    console.log(friendsData);

    const users = await fetch('https://api.dachats.online/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (users.status == 200) {
        const userData = await users.json();
        console.log(userData);

        if (userData && userData.users && userData.users.length > 0) {
            const filteredUsers = userData.users.filter(user => user.username.includes(kereses));

            console.log(filteredUsers)

            const container = document.getElementById('users');
            container.innerHTML = '';

            filteredUsers.forEach(user => {
                const friendAction = friendsData.data && friendsData.data.includes(user.id) ? `removefriend('${user.id}')` : `addfriend('${user.id}')`;
                const friendActionIcon = friendsData.data && friendsData.data.includes(user.id) ? 'gomb.png' : 'gomb(1).png';

                const userDiv = document.createElement('div');
                userDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <img style="border-radius: 360px; width: 40px; height: 40px;" src="https://api.dachats.online/api/files?filename=${user.avatar}" alt="">
                        <span style="font-size: 100%; color: white; padding: 15px;">${user.username}</span>
                        <a href="#" onclick="${friendAction}"><img src="../images/${friendActionIcon}"></a>
                    </div>
                `;

                container.appendChild(userDiv);
            });

        } else {
            alert('Nincs felhasználó!');
            return;
        }

    }
}