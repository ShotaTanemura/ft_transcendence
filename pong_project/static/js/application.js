import Router from "./router.js";
import LoginView from "./login_view.js";

(() => {

    let router = new Router(document.body, [
        {
            path: '/',
            component: LoginView
        },
    ]);

    router.nextPage(location.pathname);
})();