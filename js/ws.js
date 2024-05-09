let socket;
let userid;

const cookie = document.cookie;
userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

async function connectWS() {
    socket = io(`https://api.dachats.online?userid=${userid}&chaid=1234563`);
    socket.on('connect', () => {
        console.log('Connected to WS server.');
    });
}

connectWS();

function sendMessage() {
    const message = "Szia fiam!"
    const time = new Date().toLocaleTimeString();
    const from = 'vzadgsu12';
    const data = { message, time, from };
    socket.emit('message', data);
}
