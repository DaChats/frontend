document.addEventListener('DOMContentLoaded', function () {
    var inputTextElement = document.getElementById('inputText');
    if (inputTextElement) {
        inputTextElement.addEventListener('input', function () {
            console.log('input event fired');
            var inputText = document.getElementById('inputText').value;
            var formattedText = marked.parse(inputText);
            document.getElementById('preview').innerHTML = formattedText;
        });
    }
});

function kuldes() {
    var inputText = document.getElementById('inputText').value;
    var formattedText = marked.parse(inputText);

    console.log(formattedText);

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    if (!confirm('Biztosan elküldöd az emailt?')) {
        return;
    }

    fetch('https://api.dachats.online/api/admin/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth': token,
        },
        body: JSON.stringify({
            subject: prompt('Kérlek add meg az email tárgyát:'),
            message: formattedText,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Az email sikeresen elküldve!');
        } else {
            alert('Hiba történt az email küldése közben!');
        }
    });
}