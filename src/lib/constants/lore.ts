export interface WorldLore {
  title: string;
  weather: string;
  theme: string;
  description: string;
}

export const WORLD_LORE: Record<number, WorldLore> = {
  1: {
    title: "Mundo 1",
    weather: "Tempestade Escura",
    theme: "Voluntariado",
    description: "Você aterrissou num passado caótico e chuvoso. As pessoas querem ajudar umas às outras, mas estão perdidas. Sua primeira missão é acender a faísca do espírito voluntário para reunir sua equipe."
  },
  2: {
    title: "Mundo 2",
    weather: "Chuvisco Forte",
    theme: "Terceiro Setor",
    description: "A chuva bate forte. Você descobre que existem outros grupos tentando fazer o bem, mas isolados. Você precisa entender como esse \"Terceiro Setor\" funciona para unir forças."
  },
  3: {
    title: "Mundo 3",
    weather: "Chuva Moderada",
    theme: "O que é OSC",
    description: "A tempestade começa a ceder. É hora de ensinar esse povo a construir a primeira \"armação\" da pipa: fundar uma Organização da Sociedade Civil real."
  },
  4: {
    title: "Mundo 4",
    weather: "Tempo Fechado",
    theme: "MROSC",
    description: "Nuvens cinzas de burocracia bloqueiam a visão. Para proteger a sua criação, você precisa dominar o escudo da lei, o Marco Regulatório (MROSC)."
  },
  5: {
    title: "Mundo 5",
    weather: "Nublado",
    theme: "Gestão de Projetos",
    description: "O vento está imprevisível. Sem gestão, a pipa vai cair. Você ensina técnicas de projetos para estabilizar o voo e preparar o lançamento."
  },
  6: {
    title: "Mundo 6",
    weather: "Nuvens Esparsas",
    theme: "Captação de Recursos",
    description: "A armação está pronta, mas falta a \"linha\" para ela subir. Você precisa captar recursos para financiar o papel de seda e a rabiola."
  },
  7: {
    title: "Mundo 7",
    weather: "Aberturas de Sol",
    theme: "Comunicação",
    description: "O primeiro raio de sol aparece! A pipa está pronta. É hora de gritar para o mundo e chamar a comunidade para ver o lançamento."
  },
  8: {
    title: "Mundo 8",
    weather: "Quase Limpo",
    theme: "Transparência",
    description: "O céu está abrindo. Para que o povo confie em você e segure a carretilha junto, você deve mostrar transparência em cada centavo gasto."
  },
  9: {
    title: "Mundo 9",
    weather: "Céu Azul",
    theme: "Tecnologia",
    description: "O céu está limpo e azul! A pipa voa alto, mas você usa a tecnologia para dar \"desbicadas\" e manobras incríveis, alcançando lugares inimagináveis."
  },
  10: {
    title: "Mundo 10",
    weather: "Céu Laranja",
    theme: "Diretoria (O Ádapo)",
    description: "O ápice. O sol colore o céu de laranja. A ONG está formada e salva. Você concluiu sua missão temporal e agora é um Diretor do Instituto Ádapo. A \"Arte de Cria\" dominou o céu!"
  }
};
