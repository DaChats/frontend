async function nev() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = 'https://api.namefake.com/';

    const res = await fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            const name = data.name;
            return name;
        });

    document.getElementById('name').innerText = res;
}

nev();