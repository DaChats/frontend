document.addEventListener('DOMContentLoaded', async () => {
    const query = new URLSearchParams(window.location.search);

    const callTo = query.get('callTo');
    const callFrom = query.get('callFrom');

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

    let peer
    if (callTo) {
        peer = new Peer()

        peer.on('open', id => {
            socket.emit('call-made', {
                to: callTo,
                offer: id,
                from: userid
            })
        })

        socket.on('answer', ({ answer, from }) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                document.getElementById('user-video').srcObject = stream

                console.log('answer', answer)
                const call = peer.call(answer, stream)

                call.on('stream', (remoteStream) => {
                    document.getElementById('friend-video').srcObject = remoteStream
                })
            })
        })
    }

    if (callFrom) {
        const peer = new Peer()

        peer.on('open', id => {
            socket.emit('answer-made', {
                to: callFrom,
                answer: id,
                from: userid
            })
        })

        peer.on('call', call => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                document.getElementById('user-video').srcObject = stream
                
                call.answer(stream)

                call.on('stream', (remoteStream) => {
                    document.getElementById('friend-video').srcObject = remoteStream
                })
            })
        })
    }
})