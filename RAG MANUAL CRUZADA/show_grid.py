import json
with open('RAG MANUAL CRUZADA/grid_cells.json','r',encoding='utf-8') as f:
    cells = json.load(f)
print(f'Total cells: {len(cells)}')
print(f'Input cells: {sum(1 for c in cells if c["type"]=="input")}')
print(f'Clue cells: {sum(1 for c in cells if c["type"]=="clue")}')
grid = [['.']*8 for _ in range(11)]
for c in cells:
    x,y = c['x'],c['y']
    if c['type']=='input':
        grid[y][x] = c['answer']
    else:
        grid[y][x] = 'R' if c['arrow']=='right' else 'D'
for r in range(11):
    print(f"R{r:2d}: " + "  ".join(f"{grid[r][c]:>2s}" for c in range(8)))
print()
for c in cells:
    if c['type']=='clue':
        print(f"  [{c['arrow']:>5s}] ({c['x']},{c['y']}) {c['word']:10s} | {c.get('dica_curta','')}")
