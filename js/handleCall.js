let peer = new Peer()

let mediaOptions = {
    audio: true,
    video: true
}

document.addEventListener('DOMContentLoaded', async () => {
    const query = new URLSearchParams(window.location.search);
    const userInfo = document.querySelector('.user-info')
    const friendInfo = document.querySelector('.friend-info')

    userInfo.style.display = 'none'
    friendInfo.style.display = 'none'

    const callTo = query.get('callTo');
    const callFrom = query.get('callFrom');

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;

    if (callTo) {
        peer.on('open', id => {
            socket.emit('call-made', {
                to: callTo,
                offer: id,
                from: userid
            })
        })

        let call
        socket.on('answer', ({ answer, from }) => {
            navigator.mediaDevices.getUserMedia(mediaOptions).then((stream) => {
                document.getElementById('user-video').srcObject = stream

                userInfo.style.display = 'flex'
                friendInfo.style.display = 'flex'

                console.log('answer', answer)
                call = peer.call(answer, stream)

                call.on('stream', (remoteStream) => {
                    document.getElementById('friend-video').srcObject = remoteStream
                })
            })
        })
    }

    if (callFrom) {
        peer.on('open', id => {
            socket.emit('answer-made', {
                to: callFrom,
                answer: id,
                from: userid
            })
        })

        peer.on('call', call => {
            navigator.mediaDevices.getUserMedia(mediaOptions).then(stream => {
                document.getElementById('user-video').srcObject = stream

                call.answer(stream)

                userInfo.style.display = 'flex'
                friendInfo.style.display = 'flex'

                call.on('stream', (remoteStream) => {
                    document.getElementById('friend-video').srcObject = remoteStream
                })
            })
        })
    }
})

const endCall = () => {
    document.getElementById('user-video').srcObject.getTracks().forEach(track => track.stop())

    document.getElementById('friend-video').srcObject.getTracks().forEach(track => track.stop())

    const én = localStorage.getItem('userid')
    const ő = localStorage.getItem('friendid')

    socket.emit('end-call', {
        to: ő,
        from: én,
        call: peer.id
    });

    peer.destroy()
    window.location.href = './index.html'

    localStorage.removeItem('userid')
    localStorage.removeItem('friendid')

    return;
}

socket.on('end-call', async (data) => {
    document.getElementById('user-video').srcObject.getTracks().forEach(track => track.stop())

    document.getElementById('friend-video').srcObject.getTracks().forEach(track => track.stop())

    peer.destroy()
    window.location.href = './index.html'
    return;
});

const toggleAudio = () => {
    const audio = document.getElementById('user-video').srcObject.getAudioTracks()[0]
    audio.enabled = !audio.enabled

    mediaOptions.audio = audio.enabled

    socket.emit('toggle-audio', {
        to: callTo,
        from: callFrom,
        call: peer.id,
        audio: audio.enabled
    })
}

const toggleVideo = () => {
    const video = document.getElementById('user-video').srcObject.getVideoTracks()[0]
    video.enabled = !video.enabled

    mediaOptions.video = video.enabled

    socket.emit('toggle-video', {
        to: callTo,
        from: callFrom,
        call: peer.id,
        video: video.enabled
    })
}