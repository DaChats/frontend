async function userloggedin() {
    console.log('userloggedin() called');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    const useridCookie = document.cookie.split('; ').find(row => row.startsWith('userid='));
    const userid = useridCookie ? useridCookie.split('=')[1] : null;
    ;
    console.log(userid);

    if (token) {
        const getUserData = await fetch(`https://api.dachats.online/api/auth/login?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        if (getUserData.status == 200) {
            const userData = await getUserData.json();
            console.log('user is logged in: ' + userData.data.name);

            if (!userid) {
                document.cookie = `userid=${userData.data.id}; path=/;`;
                console.log('userid cookie set');
            } else {
                console.log('userid cookie already set');
            }
        } else {
            alert('Kérlek jelentzzbe előbb!');
            window.location.href = '../index.html';
            return;
        }
    } else {
        alert('Kérlek jelentzzbe előbb!');
        window.location.href = '../index.html';
        return;
    }
}

userloggedin();