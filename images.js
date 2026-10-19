// Mapa palavra -> emoji para a atividade Palavra e Imagem (subset curado).
//
// Regras da curadoria:
//   - só palavras CONCRETAS com imagem inequívoca (nada de "verdade",
//     "tempo", "fazer", nomes próprios);
//   - uma palavra = um emoji; se duas palavras do words.js usam o mesmo
//     emoji, a atividade filtra para nunca mostrar dois iguais na mesma
//     questão (o dedupe acontece em activities/palavra-imagem.js);
//   - emojis precisam ser comuns (Unicode ≥ 13) para renderizar em
//     Windows/iPhone/Android.
//
// Para adicionar palavra: basta uma linha "palavra": "emoji",.
// A atividade avisa quando um nível tem menos de 10 palavras mapeadas.

export var IMAGES = {
  // ---------- nivel1 ----------
  // animais
  "gato": "🐱", "peixe": "🐟", "rato": "🐭", "urso": "🐻", "lobo": "🐺",
  "pato": "🦆", "galo": "🐓", "cisne": "🦢", "cabra": "🐐", "cobra": "🐍",
  "mosca": "🪰", "pomba": "🕊️", "boi": "🐂", "porco": "🐷", "cão": "🐶",
  "ave": "🐦", "baleia": "🐳", "polvo": "🐙", "lula": "🦑", "águia": "🦅",
  // alimentos
  "uva": "🍇", "ovo": "🥚", "mel": "🍯", "sal": "🧂", "pão": "🍞",
  "arroz": "🍚", "feijão": "🫘", "leite": "🥛", "carne": "🍖", "bolo": "🎂",
  "torta": "🥧", "bife": "🥩", "suco": "🧃", "café": "☕", "chá": "🍵",
  "água": "💧", "maçã": "🍎", "pera": "🍐", "melão": "🍈", "coco": "🥥",
  "limão": "🍋", "manga": "🥭", "milho": "🌽",
  // cores
  "azul": "🟦", "verde": "🟩", "vermelho": "🟥", "amarelo": "🟨",
  "branco": "⬜", "preto": "⬛", "roxo": "🟪",
  // numerais
  "zero": "0️⃣", "dois": "2️⃣", "três": "3️⃣", "quatro": "4️⃣",
  "cinco": "5️⃣", "seis": "6️⃣", "sete": "7️⃣", "oito": "8️⃣",
  "nove": "9️⃣", "dez": "🔟",
  // cidades
  "praça": "⛲", "ponte": "🌉", "prédio": "🏢", "igreja": "⛪",
  // verbos
  "comer": "🍽️", "beber": "🥤", "dormir": "😴", "ouvir": "👂",
  "rir": "😄", "ler": "📖",
  // natureza
  "sol": "☀️", "lua": "🌙", "flor": "🌸", "mar": "🌊", "luz": "💡",
  "vento": "🌬️", "neve": "❄️", "chuva": "🌧️", "raio": "⚡",
  "nuvem": "☁️", "manhã": "🌅", "rio": "🏞️", "onda": "🌊",
  "praia": "🏖️", "ilha": "🏝️", "terra": "🌍", "pedra": "🪨",
  "fogo": "🔥", "gelo": "🧊", "folha": "🍃", "árvore": "🌳",
  "grama": "🌿", "trovoada": "⛈️",
  // corpo
  "mão": "✋", "pé": "🦶", "olho": "👁️", "boca": "👄", "dente": "🦷",
  "nariz": "👃", "dedo": "👆", "unha": "💅", "osso": "🦴", "corpo": "🧍",
  "perna": "🦵", "língua": "👅", "barba": "🧔", "cabelo": "💇",
  "orelha": "👂",
  // objetos
  "casa": "🏠", "bola": "⚽", "livro": "📚", "cama": "🛏️",
  "garfo": "🍴", "colher": "🥄", "faca": "🔪", "chave": "🔑",
  "calça": "👖", "bota": "👢", "meia": "🧦", "blusa": "👕",
  "chapéu": "🎩", "anel": "💍", "roupa": "👗", "carro": "🚗",
  "trem": "🚂", "lâmpada": "💡", "martelo": "🔨", "corda": "🪢",
  "quadro": "🖼️",
  // emoções
  "riso": "😂", "amor": "❤️", "medo": "😨", "raiva": "😠",
  "nojo": "🤢", "calma": "😌", "vergonha": "😳",
  // outros
  "rei": "👑", "hora": "⏰", "mês": "🗓️", "pai": "👨", "mãe": "👩",
  "povo": "👥", "morte": "💀", "festa": "🎉", "arte": "🎨", "lei": "⚖️",

  // ---------- nivel2 ----------
  // animais
  "macaco": "🐒", "tigre": "🐯", "girafa": "🦒", "sapo": "🐸",
  "cachorro": "🐕", "cavalo": "🐴", "coelho": "🐰", "galinha": "🐔",
  "formiga": "🐜", "abelha": "🐝", "aranha": "🕷️", "pinguim": "🐧",
  "lagarta": "🐛", "coruja": "🦉", "leão": "🦁", "esquilo": "🐿️",
  "camelo": "🐫", "ovelha": "🐑", "morcego": "🦇", "elefante": "🐘",
  "canguru": "🦘",
  // alimentos
  "banana": "🍌", "queijo": "🧀", "laranja": "🍊", "morango": "🍓",
  "batata": "🥔", "cenoura": "🥕", "pêssego": "🍑", "cereja": "🍒",
  "alface": "🥬", "cebola": "🧅", "alho": "🧄", "pipoca": "🍿",
  "sanduíche": "🥪", "salada": "🥗", "sopa": "🍜", "macarrão": "🍝",
  "abacate": "🥑",
  // cidades
  "escola": "🏫", "cidade": "🏙️", "loja": "🏪", "hospital": "🏥",
  "cinema": "🎬", "teatro": "🎭", "estádio": "🏟️",
  // verbos
  "correr": "🏃", "andar": "🚶", "pular": "🤸", "cantar": "🎤",
  "dançar": "💃", "comprar": "🛒", "viajar": "✈️", "morar": "🏡",
  "trabalhar": "💼", "pensar": "🤔",
  // natureza
  "deserto": "🏜️", "floresta": "🌲", "estrela": "⭐", "planeta": "🪐",
  "inverno": "⛄",
  // corpo
  "coração": "❤️", "sangue": "🩸", "cérebro": "🧠",
  // objetos
  "janela": "🪟", "porta": "🚪", "barco": "⛵", "cadeira": "🪑",
  "sofá": "🛋️", "espelho": "🪞", "relógio": "⌚", "caderno": "📓",
  "lápis": "✏️", "papel": "📄", "caneta": "🖊️", "mochila": "🎒",
  "tesoura": "✂️", "rádio": "📻", "táxi": "🚕", "avião": "✈️",
  "ônibus": "🚌", "metrô": "🚇", "navio": "🚢", "régua": "📏",
  "gravata": "👔", "sapato": "👟", "lanterna": "🔦", "despertador": "⏰",
  // emoções
  "tristeza": "😢", "esperança": "🤞", "susto": "😱",
  // outros
  "música": "🎵", "poema": "📝", "amigo": "👫", "dinheiro": "💵",
  "presente": "🎁", "vitória": "🏆", "medalha": "🏅", "criança": "👶",
  "menino": "👦", "menina": "👧",

  // ---------- nivel3 ----------
  // animais
  "hipopótamo": "🦛", "borboleta": "🦋", "tartaruga": "🐢",
  "camaleão": "🦎", "pavão": "🦚", "besouro": "🪲", "lontra": "🦦",
  // alimentos
  "abacaxi": "🍍", "chocolate": "🍫", "melancia": "🍉",
  "amendoim": "🥜", "pirulito": "🍭", "sorvete": "🍨",
  "biscoito": "🍪", "panqueca": "🥞",
  // cidades
  "restaurante": "🍽️", "padaria": "🥖", "museu": "🏛️", "castelo": "🏰",
  // verbos
  "construir": "🏗️",
  // natureza
  "montanha": "⛰️", "palmeira": "🌴", "vulcão": "🌋",
  // corpo
  "pulmão": "🫁",
  // objetos
  "escada": "🪜", "guarda-chuva": "☂️", "computador": "💻",
  "cadeado": "🔒", "elevador": "🛗", "impressora": "🖨️",
  "televisão": "📺", "microfone": "🎙️", "telefone": "☎️",
  "bicicleta": "🚲", "celular": "📱", "teclado": "⌨️", "câmera": "📷",
  "brinquedo": "🧸",
  // emoções
  "alegria": "😃",
  // outros
  "casamento": "💒", "amizade": "🤝", "aventura": "🗺️",
  "universo": "🌌", "pintura": "🖌️", "família": "👨‍👩‍👧",

  // ---------- nivel4 ----------
  "furacão": "🌀", "telescópio": "🔭", "microscópio": "🔬",
  "calendário": "📅", "fotografia": "📸", "rodovia": "🛣️",
  "rinoceronte": "🦏",

  // ---------- nivel5 ----------
  "pterodátilo": "🦕"
};
