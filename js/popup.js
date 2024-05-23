document.addEventListener('DOMContentLoaded', () => {
    const openPopup = () => {
        document.querySelector('.popup-overlay').style.display = 'flex';
        document.body.classList.add('popup-active');
        twofa();
    };

    const closePopup = () => {
        document.querySelector('.popup-overlay').style.display = 'none';
        document.body.classList.remove('popup-active');
        document.getElementById('2fa').innerHTML = '';
    };

    setTimeout(() => {
        const button = document.querySelector('#openPopupButton')

        const buttonText = button.innerHTML;
    
        console.log(buttonText)
    
        if (buttonText === 'Kikapcsolás') {
            console.log('nem')
        } else {
            document.querySelector('#openPopupButton').addEventListener('click', openPopup);
    
            document.querySelector('.popup .close-popup').addEventListener('click', closePopup);
    
            document.querySelector('.popup-overlay').addEventListener('click', (e) => {
                if (e.target === document.querySelector('.popup-overlay')) {
                    closePopup();
                }
            });
        }
    }, 2000);
});