const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\andre\\.gemini\\antigravity\\brain\\c7396f30-a516-42ce-b9f6-4a560da73e60';
const stepsDir = path.join(brainDir, '.system_generated', 'steps');

const orderMapping = [
  { mundo_id: 1, step: 450, notebook_id: 'a6b34baa-1368-4783-975b-d950b74c17f6' },
  { mundo_id: 2, step: 388, notebook_id: '6858b336-bb37-4101-bf57-c2ad45e19661' },
  { mundo_id: 3, step: 389, notebook_id: '2555025b-586d-430e-ac39-fb2f8ac64edf' },
  { mundo_id: 4, step: 399, notebook_id: '6858b336-bb37-4101-bf57-c2ad45e19661' },
  { mundo_id: 5, step: 390, notebook_id: '53b9a1ab-e742-40a9-a14a-cce3aada69b6' },
  { mundo_id: 6, step: 400, notebook_id: 'da8cd8b1-9424-4b34-b7a3-3c500f28cb66' },
  { mundo_id: 7, step: 401, notebook_id: '12e270a9-1390-4812-b0db-4bccb877d491' },
  { mundo_id: 8, step: 418, notebook_id: '75ecd9e1-3f6c-4cad-bd79-0b43824a4ed4' },
  { mundo_id: 9, step: 445, notebook_id: 'c1e1b405-4470-431d-903d-14f399b98877' },
  { mundo_id: 10, step: 446, notebook_id: '82753203-e6e1-4a9b-9d7c-fe6c48195b1f' },
];

const seedData = [];

for (const mapping of orderMapping) {
  const filePath = path.join(stepsDir, String(mapping.step), 'output.txt');
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file for step ${mapping.step}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    const parsedLine = JSON.parse(raw);
    const answerStr = parsedLine.answer || raw;
    let jsonStr = answerStr;

    // Clean up potential markdown formatting around the JSON in answerStr
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      }
    }

    const data = JSON.parse(jsonStr);
    
    seedData.push({
      mundo_id: mapping.mundo_id,
      notebook_id: mapping.notebook_id,
      pilula: data.pilula,
      quizzes: data.quizzes
    });
    console.log(`Successfully parsed Mundo ${mapping.mundo_id}`);
  } catch (e) {
    console.error(`Failed to parse json for Mundo ${mapping.mundo_id} from step ${mapping.step}`);
    console.error(e);
    process.exit(1);
  }
}

const outputPath = path.join(__dirname, 'seed-data.json');
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
console.log(`Successfully wrote seed-data.json with ${seedData.length} worlds.`);
