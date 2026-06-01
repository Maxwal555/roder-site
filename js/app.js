document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileButton = document.querySelector('.mobile-button');
    const header = document.querySelector('.header');
    
    if (mobileButton) {
        mobileButton.addEventListener('click', function() {
            header.classList.toggle('active');
            const nav = document.querySelector('.header nav');
            if (nav) {
                nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'fixed';
                nav.style.top = '77px';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = '#fff';
                nav.style.padding = '20px';
                nav.style.zIndex = '999';
            }
        });
    }

    // Menu hover/click for submenus
    const menuItems = document.querySelectorAll('.menu__item');
    menuItems.forEach(function(item) {
        item.addEventListener('mouseenter', function() {
            this.classList.add('active');
        });
        item.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });

    // Banner slider (simple auto-rotation)
    const bannerImages = document.querySelectorAll('.banner__image');
    const bannerButtons = document.querySelectorAll('.banner__button');
    let currentSlide = 0;

    function showSlide(index) {
        bannerImages.forEach(function(img, i) {
            img.style.display = i === index ? 'flex' : 'none';
        });
        bannerButtons.forEach(function(btn, i) {
            btn.classList.toggle('active', i === index);
        });
    }

    if (bannerImages.length > 0) {
        showSlide(0);
        
        // Auto-rotate every 7 seconds
        setInterval(function() {
            currentSlide = (currentSlide + 1) % bannerImages.length;
            showSlide(currentSlide);
        }, 7000);

        // Click on banner buttons
        bannerButtons.forEach(function(btn, i) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                currentSlide = i;
                showSlide(currentSlide);
            });
        });
    }

    // Modal (callback form)
    const modalBlock = document.querySelector('.modal-block');
    const callbackButtons = document.querySelectorAll('.header__callback, .footer__button');
    const closeModal = document.querySelector('.closemodal');

    callbackButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (modalBlock) {
                modalBlock.classList.add('active');
                document.body.classList.add('modal');
            }
        });
    });

    if (closeModal) {
        closeModal.addEventListener('click', function(e) {
            e.preventDefault();
            modalBlock.classList.remove('active');
            document.body.classList.remove('modal');
        });
    }

    // Cookie panel
    const cookieBtn = document.querySelector('.cookie-panel__btn');
    if (cookieBtn) {
        cookieBtn.addEventListener('click', function() {
            this.closest('.cookie-panel').style.display = 'none';
            localStorage.setItem('cookiesAccepted', 'true');
        });

        if (localStorage.getItem('cookiesAccepted') === 'true') {
            const panel = document.querySelector('.cookie-panel');
            if (panel) panel.style.display = 'none';
        }
    }

    // Form submission
    const form = document.querySelector('.modal-callback');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = form.querySelector('.message');
            if (message) {
                message.classList.add('success-message');
                message.innerHTML = 'Спасибо! Ваша заявка отправлена.';
            }
            // Reset form
            setTimeout(function() {
                form.reset();
                modalBlock.classList.remove('active');
                document.body.classList.remove('modal');
            }, 2000);
        });
    }

    // Search toggle
    const searchLink = document.querySelector('.header__search a');
    const searchForm = document.querySelector('.header__search');
    if (searchLink) {
        searchLink.addEventListener('click', function(e) {
            e.preventDefault();
            searchForm.classList.toggle('show');
        });
    }
});
