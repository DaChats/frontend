const cookie = document.cookie;
const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

async function connectWS() {
    const socket = await io(`https://api.dachats.online?token=${token}&online=true`);
    socket.on('connect', () => {
        console.log('Connected to WS server.');
    });
}

connectWS();
