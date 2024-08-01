import { Component } from "../core/component.js";

export class Load extends Component {
    constructor(router, params, state) {
        super(router, params, state);
    }

    verifyAndRefreshToken = async () => {
        const verifyResponse = await fetch("/pong/api/v1/auth/token/verify", {
            method: "POST",
        });
        if (verifyResponse.ok) {
            return true;
        }

        const refreshResponse = await fetch("/pong/api/v1/auth/token/refresh", {
        method: "POST",
        });
        if (refreshResponse.ok) {
            return true;
        }
        throw Error(verifyResponse.statusText);
    }

    onload = () => {
        this.verifyAndRefreshToken().then().catch((error)=>{
            //Go To Error! 
            this.router.goNextPage("/signin");
        });
    }

    get html() {
        return (`
        `);
    }
}

export default Load;
