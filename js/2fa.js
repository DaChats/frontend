async function twofa() {
    const container = document.getElementById('2fa');

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;
    ;

    const twofa = await fetch(`https://api.dachats.online/api/2fa?token=${token}`)
    const twofaData = await twofa.json();

    if (twofaData) {
        if (twofaData.message == "2FA is enabled") return alert('2FA is already enabled');

        if (twofaData.status === 200) {
            const qrCode = twofaData.data;

            const h3 = document.createElement('h3');
            h3.innerText = 'Scan the QR code below';
            container.appendChild(h3);

            const br = document.createElement('br');
            container.appendChild(br);

            const img = document.createElement('img');
            img.src = qrCode;
            container.appendChild(img);

            const br2 = document.createElement('br');
            container.appendChild(br2);

            const form = document.createElement('form');
            form.style = 'padding: 10px;';
            container.appendChild(form);

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.placeholder = 'Enter the code';
            form.appendChild(input);

            const br3 = document.createElement('br');
            container.appendChild(br3);

            const szoveg = document.createElement('p')
            szoveg.innerText = 'Please enter the code from the app';
            container.appendChild(szoveg);

            const br4 = document.createElement('br');
            container.appendChild(br4);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary';
            button.innerText = 'Bekapcsolás';
            container.appendChild(button);

            button.addEventListener('click', async () => {
                const code = input.value;
                const verify = await fetch(`https://api.dachats.online/api/2fa?token=${token}&code=${code}`);
                const verifyData = await verify.json();

                if (verifyData) {
                    if (verifyData.status === 200) {
                        alert('2FA enabled');
                        window.location.reload();
                    } else {
                        alert(verifyData.message);
                    }
                } else {
                    alert('Failed to fetch data');
                }
            });
        } else {
            console.log(twofaData.message)
        }
    } else {
        console.log('Failed to fetch data')
    }
}