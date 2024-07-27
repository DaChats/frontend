let peer = new Peer()

let mediaOptions = {
    audio: true,
    video: true
}

let callTo, callFrom;

document.addEventListener('DOMContentLoaded', async () => {
    const query = new URLSearchParams(window.location.search);
    const userInfo = document.querySelector('.user-info')
    const friendInfo = document.querySelector('.friend-info')

    userInfo.style.display = 'none'
    friendInfo.style.display = 'none'

    callTo = query.get('callTo');
    callFrom = query.get('callFrom');

    const cookie = document.cookie;
    const userid = cookie ? cookie.split('; ').find(row => row.startsWith('userid=')).split('=')[1] : null;


    async function getUserinfo() {
        const user = await fetch(`https://api.dachats.online/api/user/${userid}`);
        const userData = await user.json();

        const avatar = userData.data.avatar;
        const username = userData.data.username;

        userInfo.innerHTML = ``

        userInfo.innerHTML = `
        <img src="https://api.dachats.online/api/files?filename=${avatar}" alt="user" class="user-image">
        <p class="user-name">${username}</p>
        `
    }

    async function getFriendinfo() {
        const friendid = localStorage.getItem('friendid');

        const user = await fetch(`https://api.dachats.online/api/user/${friendid}`);
        const userData = await user.json();

        const username = userData.data.username;

        friendInfo.innerHTML = ``

        friendInfo.innerHTML = `
        <img src="https://api.dachats.online/api/files?filename=${userData.data.avatar}" alt="user" class="user-image">
        <p class="user-name">${username}</p>
        `

    }

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
            }).catch(error => console.error('Error accessing media devices.', error));
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
            }).catch(error => console.error('Error accessing media devices.', error));
        })
    }

    await getFriendinfo()
    await getUserinfo()
})

const endCall = () => {
    try {
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
    } catch (error) {
        console.log(error)
    }
}

socket.on('end-call', async (data) => {
    document.getElementById('user-video').srcObject.getTracks().forEach(track => track.stop())

    if (userVideo) {
        userVideo.getTracks().forEach(track => track.stop());
    }

    if (friendVideo) {
        friendVideo.getTracks().forEach(track => track.stop());
    }

    peer.destroy()
    window.location.href = './index.html'
    return;
});

socket.on('toggle-audio', async (data) => {
    const userInfo = document.querySelector('.user-info')
    const friendInfo = document.querySelector('.friend-info')

    let div = null;

    const userId = localStorage.getItem('userid')
    const friendId = localStorage.getItem('friendid')

    if (data.from === userId) {
        div = userInfo;
    } else if (data.from === friendId) {
        div = friendInfo;
    }

    let html = `
    <div id="muted">
        <svg class="muted" width="24" height="24" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
            d="M15.9844 10.6641V7.28906L14.2031 9.07031V10.6641C14.2008 11.8523 13.2188 12.8227 12 12.8203C11.5523 12.8227 11.1375 12.6937 10.7812 12.4688L9.51562 13.7578C10.1977 14.2828 11.0602 14.6016 12 14.6016C14.1984 14.6016 15.9844 12.8414 15.9844 10.6641Z"
            fill="white" />
        <path
            d="M19.5233 10.4532H18.1171C18.014 10.4532 17.9296 10.5376 17.9296 10.6407C17.9296 13.929 15.2647 16.5939 11.9765 16.5939C10.4999 16.5939 9.14756 16.0548 8.10928 15.1642L6.84365 16.4298C7.98975 17.4423 9.44053 18.1243 11.039 18.3282V20.7189H7.64053C7.31475 20.7189 7.05693 21.054 7.05459 21.4689V22.3126C7.05693 22.4157 7.12256 22.5001 7.19522 22.5001H16.7577C16.8327 22.5001 16.8983 22.4157 16.8983 22.3126V21.4689C16.8983 21.054 16.6405 20.7189 16.3124 20.7189H12.8202V18.3282C16.6944 17.9087 19.7108 14.6274 19.7108 10.6407C19.7108 10.5376 19.6265 10.4532 19.5233 10.4532ZM19.8304 1.60088L18.8108 0.618851C18.7382 0.548539 18.621 0.548539 18.5483 0.621195L15.5249 3.64463C14.8663 2.37198 13.5233 1.5001 11.9765 1.5001C9.77568 1.5001 7.99209 3.26495 7.99209 5.4376V10.6876C7.99209 10.8446 8.00147 10.9993 8.02022 11.1517L6.42647 12.7454C6.18037 12.0915 6.04443 11.3814 6.04678 10.6407C6.04209 10.5376 5.95772 10.4532 5.85928 10.4532H4.45303C4.3499 10.4532 4.26553 10.5376 4.26553 10.6407C4.26553 11.8829 4.5585 13.0548 5.07647 14.0954L1.86553 17.3064C1.79287 17.379 1.79287 17.4985 1.86553 17.5712L2.86631 18.572C2.93896 18.6446 3.0585 18.6446 3.13115 18.572L19.8327 1.87041L19.8351 1.86807C19.9077 1.79307 19.9054 1.67354 19.8304 1.60088ZM9.77334 9.39854V5.4376C9.77334 4.25166 10.7554 3.28135 11.9765 3.28135C13.0546 3.28135 13.9476 4.03838 14.1397 5.03213L9.77334 9.39854Z"
            fill="white" />
        </svg>
    </div>
    `

    if (!data.audio) {
        div.innerHTML += html
    } else {
        const muted = document.getElementById('muted')
        if (muted) {
            muted.remove()
        }
    }
})

const toggleAudio = () => {
    const audio = document.getElementById('user-video').srcObject.getAudioTracks()[0];
    audio.enabled = !audio.enabled;

    mediaOptions.audio = audio.enabled;

    const ő = localStorage.getItem('friendid')
    const én = localStorage.getItem('userid')

    const userInfo = document.querySelector('.user-info')
    const mutebutton = document.querySelector('#mute-button')

    let html = `
    <div id="muted">
        <svg class="muted" width="24" height="24" viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
            d="M15.9844 10.6641V7.28906L14.2031 9.07031V10.6641C14.2008 11.8523 13.2188 12.8227 12 12.8203C11.5523 12.8227 11.1375 12.6937 10.7812 12.4688L9.51562 13.7578C10.1977 14.2828 11.0602 14.6016 12 14.6016C14.1984 14.6016 15.9844 12.8414 15.9844 10.6641Z"
            fill="white" />
        <path
            d="M19.5233 10.4532H18.1171C18.014 10.4532 17.9296 10.5376 17.9296 10.6407C17.9296 13.929 15.2647 16.5939 11.9765 16.5939C10.4999 16.5939 9.14756 16.0548 8.10928 15.1642L6.84365 16.4298C7.98975 17.4423 9.44053 18.1243 11.039 18.3282V20.7189H7.64053C7.31475 20.7189 7.05693 21.054 7.05459 21.4689V22.3126C7.05693 22.4157 7.12256 22.5001 7.19522 22.5001H16.7577C16.8327 22.5001 16.8983 22.4157 16.8983 22.3126V21.4689C16.8983 21.054 16.6405 20.7189 16.3124 20.7189H12.8202V18.3282C16.6944 17.9087 19.7108 14.6274 19.7108 10.6407C19.7108 10.5376 19.6265 10.4532 19.5233 10.4532ZM19.8304 1.60088L18.8108 0.618851C18.7382 0.548539 18.621 0.548539 18.5483 0.621195L15.5249 3.64463C14.8663 2.37198 13.5233 1.5001 11.9765 1.5001C9.77568 1.5001 7.99209 3.26495 7.99209 5.4376V10.6876C7.99209 10.8446 8.00147 10.9993 8.02022 11.1517L6.42647 12.7454C6.18037 12.0915 6.04443 11.3814 6.04678 10.6407C6.04209 10.5376 5.95772 10.4532 5.85928 10.4532H4.45303C4.3499 10.4532 4.26553 10.5376 4.26553 10.6407C4.26553 11.8829 4.5585 13.0548 5.07647 14.0954L1.86553 17.3064C1.79287 17.379 1.79287 17.4985 1.86553 17.5712L2.86631 18.572C2.93896 18.6446 3.0585 18.6446 3.13115 18.572L19.8327 1.87041L19.8351 1.86807C19.9077 1.79307 19.9054 1.67354 19.8304 1.60088ZM9.77334 9.39854V5.4376C9.77334 4.25166 10.7554 3.28135 11.9765 3.28135C13.0546 3.28135 13.9476 4.03838 14.1397 5.03213L9.77334 9.39854Z"
            fill="white" />
        </svg>
    </div>
    `

    if (!audio.enabled) {
        userInfo.innerHTML += html

        mutebutton.classList.remove('btn-success')
        mutebutton.classList.add('btn-danger')
    } else {
        const muted = document.getElementById('muted')
        if (muted) {
            muted.remove()
        }

        mutebutton.classList.remove('btn-danger')
        mutebutton.classList.add('btn-success')
    }

    socket.emit('toggle-audio', {
        to: ő,
        from: én,
        call: peer.id,
        audio: audio.enabled
    })
}

//const toggleVideo = () => {
//    const video = document.getElementById('user-video').srcObject.getVideoTracks()[0]
//    video.enabled = !video.enabled
//
//    mediaOptions.video = video.enabled
//
//    const camerabutton = document.querySelector('#camera-button')
//
//    if (!video.enabled) {
//        camerabutton.classList.remove('btn-success')
//        camerabutton.classList.add('btn-danger')
//    } else {
//        camerabutton.classList.remove('btn-danger')
//        camerabutton.classList.add('btn-success')
//    }
//
//    socket.emit('toggle-video', {
//        to: callTo,
//        from: callFrom,
//        call: peer.id,
//        video: video.enabled
//    })
//}
