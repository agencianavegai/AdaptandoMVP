const fs = require('fs');

const words = [
  {"id":"ce352f2d-4672-48ae-9eb7-364e9f33b942","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"VOLUNTARIADO","dica":"Atividade não remunerada prestada por pessoa física a entidades públicas ou privadas com fins sociais.","pos_x":0,"pos_y":5,"direcao":"horizontal","wordId":"ce352f2d-4672-48ae-9eb7-364e9f33b942"},
  {"id":"5b175902-4623-47f1-8fbc-c75fa326bfad","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"DOACAO","dica":"Atitude de entregar tempo, talento ou bens de forma espontânea em benefício da comunidade.","pos_x":1,"pos_y":0,"direcao":"vertical","wordId":"5b175902-4623-47f1-8fbc-c75fa326bfad"},
  {"id":"e51d3bd2-85e0-4a31-962a-b0adc60950e2","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"ADESAO","dica":"Termo jurídico obrigatório para formalizar legalmente o compromisso entre o voluntário e a organização.","pos_x":11,"pos_y":0,"direcao":"vertical","wordId":"e51d3bd2-85e0-4a31-962a-b0adc60950e2"},
  {"id":"60d3b043-af76-4bb9-8dad-5e17613c6571","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"CIDADANIA","dica":"O trabalho voluntário é considerado por especialistas como um exercício fundamental desta participação social.","pos_x":10,"pos_y":3,"direcao":"vertical","wordId":"60d3b043-af76-4bb9-8dad-5e17613c6571"},
  {"id":"14bd353e-5c94-4ab2-95bc-8f18288c9191","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"SOLIDARIO","dica":"Principal motivo que move 74% dos voluntários brasileiros a ajudarem o próximo e a comunidade.","pos_x":0,"pos_y":1,"direcao":"horizontal","wordId":"14bd353e-5c94-4ab2-95bc-8f18288c9191"},
  {"id":"f9e1c556-6c3f-40e6-af58-0bde44750761","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"GESTAO","dica":"Processo indispensável para organizar o corpo de voluntários com profissionalismo e evitar conflitos internos.","pos_x":5,"pos_y":2,"direcao":"vertical","wordId":"f9e1c556-6c3f-40e6-af58-0bde44750761"},
  {"id":"71220ce0-1bd1-4e73-bc1a-b6459b854fdf","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"CAUSA","dica":"Propósito social ou missão específica com a qual o voluntário deve se identificar para atuar com paixão.","pos_x":0,"pos_y":2,"direcao":"horizontal","wordId":"71220ce0-1bd1-4e73-bc1a-b6459b854fdf"},
  {"id":"76029dc5-f654-4d55-89b8-af11c5819dae","grid_id":"8cc4ba9e-e2b0-4909-b840-3c795da49c42","palavra":"RECURSO","dica":"A captação e distribuição destes itens físicos é a atividade voluntária mais frequente.","pos_x":7,"pos_y":5,"direcao":"vertical","wordId":"76029dc5-f654-4d55-89b8-af11c5819dae"}
];

let inputCells = {};
let clueCells = [];

const shift = 1;

words.forEach(w => {
  w.pos_x += shift;
  w.pos_y += shift;
  
  for(let i=0; i<w.palavra.length; i++) {
    let px = w.direcao === 'horizontal' ? w.pos_x + i : w.pos_x;
    let py = w.direcao === 'vertical' ? w.pos_y + i : w.pos_y;
    let key = `${px},${py}`;
    if (!inputCells[key]) {
      inputCells[key] = { type: 'input', x: px, y: py, answer: w.palavra[i], wordIds: [w.id] };
    } else {
      inputCells[key].wordIds.push(w.id);
    }
  }

  let cx = w.direcao === 'horizontal' ? w.pos_x - 1 : w.pos_x;
  let cy = w.direcao === 'vertical' ? w.pos_y - 1 : w.pos_y;
  let arrow = w.direcao === 'horizontal' ? 'right' : 'down';

  clueCells.push({ type: 'clue', x: cx, y: cy, text: w.dica, arrow: arrow, wordId: w.id });
});

let finalCells = [...Object.values(inputCells), ...clueCells];

const sql = `UPDATE public.palavras_cruzadas_grids SET largura=14, altura=18, cells='${JSON.stringify(finalCells).replace(/'/g, "''")}' WHERE id='8cc4ba9e-e2b0-4909-b840-3c795da49c42';`;
fs.writeFileSync('update_grid.sql', sql);
console.log("update_grid.sql generated!");
