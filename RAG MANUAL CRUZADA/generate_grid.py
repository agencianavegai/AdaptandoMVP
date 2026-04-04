import json
import random
import copy

WORDS = [
    {"palavra": "EMPATIA", "dica_curta": "Senso de união", "dica_completa": "Habilidade de se colocar no lugar do outro durante a ação", "letras": 7},
    {"palavra": "IMPACTO", "dica_curta": "Efeito positivo", "dica_completa": "Resultado transformador gerado pela atuação voluntária na realidade", "letras": 7},
    {"palavra": "SOCIAL", "dica_curta": "Campo de atuação", "dica_completa": "Área voltada para a redução de desigualdades e defesa de direitos", "letras": 6},
    {"palavra": "EQUIPE", "dica_curta": "Base funcional", "dica_completa": "Profissionais e voluntários que trabalham em harmonia", "letras": 6},
    {"palavra": "ADESAO", "dica_curta": "Termo formal", "dica_completa": "Documento de compromisso assinado entre o voluntário e a instituição", "letras": 6},
    {"palavra": "AJUDA", "dica_curta": "Dar suporte", "dica_completa": "Prestar auxílio voluntário a quem precisa de apoio", "letras": 5},
    {"palavra": "CAUSA", "dica_curta": "Motivo nobre", "dica_completa": "Propósito social que motiva o voluntário a agir", "letras": 5},
    {"palavra": "GRUPO", "dica_curta": "Trabalho coletivo", "dica_completa": "Conjunto de pessoas que cooperam juntas em prol de um objetivo", "letras": 5},
    {"palavra": "TEMPO", "dica_curta": "Recurso doado", "dica_completa": "Parcela do dia que o cidadão dedica às causas sociais", "letras": 5},
    {"palavra": "LIDER", "dica_curta": "Guia da equipe", "dica_completa": "Responsável por orientar e motivar os voluntários", "letras": 5},
    {"palavra": "VALOR", "dica_curta": "Princípio ético", "dica_completa": "Característica que orienta a existência e a cultura da organização", "letras": 5},
    {"palavra": "ACAO", "dica_curta": "Atitude social", "dica_completa": "Atividade espontânea realizada para promover mudanças positivas", "letras": 4},
    {"palavra": "DOAR", "dica_curta": "Entregar", "dica_completa": "Ato de ceder trabalho e energia sem receber remuneração", "letras": 4},
    {"palavra": "REDE", "dica_curta": "União", "dica_completa": "Grande grupo de pessoas que colaboram para realizar propósitos sociais", "letras": 4},
    {"palavra": "VIDA", "dica_curta": "Sentido", "dica_completa": "O voluntariado proporciona crescimento pessoal e melhora a existência", "letras": 4},
    {"palavra": "META", "dica_curta": "Objetivo", "dica_completa": "Resultado ou propósito que o projeto social busca alcançar", "letras": 4},
    {"palavra": "ONG", "dica_curta": "Entidade", "dica_completa": "Organização sem fins lucrativos que coordena ações de voluntariado", "letras": 3},
    {"palavra": "BEM", "dica_curta": "Fazer o bem", "dica_completa": "Prática solidária voltada para auxiliar o próximo", "letras": 3},
    {"palavra": "DAR", "dica_curta": "Oferecer algo", "dica_completa": "Ato de doar seu tempo ou talento para uma causa social", "letras": 3},
    {"palavra": "LEI", "dica_curta": "Regra", "dica_completa": "Normas que regulamentam o serviço voluntário", "letras": 3},
]

EMPTY, INPUT, CLUE = 0, 1, 2

class Grid:
    def __init__(self, size=60):
        self.size = size
        self.cell = [[EMPTY]*size for _ in range(size)]
        self.letter = [['']*size for _ in range(size)]
        self.clues = {}
        self.placed = []

    def can_place(self, wd, x, y, dx, dy):
        """
        Word starts at (x,y). It will place a CLUE at (x-dx, y-dy).
        Checks all rigorous constraints.
        """
        word = wd["palavra"]
        clue_x, clue_y = x - dx, y - dy
        
        # Boundaries checking for clue cell
        if not (0 <= clue_x < self.size and 0 <= clue_y < self.size):
            return False
            
        # The clue cell MUST be completely empty (no sharing clues for now to ensure cleanliness)
        if self.cell[clue_y][clue_x] != EMPTY:
            return False

        # Constraint: The cell right BEFORE the clue cell should ideally not be a letter belonging to the same line
        # but since the clue cell blocks it, it's fine.

        intersections = 0
        
        for i, ch in enumerate(word):
            cx, cy = x + dx*i, y + dy*i
            
            if not (0 <= cx < self.size and 0 <= cy < self.size):
                return False
                
            if self.cell[cy][cx] == CLUE:
                return False
                
            if self.cell[cy][cx] == INPUT:
                if self.letter[cy][cx] != ch:
                    return False
                # If there's already an input here, it implies it's an intersection.
                # In intersections, we do NOT check perpendicular emptiness, because the intersection is valid!
                intersections += 1
            elif self.cell[cy][cx] == EMPTY:
                # If this is an empty cell, we check its surrounding perpendicular neighbors 
                # to prevent words from running parallel and touching side-by-side.
                # If we are placing HORIZONTALLY (dx=1), we check above (cy-1) and below (cy+1).
                px1, py1 = cx - dy, cy - dx
                px2, py2 = cx + dy, cy + dx
                
                if 0 <= px1 < self.size and 0 <= py1 < self.size and self.cell[py1][px1] == INPUT:
                    return False
                if 0 <= px2 < self.size and 0 <= py2 < self.size and self.cell[py2][px2] == INPUT:
                    return False
                    
        # Check the space immediately AFTER the word (must be empty or clue, cannot be INPUT to avoid concatenating)
        after_x, after_y = x + dx * len(word), y + dy * len(word)
        if 0 <= after_x < self.size and 0 <= after_y < self.size:
            if self.cell[after_y][after_x] == INPUT:
                return False

        # It must connect to at least one existing word (unless it's the very first word)
        if len(self.placed) > 0 and intersections == 0:
            return False
            
        return True

    def place(self, wd, x, y, dx, dy):
        word = wd["palavra"]
        arrow = "right" if dx == 1 else "down"
        
        clue_x, clue_y = x - dx, y - dy
        self.cell[clue_y][clue_x] = CLUE
        self.clues[(clue_x, clue_y)] = {
            "dica_curta": wd["dica_curta"],
            "dica_completa": wd["dica_completa"],
            "arrow": arrow,
            "word": word
        }
        
        for i, ch in enumerate(word):
            cx, cy = x + dx*i, y + dy*i
            self.cell[cy][cx] = INPUT
            self.letter[cy][cx] = ch
            
        self.placed.append({
            "data": wd,
            "dir": "horizontal" if dx == 1 else "vertical",
            "start_x": x, "start_y": y,
            "dx": dx, "dy": dy
        })

    def get_options(self, word):
        options = []
        w_str = word["palavra"]
        
        for i, ch in enumerate(w_str):
            for gy in range(self.size):
                for gx in range(self.size):
                    if self.cell[gy][gx] == INPUT and self.letter[gy][gx] == ch:
                        # Determine direction of existing word at this location?
                        # Actually we can just test both, the constraints will block collinear placement 
                        # because the clue cell or end of word will touch inappropriately.
                        for dx, dy in [(1,0), (0,1)]:
                            start_x = gx - dx * i
                            start_y = gy - dy * i
                            if self.can_place(word, start_x, start_y, dx, dy):
                                options.append((start_x, start_y, dx, dy))
        random.shuffle(options)
        return options

    def remove(self, wd, x, y, dx, dy):
        pass

    def crop_and_export(self):
        if not self.placed:
            return None
            
        min_x = min_y = self.size
        max_x = max_y = -1
        
        for p in self.placed:
            w_len = len(p["data"]["palavra"])
            x, y = p["start_x"], p["start_y"]
            dx, dy = p["dx"], p["dy"]
            
            cx, cy = x - dx, y - dy
            min_x = min(min_x, cx)
            min_y = min(min_y, cy)
            max_x = max(max_x, cx)
            max_y = max(max_y, cy)
            
            ex, ey = x + dx * (w_len - 1), y + dy * (w_len - 1)
            min_x = min(min_x, ex)
            min_y = min(min_y, ey)
            max_x = max(max_x, ex)
            max_y = max(max_y, ey)
            
        min_x = max(0, min_x - 1)
        min_y = max(0, min_y - 1)
        max_x = min(self.size - 1, max_x + 1)
        max_y = min(self.size - 1, max_y + 1)
        
        width = max_x - min_x + 1
        height = max_y - min_y + 1
        
        if width > 20 or height > 20:
            return None, 0
        
        export_data = {
            "largura": width,
            "altura": height,
            "cells": []
        }
        
        for ry in range(min_y, max_y + 1):
            for rx in range(min_x, max_x + 1):
                if self.cell[ry][rx] == INPUT:
                    wids = []
                    for pw in self.placed:
                        w = pw["data"]["palavra"]
                        # Check if intersection belongs to this word
                        offset = -1
                        if pw["dx"] == 1 and pw["start_y"] == ry and pw["start_x"] <= rx < pw["start_x"] + len(w):
                            wids.append({ "dir": "horizontal", "id": w })
                        elif pw["dy"] == 1 and pw["start_x"] == rx and pw["start_y"] <= ry < pw["start_y"] + len(w):
                            wids.append({ "dir": "vertical", "id": w })
                    
                    export_data["cells"].append({
                        "type": "input", "x": rx - min_x, "y": ry - min_y,
                        "answer": self.letter[ry][rx], "wordIds": [w["id"] for w in wids]
                    })
                elif self.cell[ry][rx] == CLUE:
                    info = self.clues.get((rx, ry), {})
                    export_data["cells"].append({
                        "type": "clue", "x": rx - min_x, "y": ry - min_y,
                        "text": info.get("dica_completa", ""),
                        "dica_curta": info.get("dica_curta", ""),
                        "arrow": info.get("arrow", "right"),
                        "word": info.get("word", "")
                    })
                    
        return export_data, len(self.placed)


def solve_backtracking(words):
    best_grid = None
    best_count = 0
    total_attempts = 0
    
    def dfs(grid, unplaced):
        nonlocal best_grid, best_count, total_attempts
        total_attempts += 1
        
        if total_attempts > 6000:
            return
            
        # Optional: Prune if grid bounding box is already > 20
        c_min_x = c_min_y = grid.size
        c_max_x = c_max_y = -1
        for p in grid.placed:
            w_len = len(p["data"]["palavra"])
            x, y = p["start_x"], p["start_y"]
            dx, dy = p["dx"], p["dy"]
            cx, cy = x - dx, y - dy
            c_min_x, c_min_y = min(c_min_x, cx), min(c_min_y, cy)
            c_max_x, c_max_y = max(c_max_x, cx), max(c_max_y, cy)
            ex, ey = x + dx * (w_len - 1), y + dy * (w_len - 1)
            c_min_x, c_min_y = min(c_min_x, ex), min(c_min_y, ey)
            c_max_x, c_max_y = max(c_max_x, ex), max(c_max_y, ey)
            
        if grid.placed:
            width = c_max_x - c_min_x + 3  # Add 2 for padding
            height = c_max_y - c_min_y + 3
            if width > 20 or height > 20:
                return
            
        if len(grid.placed) > best_count:
            best_count = len(grid.placed)
            best_grid = copy.deepcopy(grid)
            
        if not unplaced:
            return
            
        options_found = False
        for i, w in enumerate(unplaced):
            options = grid.get_options(w)
            if options:
                options_found = True
                # Limit branches
                for sx, sy, dx, dy in options[:4]:
                    new_grid = copy.deepcopy(grid)
                    new_grid.place(w, sx, sy, dx, dy)
                    dfs(new_grid, unplaced[:i] + unplaced[i+1:])
                    if best_count == len(words):
                        return
        
        # If no word can be placed, we just return to backtrack
        if not options_found:
            # print("DEBUG: No options found for any word in unplaced list of length", len(unplaced))
            return

    for _ in range(8):
        if best_count == len(words):
            break
        grid = Grid(size=50)
        wlist = list(words)
        random.shuffle(wlist)
        
        # Pick random orthogonal direction
        dir = random.choice([(1,0), (0,1)])
        grid.place(wlist[0], 25, 25, dir[0], dir[1])
        
        dfs(grid, wlist[1:])

    return best_grid, best_count

if __name__ == "__main__":
    print(f"Total palavras para processar: {len(WORDS)}")
    
    final_grid, word_count = solve_backtracking(WORDS)
    
    if final_grid:
        export_data, count = final_grid.crop_and_export()
        print(f"✅ Encontrada disposição com {count} palavras conectadas perfeitamente.")
        if count < len(WORDS):
            print(f"⚠️ Atenção: Não foi possível conectar matematicamente todas as {len(WORDS)} palavras.")
            print("Talvez você precise gerar mais palavras para aumentar as conexões possiveis.")
            
        out = "RAG MANUAL CRUZADA/grid_cells.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        print(f"Grid gerado salvo em {out}")
        print(f"Dimensões finais recortadas: {export_data['largura']}x{export_data['altura']}")
    else:
        print("❌ Falha crítica ao gerar o grid.")
