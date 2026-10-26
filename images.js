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
  "pterodátilo": "🦕",

  // ---------- expansão (níveis 1 a 5, 5.295 palavras) ----------
  // ---------- nivel1 ----------
  // animais
  "vaca": "🐮", "raposa": "🦊", "veado": "🦌", "zebra": "🦓", "lhama": "🦙",
  "foca": "🦭", "tubarão": "🦈", "golfinho": "🐬", "caranguejo": "🦀", "lagosta": "🦞",
  "camarão": "🦐", "barata": "🪳", "mosquito": "🦟", "minhoca": "🪱", "caracol": "🐌",
  "javali": "🐗", "gorila": "🦍", "búfalo": "🐃", "escorpião": "🦂", "gafanhoto": "🦗",
  "panda": "🐼",
  // alimentos
  "frango": "🍗", "salsicha": "🌭", "abóbora": "🎃", "brócolis": "🥦", "pimentão": "🫑",
  "pimenta": "🌶️", "tomate": "🍅", "pepino": "🥒", "bala": "🍬", "rosquinha": "🍩",
  "mingau": "🥣", "trigo": "🌾", "omelete": "🍳",
  // cidades
  "bonde": "🚊", "porto": "⚓", "correio": "✉️", "oficina": "🛠️",
  // natureza
  "noite": "🌃", "tronco": "🪵", "broto": "🌱", "planta": "🪴", "ninho": "🪺",
  "cometa": "☄️", "neblina": "🌫️", "margarida": "🌼", "girassol": "🌻", "cacto": "🌵",
  "outono": "🍁", "calor": "🥵", "frio": "🥶", "bambu": "🎋", "concha": "🐚",
  "pena": "🪶", "teia": "🕸️", "cogumelo": "🍄",
  // corpo
  "rosto": "🙂", "braço": "💪", "polegar": "👍", "suor": "💦",
  // objetos
  "lenço": "🧣", "jogo": "🎲", "balde": "🪣", "torneira": "🚰", "vela": "🕯️",
  "agulha": "🪡", "chinelo": "🩴", "boné": "🧢", "jaqueta": "🧥", "pijama": "🛌",
  "luva": "🧤", "bolsa": "👜", "mala": "🧳", "moeda": "🪙", "cartão": "💳",
  "balão": "🎈", "caminhão": "🚚", "trator": "🚜", "canoa": "🛶", "sabonete": "🧼",
  "fita": "🎗️", "vassoura": "🧹", "esponja": "🧽", "lixo": "🗑️", "jornal": "📰",
  "óculos": "👓", "sino": "🔔", "violão": "🎸",
  // outros
  "avô": "👴", "professor": "🧑‍🏫", "médico": "🩺", "bombeiro": "🚒", "policial": "🚔",
  "piloto": "🧑‍✈️", "circo": "🎪", "lanche": "🍔", "banho": "🚿", "segredo": "🤫",
  "herói": "🦸", "monstro": "👹", "fantasma": "👻", "bruxa": "🧙‍♀️", "dragão": "🐉",
  "princesa": "👸", "tesouro": "💰", "mapa": "🗺️", "bússola": "🧭", "letra": "🔤",
  "número": "🔢",

  // ---------- nivel2 ----------
  // animais
  "jacaré": "🐊", "castor": "🦫", "ouriço": "🦡", "ostra": "🦪", "peru": "🦃",
  "papagaio": "🦜", "flamingo": "🦩", "koala": "🐨", "dinossauro": "🦖", "mamute": "🦣",
  // alimentos
  "azeitona": "🫒",
  // cidades
  "barbearia": "💈", "academia": "🏋️", "banco": "🏦", "semáforo": "🚦", "mesquita": "🕌",
  "sinagoga": "🕍", "cemitério": "⚰️", "pizzaria": "🍕", "hotel": "🏨", "fliperama": "🕹️",
  "banheiro": "🚽", "faculdade": "🎓",
  // natureza
  "anoitecer": "🌇", "faísca": "✨", "tulipa": "🌷", "hibisco": "🌺", "diamante": "💎",
  // corpo
  "ferida": "🩹", "febre": "🤒", "espirro": "🤧", "bocejo": "🥱", "enjoo": "🤢",
  "tontura": "🥴", "vômito": "🤮", "massagem": "💆",
  // objetos
  "tijolo": "🧱", "panela": "🍲", "piscina": "🏊", "cesto": "🧺", "tomada": "🔌",
  "bateria": "🔋", "termômetro": "🌡️", "serrote": "🪚", "moto": "🏍️", "ambulância": "🚑",
  "terno": "🤵", "cofre": "🔐", "alfinete": "📌", "clipe": "📎", "pacote": "📦",
  "robô": "🤖", "violino": "🎻", "novelo": "🧶", "pipa": "🪁", "baralho": "🃏",
  "raquete": "🏸",
  // outros
  "aluno": "🧑‍🎓", "motorista": "🧑‍🚗", "pescador": "🎣", "escritor": "✍️", "duende": "🧝",
  "fada": "🧚", "vilão": "🦹", "tenda": "⛺", "trilha": "🥾", "oração": "🙏",
  "casal": "💑", "ingresso": "🎟️", "concerto": "🎶", "diploma": "📜", "perigo": "⚠️",
  "socorro": "🆘", "remédio": "💊", "vacina": "💉", "perfume": "🧴", "batom": "💄",
  "ruído": "🔊", "silêncio": "🔇",

  // ---------- nivel3 ----------
  // animais
  "passarinho": "🐤", "cacatua": "🦜", "rena": "🦌", "caramujo": "🐌", "bicho-preguiça": "🦥",
  "pernilongo": "🦟", "guaxinim": "🦝", "víbora": "🐍", "mico": "🐒", "marreco": "🦆",
  "tanajura": "🐜", "cachalote": "🐳",
  // alimentos
  "toucinho": "🥓", "cevada": "🌾",
  // cores
  "safira": "💎",
  // cidades
  "universidade": "🎓", "boteco": "🍺",
  // natureza
  "fogueira": "🔥", "cerejeira": "🌸", "nevoeiro": "🌫️", "poente": "🌅", "vegetal": "🌱",
  "malmequer": "🌼", "arco-íris": "🌈",
  // corpo
  "músculo": "💪",
  // objetos
  "luminária": "🪔", "monitor": "🖥️", "envelope": "✉️", "saboneteira": "🧼", "maquiagem": "💄",
  "navalha": "🪒", "alto-falante": "🔊", "campainha": "🔔", "projetor": "📽️", "prancheta": "📋",
  "teleférico": "🚡", "caçarola": "🍲", "cesta": "🧺", "incenso": "🕯️", "mamadeira": "🍼",
  "máscara": "😷", "megafone": "📣", "monóculo": "🧐",
  // outros
  "brincadeira": "🎲", "estátua": "🗿", "desenho": "🖍️", "cerâmica": "🏺", "conserto": "🧰",
  "imprensa": "📰", "mergulho": "🤿", "palhaço": "🤡", "pescaria": "🎣", "supermercado": "🛒",
  "certificado": "📜", "aldeia": "🛖", "ângulo": "📐", "astronauta": "🧑‍🚀", "aviso": "⚠️",
  "bênção": "🙏", "bilheteria": "🎫", "charada": "🧩",

  // ---------- nivel4 ----------
  // animais
  "orangotango": "🦧", "mocho": "🦉", "boto": "🐬",
  // alimentos
  "feijoada": "🍲", "churrasco": "🍖", "culinária": "🍳", "margarina": "🧈", "sobremesa": "🍰",
  "legume": "🥦", "cereal": "🥣",
  // cidades
  "estacionamento": "🅿️", "shopping": "🏬", "arranha-céu": "🏙️",
  // natureza
  "cachoeira": "💦", "tornado": "🌪️", "eclipse": "🌑", "meteoro": "☄️", "satélite": "🛰️",
  "nebulosa": "🌌", "fauna": "🐾", "poluição": "🏭", "desmatamento": "🪓", "temperatura": "🌡️",
  // objetos
  "ferramenta": "🛠️", "taça": "🍷", "passaporte": "🛂", "pilha": "🔋", "fone": "🎧",
  "partitura": "🎼", "ampulheta": "⏳", "globo": "🌐", "lente": "🔍", "trompete": "🎺",
  "tambor": "🥁", "planilha": "📊",
  // outros
  "experimento": "🧪", "gráfico": "📈", "conto": "📕", "reciclagem": "♻️", "matemática": "🧮",
  "emergência": "🚑",

  // ---------- nivel5 ----------
  // animais
  "esqualo": "🦈",
  // alimentos
  "confeitaria": "🍬",
  // cidades
  "monotrilho": "🚝", "ferroviária": "🚉", "ancoradouro": "⚓",
  // natureza
  "supernova": "🌠", "geiser": "♨️", "succulenta": "🪴",
  // corpo
  "miopia": "👓",
  // objetos
  "estetoscópio": "🩺", "engrenagem": "⚙️", "tecido": "🧵", "atadura": "🩹", "cronômetro": "⏱️",
  "parabólica": "📡", "guindaste": "🏗️", "adobe": "🧱",

  // ---------- expansão CLDR pt (Unicode License, curadoria manual) ----------
  // ---------- nivel1 ----------
    // animais
    "alce": "🫎", "bode": "🐐", "carpa": "🎏", "corvo": "🐦‍⬛", "ganso": "🪿",
    "lagarto": "🦎", "mula": "🫏", "onça": "🐆",
    // alimentos
    "berinjela": "🍆", "couve": "🥬", "ervilha": "🫛", "espaguete": "🍝",
    "manteiga": "🧈", "pudim": "🍮", "repolho": "🥬", "vagem": "🫛",
    // cores
    "bronze": "🥉", "ruivo": "🦰", "vinho": "🍷",
    // numerais
    "cem": "💯", "dezoito": "🔞", "doze": "🕛", "onze": "🕚",
    // cidades
    "chafariz": "⛲", "estrada": "🛣", "parque": "🏞", "posto": "⛽",
    // verbos
    "beijar": "💏", "cheirar": "👃", "escutar": "👂", "pescar": "🐟", "pintar": "🖌",
    "sentar": "🪑", "soltar": "🫳",
    // natureza
    "aurora": "🌅", "bruma": "🌁", "céu": "🌌", "coqueiro": "🌴", "jardim": "🏡",
    "pinheiro": "🌲", "represa": "🦫", "trovão": "⛈",
    // corpo
    "bigode": "🥸", "calcanhar": "🦶", "ombro": "🤷",
    // objetos
    "barbante": "🧵", "camisa": "👕", "carrinho": "🛒", "flauta": "🪈", "muro": "🧱",
    "pincel": "🖌", "poltrona": "💺", "tigela": "🍜",
    // emoções
    "conforto": "🫂", "preguiça": "🦥",
    // outros
    "abc": "🔤", "alvo": "🎯", "amo": "🥰", "aqui": "🈁", "aro": "⭕", "asno": "🫏",
    "babar": "🤤", "bacon": "🥓", "baga": "🫐", "ballet": "🧑‍🩰", "banjo": "🪕",
    "bemol": "♭", "bento": "🍱", "berro": "🗣", "bilhar": "🎱", "blasé": "😒",
    "boia": "🛟", "bote": "🚣", "boxe": "🥊", "brinde": "🥂", "brotar": "🌱",
    "buquê": "💐", "calar": "🔇", "cavar": "🪏", "cena": "🎬", "cera": "🖍",
    "certo": "👌", "cheiro": "👃", "conga": "🪘", "cookie": "🍪", "cool": "🆒",
    "cordel": "🪢", "corte": "💇‍♂", "cowboy": "🤠", "crepe": "🥞", "crespo": "🪮",
    "crochê": "🧶", "culto": "🛐", "curtir": "🩷", "dado": "🎲", "dardo": "🎯",
    "degrau": "🪜", "dengue": "🦟", "dental": "🪥", "dica": "🧩", "dodó": "🦤",
    "doida": "🤪", "donut": "🍩", "drama": "🎭", "ducha": "🚿", "elfa": "🧝‍♀",
    "fax": "📠", "fedor": "🦨", "fênix": "🐦‍🔥", "ferry": "⛴", "flash": "📸",
    "floco": "❄", "fondue": "🫕", "fonte": "⛲", "forte": "💪", "fraca": "🪫",
    "frasco": "🧴", "free": "🆓", "frita": "🍟", "fugir": "💨", "gata": "🐈‍⬛",
    "gene": "🧬", "ioiô": "🪀", "jarro": "🫙", "jazz": "🪊", "jegue": "🫏",
    "jockey": "🏇", "joker": "🃏", "jóquei": "🏇", "judo": "🥋", "kiwi": "🥝",
    "lenha": "🪵", "lila": "🪻", "limpo": "🫧", "link": "🔗", "listra": "🦓",
    "loção": "🧴", "loura": "👱‍♀", "malhar": "🏋", "mamar": "🍼", "mancha": "🫟",
    "maple": "🍁", "miau": "🐈‍⬛", "mira": "🎯", "motor": "🛥", "mundo": "🗺",
    "nado": "🏊‍♀", "negar": "🙂‍↔", "negro": "🖤", "neta": "👧", "ninja": "🥷",
    "nobre": "🫅", "nome": "📛", "novo": "🆕", "odor": "👃", "pager": "📟",
    "pasmo": "😮", "passo": "🚶", "pata": "🐾", "pingo": "🫟", "pita": "🫓",
    "pizza": "🍕", "pneu": "🛞", "porca": "🔩", "pouco": "🤏", "pula": "🦘",
    "pulo": "🦘", "punk": "🧷", "ratel": "🦡", "rezar": "🙏", "rico": "🪙",
    "rugby": "🏉", "ruim": "👎", "sari": "🥻", "sax": "🎷", "senha": "🔑",
    "short": "🩳", "sikh": "🪯", "skate": "🛹", "stop": "⏹", "surf": "🏄",
    "sushi": "🍣", "tango": "💃", "tao": "☯", "tchau": "👋", "terço": "📿",
    "timer": "⏲", "tiro": "🎯", "tonta": "🥴", "tora": "🪵", "treno": "🛷",
    "tricô": "🧶", "troféu": "🏆", "tropa": "🫡", "trufa": "🍄‍🟫", "ufa": "😥",
    "vagão": "🚃", "valeu": "👍", "van": "🚐", "vara": "🎣", "verme": "🪱",
    "vina": "🌭", "você": "🫵", "vólei": "🏐", "votar": "🗳", "voto": "🗳",
    "voz": "🗣", "xampu": "🧴", "yang": "☯", "yeti": "🫈", "yin": "☯", "zumbi": "🧟",
  // ---------- nivel2 ----------
    // animais
    "alpaca": "🦙", "bisonte": "🦬", "burro": "🫏", "dromedário": "🐪", "grilo": "🦗",
    "leopardo": "🐆", "texugo": "🦡",
    // alimentos
    "beterraba": "🫜", "castanha": "🌰", "gengibre": "🫚", "mate": "🧉", "nabo": "🫜",
    "refrigerante": "🥤", "rosca": "🥯", "torrada": "🍞",
    // cores
    "violeta": "🪻",
    // cidades
    "aeroporto": "🛄", "boate": "🪩", "edifício": "🏢", "portaria": "🛎",
    "torre": "🗼",
    // verbos
    "brincar": "🛝", "chutar": "🦶", "derramar": "🫗", "escorregar": "🛝",
    "estacionar": "🅿", "girar": "🛞", "pentear": "🪮", "pisar": "🦶", "plantar": "🪴",
    "soprar": "🌬", "varrer": "🧹",
    // natureza
    "amanhecer": "🌅", "argila": "🧱", "entardecer": "🌇", "estação": "🚉",
    "lava": "🌋", "luar": "🌕", "muda": "🌱", "névoa": "🌁", "serra": "🪚",
    "temporal": "⛈",
    // corpo
    "audição": "🧏", "coxa": "🍗", "náusea": "🤢",
    // objetos
    "agenda": "📔", "balsa": "⛴", "bule": "🫖", "cachecol": "🧣", "casaco": "🧥",
    "chaleira": "🫖", "chuveiro": "🚿", "cueca": "🩲", "escova": "🪥",
    "frigideira": "🍳", "gaveta": "🗄", "leque": "🪭", "muleta": "🩼", "parede": "🧱",
    "pente": "🪮", "peteca": "🏸", "plugue": "🔌", "prancha": "🏄", "prato": "🍽",
    "rolo": "🧻", "sabão": "🫧", "xícara": "🍵", "zíper": "🤐",
    // emoções
    "confusão": "🫤", "desconfiança": "🤨", "frustração": "🫤", "malícia": "😈",
    "mimo": "🎁", "temor": "🫢",
    // outros
    "ábaco": "🧮", "abanar": "🪭", "abrigo": "🛖", "aceno": "👋", "acesso": "♿",
    "acima": "🔼", "áfrica": "🌍", "alarme": "⏰", "alegre": "😊", "aluna": "👩‍🎓",
    "arejar": "🪭", "arepa": "🫓", "ártico": "🐻‍❄", "assada": "🍠", "astuto": "🦝",
    "azedo": "🍋", "baiacu": "🐡", "bailarino": "🧑‍🩰", "balada": "🪩",
    "bêbada": "🥴", "bêbado": "🥴", "buzina": "📢", "cabana": "🛖", "câmbio": "💱",
    "caminho": "🛣", "campeã": "🏆", "campeão": "🏆", "canudo": "🥤", "capelo": "🎓",
    "cética": "🤨", "coala": "🐨", "débito": "💳", "díese": "♯", "doído": "🤪",
    "enfermeiro": "👨‍⚕", "enviar": "📮", "equino": "🐴", "escudo": "🛡",
    "escuro": "🌑", "espetáculo": "🎭", "espia": "🕵", "fatura": "🧾",
    "futuro": "🔮", "gélido": "🥶", "gênio": "🧞", "gilete": "🪒", "goleiro": "🥅",
    "higiene": "🪥", "iate": "⛵", "idosa": "👵", "jaleco": "🥼", "judia": "🕍",
    "juíza": "👩‍⚖", "karatê": "🥋", "maraca": "🪇", "marido": "👨", "mestre": "👨‍🏫",
    "miado": "🐈‍⬛", "missa": "⛪", "moda": "👠", "neto": "🧒", "oculto": "🥷",
    "ótimo": "👌", "paella": "🥘", "pavoa": "🦚", "peludo": "🫈", "piada": "🤡",
    "piano": "🎹", "pífano": "🪈", "pílula": "💊", "poroso": "🧽", "pureza": "🪷",
    "recibo": "🧾", "reparo": "🔨", "ritmo": "🪘", "roseta": "🏵", "rótulo": "🏷",
    "sábio": "🧓", "sacola": "🛍", "saída": "📤", "seguro": "🔐", "sineta": "🛎",
    "trabalho": "💻", "uniforme": "🥋",
  // ---------- nivel3 ----------
    // animais
    "bisão": "🦬", "gambá": "🦨", "lagartixa": "🦎",
    // alimentos
    "almôndega": "🧆", "bolacha": "🍪", "empanada": "🥟", "limonada": "🍋‍🟩",
    "marmita": "🥡", "pamonha": "🫔",
    // cores
    "coral": "🪸", "púrpura": "🟪",
    // numerais
    "segundo": "🥈", "terceiro": "🥉",
    // cidades
    "arena": "🏟", "estúdio": "🎙", "lavanderia": "🧺",
    // verbos
    "acalmar": "💆‍♂", "celebrar": "🎉", "elevar": "🛗", "espiar": "🫣",
    "exalar": "😮‍💨", "filmar": "🎥", "imprimir": "🖨", "investigar": "🕵",
    "meditar": "🙇‍♀",
    // natureza
    "ciclone": "🌀", "conífera": "🌲", "cristal": "🔮", "seixo": "🪨",
    // objetos
    "bermuda": "🩳", "corneta": "📯", "fechadura": "🗝", "jarra": "🫙",
    "locomotiva": "🚂", "moldura": "🖼", "pelúcia": "🧸", "saleiro": "🧂",
    // emoções
    "admiração": "🥹", "arrependimento": "🙇", "desilusão": "💔", "devoção": "🤲",
    "espanto": "🫢", "sofrimento": "💔",
    // outros
    "abatido": "😔", "acabado": "😵", "acordeão": "🪗", "aduana": "🛃",
    "agasalho": "🧥", "ajoelhar": "🧎", "alfabeto": "🔤", "atabaque": "🪘",
    "atrasada": "⏰", "atrasado": "⏰", "auréola": "😇", "avarenta": "🤑",
    "bióloga": "👩‍🔬", "cacheado": "🦱", "cafeína": "☕", "carpinteiro": "🪚",
    "cartaz": "🪧", "cartola": "🎩", "colorido": "🦚", "curiosa": "🤔",
    "demónio": "👿", "dentista": "🦷", "enjoado": "🤢", "enviada": "📤",
    "fazendeiro": "👨‍🌾", "furiosa": "😤", "irônico": "😼", "jardineira": "👩‍🌾",
    "karaoke": "🎤", "lentidão": "🦥", "magoado": "🙍‍♂", "malária": "🦟",
    "menininha": "👧", "radiola": "📻", "recreação": "🎣", "rosário": "📿",
    "vaqueiro": "🤠",
  // ---------- nivel4 ----------
    // animais
    "ameba": "🦠", "marsupial": "🦘", "medusa": "🪼", "molusco": "🦑", "primata": "🦧",
    // alimentos
    "ensopado": "🍲", "especiaria": "🫚", "tubérculo": "🫜",
    // cores
    "corado": "☺", "reluzente": "🌟",
    // cidades
    "túnel": "🚇",
    // verbos
    "descartar": "🫳", "identificar": "🏷", "prever": "🔮", "retroceder": "⏪",
    "reviver": "🐦‍🔥",
    // natureza
    "átomo": "⚛", "oliveira": "🫒", "pedregulho": "🪨", "tsunami": "🌊",
    // objetos
    "carimbo": "💮", "gabinete": "🗄", "harpa": "🪉", "parafuso": "🔩",
    "roteador": "🛜", "saxofone": "🎷", "torno": "🗜",
    // emoções
    "solidariedade": "✊",
    // outros
    "aborígene": "🪃", "aborrecido": "😩", "acidentado": "🤕", "aliviado": "😥",
    "apaixonada": "🥰", "apetitoso": "😋", "apimentado": "🌶", "aplicativo": "🈸",
    "arquitetura": "🏛", "astronomia": "⭐", "biologia": "🧫", "comunicado": "📢",
    "confirmação": "🙂‍↕", "conveniência": "🏪", "delicioso": "😋", "demoníaco": "👹",
    "domicílio": "🏠", "emocionante": "💖", "empresário": "👨‍💼", "enevoado": "🌁",
    "entediado": "🥱", "escalada": "🧗", "esculápio": "⚕", "estudioso": "🤓",
    "estudo": "📘", "evolução": "🧬", "ferroviário": "🚃", "física": "👩‍🔬",
    "genética": "🧬", "geografia": "🗺", "geometria": "📐", "higiénico": "🧻",
    "ilimitado": "♾", "industrial": "🧑‍🏭", "iniciante": "🔰", "meridiano": "🌐",
    "radiação": "☢", "radiativo": "☢", "sabedoria": "🦉", "unicórnio": "🦄",
  // ---------- nivel5 ----------
    // animais
    "crustáceo": "🦐", "invertebrado": "🪼",
    // alimentos
    "infusão": "🫖", "laticínio": "🧈", "leguminosa": "🫛",
    // cores
    "cintilante": "🌟", "xadrez": "♟",
    // verbos
    "florescer": "🌼",
    // corpo
    "esmalte": "💅", "respiração": "🫁",
    // objetos
    "curativo": "🩹", "maleta": "💼",
    // outros
    "alcoolizado": "🥴", "alfaiataria": "🪡", "cardiologia": "🫀",
    "codificadora": "👩‍💻", "deficiência": "🩼", "emocionado": "🥲",
    "encaracolado": "🦱", "eternidade": "♾", "funcionária": "👩‍💼", "radioativo": "☢",
    "radiografia": "🩻", "renascimento": "🐦‍🔥", "videocassete": "📼",
};
