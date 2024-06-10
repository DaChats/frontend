document.addEventListener('DOMContentLoaded', async () => {
    const query = new URLSearchParams(window.location.search);

    const callTo = query.get('callTo');
    const callFrom = query.get('callFrom');

    let peer
    if (callTo) {
        peer = new Peer()

        peer.on('open', id => {
            console.log(id)
            socket.emit('call-made', {
                to: callTo,
                offer: id
            })
        })

        socket.on('answer', ({ answer, from }) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                document.getElementById('userVideo').srcObject = stream
                const call = peer.call(answer, stream)
                call.on('stream', remoteStream => {
                    document.getElementById('remoteVideo').srcObject = remoteStream
                })
            })
        })
    }

    if (callFrom) {
        const peer = new Peer()

        peer.on('open', id => {
            socket.emit('answer-made', {
                to: callFrom,
                answer: id
            })
        })

        peer.on('call', call => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                document.getElementById('userVideo').srcObject = stream
                
                call.answer(stream)

                call.on('stream', remoteStream => {
                    document.getElementById('remoteVideo').srcObject = remoteStream
                })
            })
        })
    }
})