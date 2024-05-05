let socket;

async function connectWS() {
    socket = io('http://localhost:3000?userid=vzadgsu12&chaid=1234563');
    socket.on('connect', () => {
        console.log('Connected to WS server.');
    });
}

connectWS();

async function kuldes() {
    if (!socket) {
        console.error('Socket connection is not established.');
        return;
    }

    const data = {
        from: 'John',
        message: 'Hello!',
        time: new Date().toLocaleString() 
    };

    socket.emit('message', data);
}
