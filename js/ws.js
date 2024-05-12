let socket;
let userid;

const cookie = document.cookie;
const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

async function connectWS() {
    socket = io(`https://api.dachats.online?token=${token}&chaid=926728`);
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
