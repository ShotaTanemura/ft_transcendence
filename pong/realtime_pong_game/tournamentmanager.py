class Match():
    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
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
        return player1, player2

    def get_result(self):
        return (self.player1.name, self.player1_score), (self.player2.name, self.player2_score)

    def get_winner(self):
        return self.winner

class TournamentManager():
    def __init__(self, participants_list):
        self.round = 0
        self.tournament_list = []
        self.create_tournament(participants_list)
        return

    def create_round(self, participants_list):
        round = []
        for index in range(0, len(participants_list), 2):
            round.append(Match(participants_list[i], participants_list[i + 1] if i + 1 < len(participants_list) else None))
        return round

    def create_tournament(self, participants_list):
        valid_participants_number = [2, 4]
        if len(participants_list) not in valid_participants_number:
            raise Exception("TournamentManager: create_tournament: the number of participants should be 2 or 4")
        self.tournament_list.append(self.create_round(participants_list))

    def create_next_round(self):
        round = []
        winner_list = []
        for match in self.tournament_list[self.round]:
            winner_list.append(match.winner)
        self.tournament_list.append(create_round(winner_list))
        self.round+=1
            
    def get_next_match_players(self):
        if is_round_finished():
            self.create_next_round()
        for match in self.tournament_list[self.round]:
            if match.winner == None:
                return (match.get_palyers())
    
    def update_current_match(self, player1_score, player2_score):
        for match in self.tournament_list[self.round]:
            if match.winner == None:
               match.set_result(player1_score, player2_score)

    def is_round_finished(self):
        for match in self.tournament_list[self.round]:
            if match.winner == None:
                return False
        return True