async function addfriend(id) {
    console.log('addfriend() called');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    const useridCookie = document.cookie.split('; ').find(row => row.startsWith('userid='));
    const userid = useridCookie ? useridCookie.split('=')[1] : null;

    if (!token) {
        alert('Kérlek jelentkezz be!');
        window.location.href = '../login.html';
        return;
    }

    const addfriend = await fetch(`https://api.dachats.online/api/user/addfriend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id,
            token: token
        })
    })

    const addfriendData = await addfriend.json();
    console.log(addfriendData);

    if (addfriend.status == 200) {
        alert('Sikeres hozzáadás!');
        window.location.reload();
    } else {
        alert(addfriendData.message);
        return;
    }
}

async function removefriend(id) {
    console.log('removefriend() called');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!token) {
        alert('Kérlek jelentkezz be!');
        window.location.href = '../login.html';
        return;
    }

    const removefriend = await fetch(`https://api.dachats.online/api/removefriend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: id,
            token: token
        })
    })

    const removefriendData = await removefriend.json();
    console.log(removefriendData);

    if (removefriend.status == 200) {
        alert('Sikeres törlés!');
        window.location.reload();
    } else {
        alert(removefriendData.message);
        return;
    }
}