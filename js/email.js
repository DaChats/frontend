document.getElementById('inputText').addEventListener('input', function() {
    var inputText = document.getElementById('inputText').value;
    var formattedText = marked.parse(inputText);
    document.getElementById('preview').innerHTML = formattedText;
});

function kuldes() {
    var inputText = document.getElementById('inputText').value;
    var formattedText = marked.parse(inputText);

    console.log(formattedText);

    const token = prompt('Kérlek add meg a tokenedet:');

    if (!token) {
        alert('Nem adtál meg tokent!');
        return;
    }

    confirm('Biztosan elküldöd az emailt?')

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
    })
}