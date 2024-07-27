fetch('https://api.dachats.online/api/github/latest')
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        const div = document.getElementById('github')
        
        div.innerHTML = `
        Legutolsó frissítés: 
        <span class="text text-primary">${data.data}</span>
        `;
    });