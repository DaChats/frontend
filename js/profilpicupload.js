async function upload() {
    const token = document.cookie ? document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!token) {
        alert('Kérlek jelentkezz be!');
        window.location.href = '../login.html';
        return;
    }

    try {
        const input = document.getElementById('img');

        const upload = (file) => {
            fetch(`http://localhost:3003/api/avatar?token=${token}`, {
                method: 'POST',
                body: file
            }).then(
                response => response.json()
            ).then(
                success => console.log(success)
            ).catch(
                error => console.log(error) 
            );
        };

        const onSelectFile = () => upload(input.files[0]);
        input.addEventListener('change', onSelectFile, false);
    } catch (error) {
        alert(error.message);
    }
}
