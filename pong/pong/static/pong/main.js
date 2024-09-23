import "./core/component.js";
import { Router } from "./core/router.js";
import { Signup } from "./components/Signup.js";
import { Signin } from "./components/Signin.js";
import { Home } from "./components/Home.js";
import { Chat } from "./components/Chat.js";
import { PongGameHome } from "./components/PongGameHome.js";
import { PongGameWaiting } from "./components/PongGameWaiting.js";
import { PongGame } from "./components/PongGame.js";
import { Error } from "./components/Error.js";
import { Profile } from "./components/Profile.js";
import { EditProfile } from "./components/EditProfile.js";
import { TypingGameHome } from "./components/TypingGameHome.js";
import { TypingGameRoom } from "./components/TypingGameRoom.js";
import { TypingGameWaiting } from "./components/TypingGameWaiting.js";
import { TypingGame } from "./components/TypingGame.js";
import { PongGameTournament } from "./components/PongGameTournament.js";
import { PongGameFinished } from "./components/PongGameFinished.js";
import { PongGameResult } from "./components/PongGameResult.js";
import { SearchUsers } from "./components/SearchUsers.js";

let router = new Router(
  document.getElementById("app"),
  [
    {
      path: "/",
      component: Home,
      state: {},
    },
    {
      path: "/signup",
      component: Signup,
      state: {},
    },
    {
      path: "/signin",
      component: Signin,
      state: {},
    },
    {
      path: "/chat",
      component: Chat,
      state: {},
    },
    {
      path: "/search-users",
      component: SearchUsers,
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
      path: "/pong-game-tournament",
      component: PongGameTournament,
      state: {},
    },
    {
      path: "/pong-game-finished",
      component: PongGameFinished,
      state: {},
    },
    {
      path: "/pong-game-match-result",
      component: PongGameResult,
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
    {
      path: "/typing-game-home",
      component: TypingGameHome,
      state: {},
    },
    {
      path: "/typing-game-room",
      component: TypingGameRoom,
      state: {},
    },
    {
      path: "/typing-game-waiting",
      component: TypingGameWaiting,
      state: {},
    },
    {
      path: "/typing-game",
      component: TypingGame,
      state: {},
    },
  ],
  {
    playersInfo: {},
    gameResults: [],
  },
);

router.goNextPage(location.pathname);
