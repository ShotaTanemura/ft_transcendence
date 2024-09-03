import { Component } from "../core/component.js";

export class Header extends Component {
  constructor(router, params, state) {
    super(router, params, state);
  }
  
  get html() {
    return (`
      <nav class="navbar navbar-expand-lg bg-body-teriary navbar-light bg-light sticky-stop">
        <a class="btn border border-secondary border-2" data-bs-toggle="offcanvas" href="#header-offcanvas" role="button" aria-controls="header-offcanvas">
          <span class="navbar-toggler-icon"></span>
        </a>
        <a class="navbar-brand ps-4 display-4" href="#">Transcendence</a>
        <div class="ms-auto px-5 d-flex">
          <form class="form-inline px-4 d-none d-md-block">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">@</span>
              </div>
              <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
            </div>
          </form>
          <button class="btn btn-link"">
            <span class="Button-content">
              <span class="Button-label"><img src="https://avatars.githubusercontent.com/u/110250805?v=4" alt="" size="32" height="32" width="32" data-view-component="true" class="avatar rounded-circle"></span>
            </span>
          </button>
        </div>
      </nav>
      <div class="offcanvas offcanvas-dark offcanvas-start rounded-end mw-100 p-3" tabindex="-1" id="header-offcanvas" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title fa-2x" id="offcanvasExampleLabel">Transcendence</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">
                <i class="bi bi-house px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Home
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">
                <i class="bi bi-chat-dots px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Chat
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">
                <i class="bi bi-controller px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  PongGame
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">
                <i class="bi bi-keyboard px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  TypingGame
                </span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">
                <i class="bi bi-gear px-2 fa-2x"></i>
                <span class="fa-2x align-bottom">
                  Settings
                </span>
              </a>
            </li>

          </ul>
        </div>
      </div>
    `)}
}
