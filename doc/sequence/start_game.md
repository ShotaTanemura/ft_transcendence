# Start Game
```mermaid
sequenceDiagram

actor player as Player

participant web as GameWeb
participant api as GameAPI
participant server as GameServer

player ->>+ web: Start a game
web ->>+ api: GET/session_id
api ->>+ server: Create a game room
server -->>- api: OK
api -->>- web: OK
web -->>- player: Success message<br>sessin_id<br>Play screen

