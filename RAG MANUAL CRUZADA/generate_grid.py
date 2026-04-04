"""
Crossword Grid Generator v2 - Forces mixed directions and fills all 88 cells.
"""
import json, random
from typing import Optional

COLS, ROWS = 8, 11

WORDS = [
    {"palavra": "EMPATIA", "dica_curta": "Senso de união", "dica_completa": "Habilidade de se colocar no lugar do outro durante a ação", "letras": 7},
    {"palavra": "IMPACTO", "dica_curta": "Efeito positivo", "dica_completa": "Resultado transformador gerado pela atuação voluntária na realidade brasileira", "letras": 7},
    {"palavra": "SOCIAL", "dica_curta": "Campo de atuação", "dica_completa": "Área voltada para a redução de desigualdades e defesa de direitos", "letras": 6},
    {"palavra": "EQUIPE", "dica_curta": "Base funcional", "dica_completa": "Profissionais e voluntários que trabalham em harmonia para realizar a missão", "letras": 6},
    {"palavra": "ADESAO", "dica_curta": "Termo formal", "dica_completa": "Documento de compromisso assinado entre o voluntário e a instituição", "letras": 6},
    {"palavra": "AJUDA", "dica_curta": "Dar suporte", "dica_completa": "Prestar auxílio voluntário a quem precisa de apoio na comunidade", "letras": 5},
    {"palavra": "CAUSA", "dica_curta": "Motivo nobre", "dica_completa": "Propósito social que motiva o voluntário a agir pela sociedade", "letras": 5},
    {"palavra": "GRUPO", "dica_curta": "Trabalho coletivo", "dica_completa": "Conjunto de pessoas que cooperam juntas em prol de um objetivo", "letras": 5},
    {"palavra": "TEMPO", "dica_curta": "Recurso doado", "dica_completa": "Parcela do dia que o cidadão dedica às causas sociais", "letras": 5},
    {"palavra": "LIDER", "dica_curta": "Guia da equipe", "dica_completa": "Responsável por orientar e motivar os voluntários em suas funções", "letras": 5},
    {"palavra": "VALOR", "dica_curta": "Princípio ético", "dica_completa": "Característica que orienta a existência e a cultura da organização", "letras": 5},
    {"palavra": "ACAO", "dica_curta": "Atitude social", "dica_completa": "Atividade espontânea realizada para promover mudanças positivas na comunidade", "letras": 4},
    {"palavra": "DOAR", "dica_curta": "Entregar tempo", "dica_completa": "Ato de ceder trabalho e energia sem receber remuneração financeira", "letras": 4},
    {"palavra": "REDE", "dica_curta": "União coletiva", "dica_completa": "Grande grupo de pessoas que colaboram para realizar propósitos sociais", "letras": 4},
    {"palavra": "VIDA", "dica_curta": "Sentido humano", "dica_completa": "O voluntariado proporciona crescimento pessoal e melhora a existência do próximo", "letras": 4},
    {"palavra": "META", "dica_curta": "Objetivo claro", "dica_completa": "Resultado ou propósito que o projeto social busca efetivamente alcançar", "letras": 4},
    {"palavra": "ONG", "dica_curta": "Entidade civil", "dica_completa": "Organização sem fins lucrativos que coordena ações de voluntariado no país", "letras": 3},
    {"palavra": "BEM", "dica_curta": "Fazer o bem", "dica_completa": "Prática solidária voltada para auxiliar o próximo e a sociedade", "letras": 3},
    {"palavra": "DAR", "dica_curta": "Oferecer algo", "dica_completa": "Ato de doar seu tempo ou talento para uma causa social", "letras": 3},
    {"palavra": "LEI", "dica_curta": "Regra federal", "dica_completa": "Normas que regulamentam o serviço voluntário em território brasileiro", "letras": 3},
]

EMPTY, INPUT, CLUE = 0, 1, 2

class Grid:
    def __init__(self):
        self.cell = [[EMPTY]*COLS for _ in range(ROWS)]
        self.letter = [['']*COLS for _ in range(ROWS)]
        self.clues = {}
        self.placed = []

    def can_place(self, word, x, y, dx, dy):
        # Clue cell at (x,y), letters start at (x+dx, y+dy)
        if not (0 <= x < COLS and 0 <= y < ROWS):
            return False
        if self.cell[y][x] != EMPTY:
            return False
        for i, ch in enumerate(word):
            nx, ny = x + dx*(i+1), y + dy*(i+1)
            if not (0 <= nx < COLS and 0 <= ny < ROWS):
                return False
            if self.cell[ny][nx] == CLUE:
                return False
            if self.cell[ny][nx] == INPUT and self.letter[ny][nx] != ch:
                return False
        return True

    def score_place(self, word, x, y, dx, dy):
        score = 0
        for i, ch in enumerate(word):
            nx, ny = x + dx*(i+1), y + dy*(i+1)
            if self.cell[ny][nx] == INPUT and self.letter[ny][nx] == ch:
                score += 20  # intersection!
            for ddx, ddy in [(-1,0),(1,0),(0,-1),(0,1)]:
                ax, ay = nx+ddx, ny+ddy
                if 0 <= ax < COLS and 0 <= ay < ROWS and self.cell[ay][ax] != EMPTY:
                    score += 1
        return score

    def place(self, wd, x, y, dx, dy):
        word = wd["palavra"]
        arrow = "right" if dx == 1 else "down"
        self.cell[y][x] = CLUE
        self.clues[(x,y)] = {"dica_curta": wd["dica_curta"], "dica_completa": wd["dica_completa"], "arrow": arrow, "word": word}
        for i, ch in enumerate(word):
            nx, ny = x + dx*(i+1), y + dy*(i+1)
            self.cell[ny][nx] = INPUT
            self.letter[ny][nx] = ch
        self.placed.append({"data": wd, "dir": "horizontal" if dx==1 else "vertical", "cx": x, "cy": y, "dx": dx, "dy": dy})

    def empties(self):
        return sum(1 for r in range(ROWS) for c in range(COLS) if self.cell[r][c] == EMPTY)

    def show(self):
        for r in range(ROWS):
            s = ""
            for c in range(COLS):
                if self.cell[r][c] == EMPTY: s += " ·  "
                elif self.cell[r][c] == CLUE:
                    a = self.clues.get((c,r),{}).get("arrow","?")
                    s += f"[{'→' if a=='right' else '↓'}] "
                else: s += f" {self.letter[r][c]}  "
            print(f"R{r:2d}: {s}")

    def export_cells(self):
        cells = []
        for r in range(ROWS):
            for c in range(COLS):
                if self.cell[r][c] == INPUT:
                    wids = []
                    for pw in self.placed:
                        w = pw["data"]["palavra"]
                        for i in range(len(w)):
                            nx = pw["cx"] + pw["dx"]*(i+1)
                            ny = pw["cy"] + pw["dy"]*(i+1)
                            if nx == c and ny == r:
                                wids.append(pw["data"]["palavra"])
                    cells.append({"type":"input","x":c,"y":r,"answer":self.letter[r][c],"wordIds":wids})
                elif self.cell[r][c] == CLUE:
                    info = self.clues.get((c,r),{})
                    cells.append({"type":"clue","x":c,"y":r,"text":info.get("dica_completa",""),"dica_curta":info.get("dica_curta",""),"arrow":info.get("arrow","right"),"word":info.get("word","")})
        return cells


def solve(words, attempts=2000):
    best_g, best_e = None, ROWS*COLS
    for att in range(attempts):
        g = Grid()
        wlist = list(words)
        random.shuffle(wlist)
        # Alternate sorting strategies
        if att % 4 == 0: wlist.sort(key=lambda w: -w["letras"])
        elif att % 4 == 1: wlist.sort(key=lambda w: w["letras"])

        for wd in wlist:
            word = wd["palavra"]
            best_pos, best_sc = None, -1
            # Try both directions
            for dx, dy in [(1,0),(0,1)]:
                for y in range(ROWS):
                    for x in range(COLS):
                        if g.can_place(word, x, y, dx, dy):
                            sc = g.score_place(word, x, y, dx, dy)
                            # Bonus for vertical to encourage mixing
                            if dy == 1: sc += 3
                            if sc > best_sc:
                                best_sc = sc
                                best_pos = (x, y, dx, dy)
            if best_pos:
                g.place(wd, *best_pos)

        e = g.empties()
        if e < best_e:
            best_e = e
            best_g = g
            if att % 100 == 0 or e <= 2:
                print(f"  Att {att}: {len(g.placed)} words, {e} empty")
        if e == 0:
            print(f"  PERFECT at attempt {att}!")
            return g
    return best_g


if __name__ == "__main__":
    print(f"Grid {COLS}x{ROWS}={COLS*ROWS} cells, {len(WORDS)} words, {sum(w['letras'] for w in WORDS)} letters\n")
    g = solve(WORDS, 3000)
    if g:
        print(f"\n{'='*50}")
        print(f"Result: {len(g.placed)} words, {g.empties()} empty")
        print(f"{'='*50}\n")
        g.show()
        print(f"\nWords placed:")
        for pw in g.placed:
            d = "H" if pw["dir"]=="horizontal" else "V"
            print(f"  {pw['data']['palavra']:10s} {d} clue@({pw['cx']},{pw['cy']})")
        cells = g.export_cells()
        out = "RAG MANUAL CRUZADA/grid_cells.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(cells, f, ensure_ascii=False, indent=2)
        print(f"\nExported {len(cells)} cells to {out}")
