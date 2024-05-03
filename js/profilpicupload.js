async function upload() {
    const filetoUpload = document.getElementById('file').files[0];
    const token = document.cookie ? document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!token) {
        alert('Kérlek jelentkezz be!');
        window.location.href = '../login.html';
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');

        const res = await fetch(`http://localhost:3000/api/user/avatar?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ picture: base64String })
        });

        if (!res.ok) {
            alert('Hiba történt a kép feltöltése során!');
            return;
        }

        const avatarData = await res.json();

        if (avatarData.status == 200) {
            window.location.reload();
        } else {
            alert('Hiba történt a kép feltöltése során!');
            return;
        }
    };
    reader.readAsDataURL(filetoUpload);
}