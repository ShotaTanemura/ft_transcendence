import "./core/component.js";
import { Router } from "./core/router.js";
import { Signup } from "./components/Signup.js";
import { Signin } from "./components/Signin.js";
import { Home } from "./components/Home.js";
import { PongGameHome } from "./components/PongGameHome.js";
import { PongGameRoom } from "./components/PongGameRoom.js";
import { PongGameWaiting } from "./components/PongGameWaiting.js";
import { PongGame } from "./components/PongGame.js";
import { Error } from "./components/Error.js";
import { Profile } from "./components/Profile.js";
import { EditProfile } from "./components/EditProfile.js";

let router = new Router(
  document.getElementById("app"),
  [
    {
      path: "/",
      component: Signin,
      state: {},
    },
    {
      path: "/signup",
      component: Signup,
      state: {},
    },
    {
      path: "/home",
      component: Home,
      state: {},
    },
    {
      path: "/error",
      component: Error,
      state: {},
    },
    {
      path: "/pong-game-home",
      component: PongGameHome,
      state: {},
    },
    {
      path: "/pong-game-room",
      component: PongGameRoom,
      state: {},
    },
    {
      path: "/pong-game-waiting",
      component: PongGameWaiting,
      state: {},
    },
    {
      path: "/pong-game",
      component: PongGame,
      state: {},
    },
    {
      path: "/profile",
      component: Profile,
      state: {},
    },
    {
      path: "/edit-profile",
      component: EditProfile,
      state: {},
    },
  ],
  {
    playersInfo: {},
    gameResults: [],
  },
);

router.goNextPage(location.pathname);
