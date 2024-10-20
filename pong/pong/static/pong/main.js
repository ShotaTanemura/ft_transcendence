import "./core/component.js";
import { Router } from "./core/router.js";
import { Signup } from "./components/Signup.js";
import { Signin } from "./components/Signin.js";
import { Totp } from "./components/Totp.js";
import { Home } from "./components/Home.js";
import { Chat } from "./components/Chat.js";
import { PongGameHome } from "./components/PongGameHome.js";
import { PongGameWaiting } from "./components/PongGameWaiting.js";
import { PongGame } from "./components/PongGame.js";
import { Error } from "./components/Error.js";
import { Profile } from "./components/Profile.js";
import { UserProfile } from "./components/UserProfile.js";
import { EditProfile } from "./components/EditProfile.js";
import { Edit2FA } from "./components/Edit2FA.js";
import { TypingGameHome } from "./components/TypingGameHome.js";
import { TypingGameWaiting } from "./components/TypingGameWaiting.js";
import { TypingGame } from "./components/TypingGame.js";
import { PongGameTournament } from "./components/PongGameTournament.js";
import { PongGameFinished } from "./components/PongGameFinished.js";
import { GameStats } from "./components/GameStats.js";
import { TypingGameFinished } from "./components/TypingGameFinished.js";
import { SearchUsers } from "./components/SearchUsers.js";
import { Friend } from "./components/Friend.js";
import { Reaction } from "./components/ReactionHome.js";

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
      path: "/totp",
      component: Totp,
      state: {},
    },
    {
      path: "/signin",
      component: Signin,
      state: {},
    },
    {
      path: "/edit-2fa",
      component: Edit2FA,
      state: {},
    },
    {
      path: "/chat",
      component: Chat,
      state: {},
    },
    {
      path: "/friend",
      component: Friend,
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
      path: "/stats",
      component: GameStats,
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
      path: "/typing-game-waiting",
      component: TypingGameWaiting,
      state: {},
    },
    {
      path: "/typing-game",
      component: TypingGame,
      state: {},
    },
    {
      path: "/typing-game-finished",
      component: TypingGameFinished,
      state: {},
    },
    {
      path: "/profile/{user_name}",
      component: UserProfile,
      state: {},
    },
    {
      path: "/reaction",
      component: Reaction,
    },
  ],
  {
    playersInfo: {},
    gameResults: [],
  },
);

router.goNextPage(location.pathname, location.search);
