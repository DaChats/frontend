async function upload() {
    const filetoUpload = document.getElementById('file').files[0];
    const token = document.cookie ? document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!token) {
        alert('Kérlek jelentkezz be!');
        window.location.href = '../login.html';
        return;
    }

    const formData = new FormData();
    formData.append('avatar', filetoUpload);

    try {
        const res = await fetch(`http://localhost:3000/api/avatar?token=${token}`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Hiba történt a kép feltöltése során!');
        }

        const avatarData = await res.json();

        if (avatarData.status === 200) {
            window.location.reload();
        } else {
            throw new Error('Hiba történt a kép feltöltése során!');
        }
    } catch (error) {
        alert(error.message);
    }
}
