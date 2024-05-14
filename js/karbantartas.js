async function karbantartas(ut) {
const karbantartas = fetch('https://api.dachats.online/api/karbantartas')
    .then(response => response.json())
    .then((data) => {
        if (data.data == true) {
            alert('Karbantartás alatt...');

            window.location.href = ut;
        } else {
            console.log('Nincs karbantartás alatt...');
        }
    });
}
