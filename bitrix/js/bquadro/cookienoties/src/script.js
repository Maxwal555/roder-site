BX.ready(function () {
    BX.namespace("Bquadro.CookieNotification");

    const App = {
        init() {
            this.container = document.getElementById('bquadro_cookie_panel');
            if (!this.container) return;

            this.panel = this.container.querySelector('.cookie-panel');
            if (!this.panel) return;

            this.btnEl = this.container.querySelector('.cookie-panel__btn');
            if (!this.btnEl) return;

            this.btnEl.addEventListener('click', () => this.btnClick());

            this.checkCookies();
        },

        btnClick() {
            this.setCookie('cookies_policy', 'true', 365);
            this.panel.classList.toggle("cookie-panel--close");
            $(this.panel).slideUp(500);
        },

        setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = `${name}=${value || ""}${expires}; path=/`;
        },

        getCookie(name) {
            const matches = document.cookie.match(
                new RegExp(
                    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                )
            );
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },

        checkCookies() {
            const cookieValue = this.getCookie('cookies_policy');
            // Если куки нет, показываем панель
            if (cookieValue === undefined) {
                this.panel.classList.remove("cookie-panel--close");
                $(this.panel).slideDown(500);
            } else {
                // Если куки есть, скрываем панель (на всякий случай)
                this.panel.classList.add("cookie-panel--close");
                $(this.panel).hide();
            }
        },
    };

    BX.Bquadro.CookieNotification.App = App;
    App.init();
});
