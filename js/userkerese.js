async function userkerese(kereses) {
    console.log('userkerese() called');
    console.log(kereses);

    if (kereses.length < 1) {
        console.log('így nehéz lesz..');
        return;
    }

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    const useridCookie = document.cookie.split('; ').find(row => row.startsWith('userid='));
    const userid = useridCookie ? useridCookie.split('=')[1] : null;
    console.log(userid);

    const friendsResponse = await fetch(`https://api.dachats.online/api/friends?token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const friendsData = await friendsResponse.json();
    console.log(friendsData);

    const usersResponse = await fetch('https://api.dachats.online/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (usersResponse.status == 200) {
        const usersData = await usersResponse.json();
        console.log(usersData);

        if (usersData && usersData.users && usersData.users.length > 0) {
            const filteredUsers = usersData.users.filter(user => user.username.includes(kereses));

            console.log(filteredUsers);

            const container = document.getElementById('users');
            container.innerHTML = '';

            filteredUsers.forEach(user => {
                const isFriend = friendsData.data.some(friend => friend.id === user.id);
                const friendAction = isFriend ? `removefriend('${user.id}')` : `addfriend('${user.id}')`;
                const friendActionIcon = isFriend ? 'gomb.png' : 'gomb(1).png';

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