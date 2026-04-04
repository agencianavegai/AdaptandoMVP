import json

with open("RAG MANUAL CRUZADA/grid_cells.json", "r", encoding="utf-8") as f:
    d = json.load(f)

print(f"Largura: {d['largura']}, Altura: {d['altura']}")
inp = [c for c in d["cells"] if c["type"] == "input"]
clue = [c for c in d["cells"] if c["type"] == "clue"]
print(f"Input cells: {len(inp)}, Clue cells: {len(clue)}, Total: {len(d['cells'])}")

# Count unique words from clue cells
words = set()
for c in clue:
    if "word" in c:
        words.add(c["word"])
print(f"Unique words: {len(words)}: {sorted(words)}")

# Display visual grid
grid = {}
for c in d["cells"]:
    grid[(c["x"], c["y"])] = c

print(f"\nGrid visual ({d['largura']}x{d['altura']}):")
for y in range(d["altura"]):
    row = ""
    for x in range(d["largura"]):
        cell = grid.get((x, y))
        if cell is None:
            row += "  .  "
        elif cell["type"] == "clue":
            arrow = cell.get("arrow", "?")
            if arrow == "right":
                row += " [->] "
            elif arrow == "down":
                row += " [v]  "
            else:
                row += " [?]  "
        elif cell["type"] == "input":
            row += f"  {cell['answer']}  "
    print(f"R{y:02d}: {row}")
