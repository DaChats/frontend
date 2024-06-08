const uploadAvatar = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const cookie = document.cookie;
    const token = cookie ? cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null;

    const uploadAvatar = await fetch(`https://api.dachats.online/api/avatar?token=${token}`, {
        method: 'POST',
        body: formData,
    })
    .then(response => window.location.reload())
    .catch(err => console.error(err));
}

const openPopup = (type) => {
    if (type == '2fa') {
        document.querySelector('.popup-overlay').style.display = 'flex';
        document.body.classList.add('popup-active');

        twofa()
    }

    else if (type == 'avatar') {
        document.querySelector('.popup-overlay').style.display = 'flex';
        document.body.classList.add('popup-active');

        const container = document.getElementById('2fa');

        container.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center">
                <h4>Profilkép módosítása</h4>
                <form id="avatarForm" enctype="multipart/form-data">
                    <input type="file" name="avatar" id="avatar" class="form-control" accept="image/*">
                    <input type="submit" class="btn btn-primary mt-2"></input>
                </form>
            </div>
        `;

        const avatarForm = document.getElementById('avatarForm');
        avatarForm.addEventListener('submit', uploadAvatar);
    }
};

const closePopup = () => {
    document.querySelector('.popup-overlay').style.display = 'none';
    document.body.classList.remove('popup-active');
    document.getElementById('2fa').innerHTML = '';
}