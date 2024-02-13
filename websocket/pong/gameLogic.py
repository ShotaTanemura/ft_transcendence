import math


MOVE_DISTANCE = 30

canvas = {
    "width": 1200,
    "height": 800,
}

# ボール
ball = {
    "x": canvas["width"] / 2,
    "y": canvas["height"] / 2,
    "radius": 10,
    "velocityX": 5,
    "velocityY": 5,
    "speed": 7,
    "color": "WHITE",
}

# ユーザー
user = {
    "x": 0,  # キャンバスの左側
    "y": (canvas["height"] - 100) / 2,  # パドルの高さ -100
    "width": 10,
    "height": 100,
    "score": 0,
    "color": "WHITE",
}

# コンピューター
com = {
    "x": canvas["width"] - 10,  # パドルの幅 -10
    "y": (canvas["height"] - 100) / 2,  # パドルの高さ -100
    "width": 10,
    "height": 100,
    "score": 0,
    "color": "WHITE",
}


def collision(ball, paddle):
    # 衝突している場合は True、そうでない場合は False

    # パドルの当たり判定エリアを設定
    paddle_top = paddle["y"]
    paddle_bottom = paddle["y"] + paddle["height"]
    paddle_left = paddle["x"]
    paddle_right = paddle["x"] + paddle["width"]

    # ボールの当たり判定エリアを設定
    ball_top = ball["y"] - ball["radius"]
    ball_bottom = ball["y"] + ball["radius"]
    ball_left = ball["x"] - ball["radius"]
    ball_right = ball["x"] + ball["radius"]

    # 衝突判定
    return (
        paddle_left < ball_right
        and paddle_top < ball_bottom
        and paddle_right > ball_left
        and paddle_bottom > ball_top
    )

def reset_ball():
    # ボールを画面中央に配置
    ball["x"] = canvas.width / 2
    ball["y"] = canvas.height / 2
    # ボール速度を初期値に設定
    ball["velocityX"] = -ball["velocityX"]
    ball["speed"] = 7

def updatePong():
    # ボールが画面外に出た場合の処理
    if ball["x"] - ball["radius"] < 0:
        # コンピューター側のスコアを加算
        com["score"] += 1
        # ボールをリセット
        reset_ball()
    elif ball["x"] + ball["radius"] > canvas["width"]:
        # ユーザー側のスコアを加算
        user["score"] += 1
        reset_ball()
    # ボールを移動
    ball["x"] += ball["velocityX"]
    ball["y"] += ball["velocityY"]

    # コンピューターのパドルを移動
    com["y"] += ((ball["y"] - (com["y"] + com["height"] / 2))) * 0.1

    # ボールが壁に当たった場合の処理
    if ball["y"] - ball["radius"] < 0 or ball["y"] + ball["radius"] > canvas["height"]:
        ball["velocityY"] = -ball["velocityY"]

    # 衝突判定
    player = user if ball["x"] + ball["radius"] < canvas["width"] / 2 else com
    if collision(ball, player):
        # 衝突位置を計算
        collide_point = (ball["y"] - (player["y"] + player["height"] / 2))
        collide_point = collide_point / (player["height"] / 2)

        # 衝突角度を計算
        angle_rad = (math.pi / 4) * collide_point

        # ボールの方向と速度を計算
        direction = 1 if ball["x"] + ball["radius"] < canvas["width"] / 2 else -1
        ball["velocityX"] = direction * ball["speed"] * math.cos(angle_rad)
        ball["velocityY"] = ball["speed"] * math.sin(angle_rad)




def update_player_position(key):
    if (key == 'ArrowUp' or key == 'a'):
        user["y"] =  MOVE_DISTANCE * -1
    elif (key == 'ArrowDown' or key == 'd'):
        user["y"] =  MOVE_DISTANCE
    
