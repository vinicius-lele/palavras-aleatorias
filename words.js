// Listas de palavras por nível, organizadas por tema.
// Estrutura: nivelX -> tema -> array de palavras.
//
// Temas válidos (use exatamente estes nomes):
//   animais, alimentos, cores, numerais, cidades, nomes,
//   verbos, natureza, corpo, objetos, emoções, outros
//
// Para adicionar um nível novo, basta criar uma nova chave (nivel6, nivel7, ...)
// e ele aparece automaticamente no select. Ordem das chaves não importa.
// Cada nível deve ter pelo menos 120 palavras no total.
const WORDS = {
  nivel1: {
    animais: [
      "gato", "peixe", "rato", "urso", "lobo", "pato", "galo", "cisne",
      "cabra", "cobra", "mosca", "pomba", "tatu", "boi", "porco", "cão",
      "ave", "baleia", "polvo", "lula", "corvo", "gavião", "águia"
    ],
    alimentos: [
      "uva", "ovo", "mel", "sal", "pão", "arroz", "feijão", "leite",
      "carne", "bolo", "torta", "bife", "suco", "café", "chá", "água",
      "maçã", "pera", "figo", "melão", "mamão", "coco", "limão",
      "manga", "goiaba", "caju", "milho"
    ],
    cores: [
      "azul", "cor", "rosa", "verde", "vermelho", "amarelo", "branco",
      "preto", "marrom", "roxo", "cinza"
    ],
    numerais: [
      "dois", "três", "quatro", "cinco", "seis", "sete", "oito",
      "nove", "dez", "zero", "doze", "vinte", "cem"
    ],
    cidades: [
      "rua", "praça", "bonde", "ponte", "prédio", "igreja"
    ],
    nomes: [
      "Ana", "Bruno", "Carla", "Diego", "Elisa", "Hugo", "João",
      "Júlia", "Laura", "Lucas", "Maria", "Pedro", "Rita", "Sofia", "Vera"
    ],
    verbos: [
      "ser", "ter", "ir", "ver", "vir", "dar", "fazer", "olhar",
      "ouvir", "comer", "beber", "dormir", "rir", "ler", "abrir", "fechar"
    ],
    natureza: [
      "sol", "lua", "flor", "mar", "céu", "ar", "luz", "vento",
      "neve", "chuva", "raio", "nuvem", "noite", "tarde", "manhã",
      "rio", "onda", "praia", "ilha", "vale", "campo", "terra",
      "pedra", "fogo", "gelo", "sombra", "jardim", "folha", "raiz",
      "árvore", "tronco", "grama", "areia", "orvalho", "trovoada"
    ],
    corpo: [
      "mão", "pé", "olho", "boca", "dente", "nariz", "rosto", "dedo",
      "unha", "pele", "osso", "corpo", "braço", "perna", "língua",
      "queixo", "barba", "cabelo", "orelha", "ombro", "joelho",
      "garganta", "testa"
    ],
    objetos: [
      "casa", "bola", "livro", "cama", "mesa", "copo", "garfo",
      "colher", "faca", "chave", "pia", "fogão", "colchão", "calça",
      "bota", "meia", "lenço", "saia", "blusa", "chapéu", "anel",
      "roupa", "jogo", "rede", "linha", "ferro", "ouro", "prata",
      "cobre", "vidro", "carro", "trem", "quadra", "muro", "teto",
      "chão", "giz", "tela", "lâmpada", "martelo", "corda", "quadro"
    ],
    emoções: [
      "paz", "sonho", "riso", "amor", "medo", "raiva", "nojo",
      "orgulho", "calma", "vergonha", "inveja", "carinho"
    ],
    outros: [
      "rei", "hora", "tempo", "dia", "ano", "mês", "pai", "mãe",
      "filho", "povo", "gente", "vida", "morte", "bem", "mal", "vez",
      "festa", "arte", "canto", "letra", "frase", "palavra", "regra", "lei"
    ]
  },

  nivel2: {
    animais: [
      "macaco", "tigre", "girafa", "sapo", "cachorro", "cavalo", "coelho",
      "galinha", "jacaré", "formiga", "abelha", "aranha", "pinguim",
      "lagarta", "coruja", "leão", "hiena", "esquilo", "camelo", "burro",
      "ovelha", "bezerro", "morcego", "tucano", "urubu", "serpente",
      "elefante", "canguru", "vespa", "grilo"
    ],
    alimentos: [
      "banana", "queijo", "laranja", "morango", "batata", "cenoura",
      "pêssego", "cereja", "ameixa", "alface", "cebola", "alho",
      "iogurte", "paçoca", "pipoca", "sanduíche", "salada", "sopa",
      "farinha", "açúcar", "macarrão", "mandioca", "abacate",
      "beterraba", "chuchu"
    ],
    cores: [
      "bege", "violeta", "dourado", "prateado", "magenta", "índigo"
    ],
    numerais: [
      "quinze", "trinta", "cinquenta", "mil"
    ],
    cidades: [
      "escola", "cidade", "feira", "loja", "banco", "mercado",
      "hospital", "farmácia", "colégio", "cinema", "teatro",
      "aeroporto", "estádio", "orla"
    ],
    nomes: [
      "Felipe", "Renata", "Eduardo", "Camila", "André", "Beatriz",
      "Gustavo", "Patrícia", "Rafael", "Letícia", "Marcos", "Juliana",
      "Alexandre", "Débora", "Murilo"
    ],
    verbos: [
      "brincar", "correr", "andar", "pular", "cantar", "dançar",
      "estudar", "jogar", "comprar", "vender", "viajar", "morar",
      "trabalhar", "pensar", "sentir", "escolher", "decidir",
      "chegar", "subir", "descer"
    ],
    natureza: [
      "deserto", "floresta", "estrela", "planeta", "inverno", "verão",
      "estação", "geada", "lama", "musgo", "brisa"
    ],
    corpo: [
      "coração", "pulso", "cotovelo", "coxa", "barriga", "estômago",
      "sangue", "cérebro"
    ],
    objetos: [
      "janela", "porta", "prato", "barco", "cadeira", "sofá", "tapete",
      "toalha", "panela", "espelho", "cortina", "abajur", "relógio",
      "tijolo", "parede", "telhado", "escova", "pente", "portão",
      "gaveta", "caderno", "lápis", "papel", "caneta", "boletim",
      "prova", "mochila", "borracha", "estojo", "cola", "tesoura",
      "prancha", "rádio", "máquina", "piscina", "varanda", "carroça",
      "balsa", "táxi", "avião", "ônibus", "metrô", "navio", "cozinha",
      "régua", "gravata", "sapato", "lanterna", "despertador"
    ],
    emoções: [
      "saudade", "paixão", "beleza", "atenção", "ciúme", "tristeza",
      "esperança", "susto", "alívio", "ternura"
    ],
    outros: [
      "história", "música", "poema", "dança", "domingo", "sábado",
      "semana", "hoje", "amanhã", "ontem", "janeiro", "abril", "junho",
      "março", "maio", "agosto", "outubro", "amigo", "vizinho",
      "trabalho", "dinheiro", "encontro", "presente", "verdade",
      "esporte", "time", "goleiro", "vitória", "medalha", "criança",
      "menino", "menina"
    ]
  },

  nivel3: {
    animais: [
      "hipopótamo", "borboleta", "tartaruga", "andorinha", "passarinho",
      "mariposa", "capivara", "lagartixa", "periquito", "joão-de-barro",
      "bem-te-vi", "camaleão", "tamanduá", "urubu-rei", "sardinha",
      "pavão", "besouro", "centopeia", "lontra", "garça"
    ],
    alimentos: [
      "abacaxi", "brigadeiro", "chocolate", "melancia", "amendoim",
      "pirulito", "limonada", "lasanha", "picolé", "sorvete", "bolacha",
      "biscoito", "panqueca", "marmita", "lentilha", "melado",
      "canjica", "cuscuz", "tapioca", "pamonha", "quindim"
    ],
    cores: [
      "turquesa", "carmesim", "coral", "púrpura", "esmeralda",
      "ocre", "malva"
    ],
    numerais: [
      "primeiro", "segundo", "terceiro", "quarto", "quinto"
    ],
    cidades: [
      "prefeitura", "lavanderia", "mercadinho", "lanchonete",
      "restaurante", "avenida", "padaria", "galeria", "serraria",
      "museu", "castelo", "biblioteca"
    ],
    nomes: [
      "Fernanda", "Rodrigo", "Marcelo", "Vanessa", "Sabrina", "Leonardo",
      "Priscila", "Wagner", "Fábio", "Cristiane", "Vinícius", "Aline",
      "Douglas", "Cláudio", "Mônica", "Tatiane"
    ],
    verbos: [
      "explorar", "conquistar", "organizar", "preparar", "descobrir",
      "imaginar", "lembrar", "esquecer", "observar", "comparar",
      "explicar", "construir", "suportar", "cuidar", "visitar"
    ],
    natureza: [
      "montanha", "fogueira", "palmeira", "penhasco", "riacho", "selva",
      "pântano", "duna", "caverna", "vulcão", "vegetação", "paisagem"
    ],
    corpo: [
      "mandíbula", "pupila", "pulmão", "fêmur", "tórax", "abdômen",
      "músculo", "tendão", "cartilagem", "nervo", "medula", "vértebra"
    ],
    objetos: [
      "escada", "guarda-chuva", "computador", "geladeira", "almofada",
      "armário", "cadeado", "travesseiro", "ventilador", "elevador",
      "escritório", "apartamento", "impressora", "televisão",
      "microfone", "escrivaninha", "guarda-roupa", "fechadura",
      "lençol", "dormitório", "telefone", "bicicleta", "celular",
      "teclado", "câmera", "cobertura", "brinquedo", "cadeirinha",
      "caderneta", "aspirador", "moldura", "luminária", "edredom",
      "jarra"
    ],
    emoções: [
      "alegria", "emoção", "admiração", "serenidade", "ansiedade",
      "expectativa", "interesse"
    ],
    outros: [
      "dentista", "jardineira", "padeiro", "brincadeira", "feriado",
      "casamento", "nascimento", "amizade", "aventura", "pirâmide",
      "energia", "universo", "gravidade", "estátua", "escultura",
      "desenho", "pintura", "trabalhador", "recreação", "avaliação",
      "família", "madrugada", "cerâmica", "poesia", "construção",
      "dimensão", "direção", "intenção", "instrução", "precisão",
      "projeção", "solução", "relação", "reação", "opinião", "tradição",
      "transmissão", "qualidade", "quantidade", "cobrança", "clareza",
      "cultura", "distância", "certeza", "frequência", "presença",
      "menininha", "cavalheiro", "travessia", "conserto", "disputa",
      "imprensa", "jornalismo", "lealdade", "lentidão", "mergulho",
      "palhaço", "pescaria", "promessa", "traição", "travessura",
      "valentia", "vaidade", "velhice", "trabalhista"
    ]
  },

  nivel4: {
    animais: [
      "beija-flor", "ornitorrinco", "quati", "boto", "guará", "casuar",
      "antílope", "rinoceronte"
    ],
    alimentos: [
      "feijoada", "churrasco", "strogonoff", "panacota", "moqueca",
      "acarajé"
    ],
    cores: [
      "esverdeado", "avermelhado", "acinzentado", "azulado",
      "amarelado", "arroxeado"
    ],
    numerais: [
      "duzentos", "trezentos", "quatrocentos", "quinhentos",
      "seiscentos", "setecentos", "oitocentos"
    ],
    cidades: [
      "livraria", "cafeteria", "sorveteria", "Maringá", "rodovia",
      "túnel", "estacionamento", "shopping", "catedral", "farol"
    ],
    nomes: [
      "Gabriela", "Henrique", "Isadora", "Jonathan", "Karina", "Marcela",
      "Nicholas", "Paloma", "Otávio", "Renan", "Simone", "Thiago",
      "Wellington", "Yara"
    ],
    verbos: [
      "compartilhar", "administrar", "comunicar", "confirmar",
      "considerar", "cooperar", "dedicar", "demonstrar", "distribuir",
      "eliminar", "fortalecer", "interpretar", "negociar", "recuperar",
      "valorizar", "viabilizar"
    ],
    natureza: [
      "cachoeira", "atmosfera", "furacão", "tempestade", "erosão",
      "cânion", "delta", "baía", "correnteza", "horizonte", "geleira",
      "cratera", "maré"
    ],
    corpo: [
      "artéria", "esôfago", "traqueia", "coluna", "clavícula",
      "escápula", "fígado", "vesícula"
    ],
    objetos: [
      "instrumento", "plataforma", "obstáculo", "aparelhamento",
      "instalação", "calendário", "telescópio", "microscópio",
      "circuito", "painel", "viaduto", "secador", "equipamento",
      "dispositivo", "acessório", "sensor"
    ],
    emoções: [
      "cortesia", "criatividade", "curiosidade", "entusiasmo", "euforia",
      "felicidade", "fascinação", "harmonia", "humildade", "imaginação",
      "sensibilidade", "sentimento", "simpatia", "tranquilidade"
    ],
    outros: [
      "desenvolvimento", "especialidade", "fotografia", "impressionante",
      "conhecimento", "maravilhoso", "contratempo", "empreendedor",
      "cristalização", "personagem", "administração", "alimentação",
      "apresentação", "argumento", "arquitetura", "celebração",
      "circunstância", "colaboração", "combinação", "compromisso",
      "comunicação", "confirmação", "consequência", "conservação",
      "consideração", "constituição", "contribuição", "contradição",
      "conveniência", "cooperação", "declaração", "dedicação",
      "definição", "delegação", "deliberação", "demonstração", "desafio",
      "desigualdade", "descoberta", "desenvolvedor", "detalhamento",
      "diagnóstico", "diferenciação", "dificuldade", "disciplina",
      "disposição", "distribuição", "diversidade", "documentação",
      "eficiência", "elegância", "elemento", "emergência", "emocionante",
      "empregado", "empresário", "enfrentamento", "engenhoso",
      "enormidade", "ensinamento", "equilíbrio", "equivalência",
      "escalada", "especial", "espontâneo", "estatística", "evolução",
      "existência", "expedição", "experiência", "finalidade",
      "fertilidade", "fabricação", "fundamento", "iluminação",
      "importância", "impossível", "independência", "indicação",
      "industrial", "inovação", "inteligência", "intensidade",
      "interpretação", "intervenção", "jornalista", "liberdade",
      "matemática", "meditação", "migração", "mobilidade", "modernidade",
      "moralidade", "multiplicação", "narrativa", "necessidade",
      "negociação", "observação", "ocupação", "orientação",
      "participação", "permanência", "persistência", "planejamento",
      "poderoso", "preferência", "propaganda", "possibilidade",
      "radiação", "realidade", "reciclagem", "religião", "rendimento",
      "situação", "suficiente", "tecnologia", "transformação",
      "tratamento", "atividade", "oportunidade", "articulação",
      "associação", "competência", "conferência", "biografia",
      "caminhada", "caravana", "literatura", "ferroviário"
    ]
  },

  nivel5: {
    animais: [
      "pterodátilo", "trilobita", "equinodermo", "diatomeia", "aracnídeo",
      "crustáceo", "cefalópode"
    ],
    alimentos: [
      "superalimentação", "gastronomia", "confeitaria"
    ],
    cores: [
      "esbranquiçado", "amarronzado", "iridescente", "opalescente"
    ],
    numerais: [
      "milhão", "bilhão", "trilhão", "quadrilhão", "centésimo",
      "milésimo"
    ],
    cidades: [
      "Pindamonhangaba", "Fernandópolis", "Petrolina", "Ipatinga",
      "Blumenau", "Sobral", "Cascavel"
    ],
    nomes: [
      "Guilherme", "Valentina", "Antonella", "Emanuela", "Benedito",
      "Conceição", "Severino", "Aparecida", "Lourenço", "Bernadete",
      "Constâncio", "Lorena"
    ],
    verbos: [
      "ressignificar", "desidentificar", "reapresentar",
      "superalimentar", "interoperar", "reorganizar", "desconsiderar",
      "universalizar", "interiorizar", "externalizar", "internalizar",
      "impermeabilizar", "intelectualizar"
    ],
    natureza: [
      "fotossíntese", "desertificação", "termosfera", "ionosfera",
      "magnetosfera", "meteorologia", "biosfera", "litosfera"
    ],
    corpo: [
      "cardiomiopatia", "vasodilatação", "broncoespasmo", "laringoscopia"
    ],
    objetos: [
      "paralelepípedo", "microcomputador", "microprocessador",
      "microssatélite", "desfibrilador", "eletrodoméstico"
    ],
    emoções: [
      "melancolia", "exasperação", "irrequietude", "angústia"
    ],
    outros: [
      "otorrinolaringologista", "estabelecimento", "infraestrutura",
      "inconstitucionalidade", "eletroencefalograma",
      "desoxirribonucleico", "institucionalização", "transcontinental",
      "responsabilização", "anticonstitucionalissimamente",
      "contrarrecontra", "extraordinário", "responsabilidade",
      "incompatibilidade", "desindustrialização",
      "incompreensibilidade", "internacionalização",
      "constitucionalidade", "retroalimentação", "eletrocardiograma",
      "antropomorfização", "desproporcionalidade",
      "eletroencefalografia", "incomunicabilidade", "experimentalidade",
      "interdisciplinaridade", "irresponsabilidade", "incompreensível",
      "contraditório", "despersonalização", "heterogeneidade",
      "particularidade", "intelectualidade", "onomatopeia",
      "pentacampeonato", "psicopatologia", "semitransparente",
      "universalização", "grandiosidade", "sensacionalismo",
      "verossimilhança", "interdependência", "constitucionalista",
      "homeopatia", "imobilização", "ginecologista", "pneumologista",
      "endocrinologista", "traumatologista", "hematologista",
      "microbiologista", "epidemiologista", "oftalmologista",
      "dermatologista", "anestesiologista", "reumatologista",
      "infectologista", "megalomania", "superlativamente",
      "termocontratual", "ultravioleta", "incondicionalidade",
      "inexistência", "universalismo", "desumanização", "psicoanálise",
      "irreversibilidade", "inigualável", "impopularidade",
      "interplanetário", "totalitarismo", "inconveniência",
      "extraordinariedade", "imprescritibilidade", "inalienabilidade",
      "inamovibilidade", "indispensabilidade", "inefabilidade",
      "desconsideração", "reorganização", "intangibilidade",
      "intertextualidade", "individualização", "representatividade",
      "aeroespacial", "autoafirmação", "autoexploração",
      "intercomunicação", "neocolonialismo",
      "pneumoultramicroscopicossilicovulcanoconiótico",
      "transnacionalismo", "reapresentação", "desidentificação",
      "multiplicabilidade", "sofisticadamente", "ininteligibilidade",
      "inquestionabilidade", "inabalabilidade", "inexplicabilidade",
      "indisponibilidade", "característica", "correspondência",
      "complexidade", "disponibilidade", "epistemologia", "etimologia",
      "impermeabilização", "resignificação", "interoperabilidade",
      "compartilhamento", "hiperelasticidade", "antropocentrismo",
      "inconstitucional", "internacionalismo", "eletroencefalografista",
      "psicofisiológico", "gastroenterologia", "neuropsicopedagoga",
      "especialização", "teleconferência", "sustentabilidade",
      "imprevisibilidade", "comercialização", "personalização",
      "extraordinariamente", "euroescrutínio", "contrarreprodução",
      "interinstitucional", "hipercompensação", "pós-modernidade",
      "microrregião", "transitoriedade", "antropomorfismo",
      "descontextualização", "interconectividade", "multidisciplinar",
      "ultrassonografia"
    ]
  }
};
