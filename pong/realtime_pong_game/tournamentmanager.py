import random


class Match:
    def __init__(self, player1, player2, player1_nickname, player2_nickname):
        self.player1 = player1
        self.player2 = player2
        self.player1_nickname = player1_nickname
        self.player2_nickname = player2_nickname
        self.player1_score = 0
        self.player2_score = 0
        self.winner = None

    def set_result(self, player1_score, player2_score):
        self.player1_score = player1_score
        self.player2_score = player2_score
        if player1_score > player2_score:
            self.winner = self.player1
        else:
            self.winner = self.player2

    def get_palyers(self):
        return self.player1, self.player2

    def get_match_result(self):
        is_player1_winner = True
        is_player2_winner = True
        if self.winner == self.player1:
            is_player2_winner = False
        elif self.winner == self.player2:
            is_player2_winner = False
        if self.player2 == None:
            return {
                "top": {
                    "name": self.player1_nickname,
                    "score": self.player1_score,
                    "winner": is_player1_winner,
                },
                "b0ttom": {"name": "", "score": 0, "winner": False},
            }
        return {
            "top": {
                "name": self.player1_nickname,
                "score": self.player1_score,
                "winner": is_player1_winner,
            },
            "bottom": {
                "name": self.player2_nickname,
                "score": self.player2_score,
                "winner": is_player2_winner,
            },
        }

    def get_winner(self):
        return self.winner


class TournamentManager:
    def __init__(self, participants_list, participants_nickname_dict):
        self.round = 0
        self.tournament_list = []
        self.participants_nickname_dict = participants_nickname_dict
        random.shuffle(participants_list)
        self.create_tournament(participants_list)
        return

    def create_round(self, participants_list):
        round = []
        for index in range(0, len(participants_list), 2):
            round.append(
                Match(
                    participants_list[index],
                    participants_list[index + 1]
                    if index + 1 < len(participants_list)
                    else None,
                    self.participants_nickname_dict[participants_list[index]],
                    self.participants_nickname_dict[participants_list[index + 1]]
                    if index + 1 < len(participants_list)
                    else "",
                )
            )
        return round

    def create_tournament(self, participants_list):
        valid_participants_number = [2, 4]
        if len(participants_list) not in valid_participants_number:
            raise Exception(
                "TournamentManager: create_tournament: the number of participants should be 2 or 4"
            )
        self.tournament_list.append(self.create_round(participants_list))

    def create_next_round(self):
        round = []
        winner_list = []
        for match in self.tournament_list[self.round]:
            winner_list.append(match.winner)
        self.tournament_list.append(self.create_round(winner_list))
        self.round += 1

    def get_next_match_players(self):
        if self.is_round_finished():
            self.create_next_round()
        for match in self.tournament_list[self.round]:
            if match.winner == None:
                return match.get_palyers()

    def update_current_match(self, player1_score, player2_score):
        for match in self.tournament_list[self.round]:
            if match.winner == None:
                match.set_result(player1_score, player2_score)

    def is_round_finished(self):
        for match in self.tournament_list[self.round]:
            if match.winner == None:
                return False
        return True

    def get_current_tournament_information_as_list(self):
        tournament_information = []
        for round in self.tournament_list:
            round_information = []
            for match in round:
                round_information.append(match.get_match_result())
            tournament_information.append(round_information)
        number_of_extra_round = len(self.tournament_list[-1]) // 2
        while number_of_extra_round:
            round_information = []
            for i in range(0, number_of_extra_round):
                round_information.append(
                    {
                        "top": {"name": "", "score": 0, "winner": True},
                        "bottom": {"name": "", "score": 0, "winner": True},
                    }
                )
            tournament_information.append(round_information)
            number_of_extra_round //= 2
        return tournament_information
