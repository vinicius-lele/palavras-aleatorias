// Listas de palavras por nível.
// Para adicionar um nível novo, basta criar uma nova chave (nivel6, nivel7, ...)
// e ele aparece automaticamente no select. Ordem das chaves não importa.
const WORDS = {
  nivel1: [
    // Originais
    "sol", "lua", "paz", "rei", "flor", "mar",
    "casa", "bola", "gato", "livro", "uva", "peixe",
    // Céu e natureza
    "céu", "ar", "luz", "vento", "neve", "chuva", "raio", "nuvem",
    "noite", "tarde", "manhã", "hora", "tempo", "dia", "ano", "mês",
    "rio", "onda", "praia", "ilha", "vale", "campo", "terra", "pedra",
    "fogo", "gelo", "sombra",
    // Animais
    "rato", "urso", "lobo", "pato", "galo", "cisne", "cabra", "cobra",
    "mosca", "pomba", "tatu", "boi", "porco", "cão", "ave",
    // Corpo
    "mão", "pé", "olho", "boca", "dente", "nariz", "rosto", "dedo",
    "unha", "pele", "osso", "corpo", "braço", "perna", "língua", "queixo", "barba",
    // Pessoas e sentimentos
    "pai", "mãe", "filho", "povo", "gente", "vida", "morte", "sonho",
    "riso", "bem", "mal", "vez", "amor", "medo", "festa",
    // Cor
    "azul", "cor",
    // Comida
    "ovo", "mel", "sal", "pão", "arroz", "feijão", "leite", "carne",
    "bolo", "torta", "bife", "suco", "café", "chá", "água", "maçã",
    "pera", "figo", "melão", "mamão", "coco", "limão",
    // Casa e objetos
    "cama", "mesa", "copo", "garfo", "colher", "faca", "chave", "pia",
    "fogão", "colchão", "jardim",
    // Roupa
    "calça", "bota", "meia", "lenço", "saia", "blusa", "chapéu", "anel", "roupa",
    // Palavras e arte
    "arte", "tela", "canto", "letra", "frase", "palavra", "regra", "lei",
    "jogo", "rede", "rosa", "linha", "ferro", "ouro", "prata", "cobre",
    "vidro", "carro", "trem",
    // Lugares e objetos
    "bonde", "quadra", "rua", "praça", "muro", "teto", "chão", "folha",
    "raiz", "giz",
    // Números
    "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"
  ],

  nivel2: [
    // Originais
    "macaco", "banana", "escola", "janela", "porta", "cidade",
    "tigre", "prato", "queijo", "girafa", "sapo", "barco",
    // Animais
    "cachorro", "cavalo", "coelho", "galinha", "jacaré", "formiga", "abelha",
    "aranha", "pinguim", "lagarta", "coruja", "leão", "hiena", "esquilo",
    "camelo", "burro", "ovelha", "bezerro", "morcego", "tucano", "urubu",
    "serpente",
    // Comida
    "laranja", "morango", "batata", "cenoura", "pêssego", "cereja", "ameixa",
    "alface", "cebola", "alho", "iogurte", "paçoca", "pipoca", "sanduíche",
    "salada", "sopa", "farinha", "açúcar", "macarrão",
    // Casa
    "cadeira", "sofá", "tapete", "toalha", "panela", "espelho", "cortina",
    "abajur", "relógio", "tijolo", "parede", "telhado", "escova", "pente",
    "portão", "gaveta",
    // Escola e cultura
    "caderno", "lápis", "papel", "caneta", "boletim", "prova",
    "mochila", "borracha", "estojo", "cola", "tesoura", "prancha",
    "história", "música", "poema", "dança", "teatro",
    // Dias e tempo
    "domingo", "sábado", "semana", "hoje", "amanhã", "ontem", "janeiro",
    "abril", "junho", "março", "maio", "agosto", "outubro", "inverno",
    "estação",
    // Pessoas, ações e lugares
    "amigo", "vizinho", "cozinha", "trabalho", "brincar", "correr", "andar",
    "pular", "cantar", "dançar", "feira", "loja", "banco", "mercado",
    "coração", "saudade", "criança", "dinheiro", "encontro", "presente",
    "verdade", "hospital", "farmácia", "colégio", "deserto", "floresta",
    // Transporte e objetos
    "avião", "ônibus", "metrô", "navio", "carroça", "balsa", "táxi",
    "rádio", "cinema", "máquina", "piscina", "varanda", "menino", "menina",
    "estrela", "planeta",
    // Outros
    "esporte", "time", "goleiro", "vitória", "medalha", "paixão", "beleza",
    "atenção", "verão"
  ],

  nivel3: [
    // Originais
    "abacaxi", "brigadeiro", "dentista", "escada", "fogueira", "guarda-chuva",
    "hipopótamo", "jardineira", "borboleta", "computador", "montanha", "geladeira",
    // Animais
    "tartaruga", "andorinha", "passarinho", "mariposa", "capivara", "lagartixa",
    "periquito", "joão-de-barro", "bem-te-vi", "camaleão", "tamanduá", "urubu-rei",
    // Casa e objetos
    "almofada", "armário", "cadeado", "travesseiro", "ventilador", "elevador",
    "escritório", "apartamento", "prefeitura", "impressora", "televisão",
    "microfone", "escrivaninha", "guarda-roupa", "fechadura", "lavanderia",
    "mercadinho", "lanchonete", "brincadeira", "lençol", "dormitório", "telefone",
    // Comida
    "chocolate", "melancia", "amendoim", "pirulito", "limonada", "lasanha",
    "picolé", "sorvete", "bolacha", "biscoito", "panqueca", "marmita",
    "padeiro", "lentilha", "melado", "padaria",
    // Escola, tempo e geral
    "bicicleta", "celular", "teclado", "câmera", "palmeira",
    "feriado", "casamento", "nascimento", "amizade", "cobertura", "aventura",
    "alegria", "pirâmide", "energia", "universo", "gravidade", "estátua",
    "escultura", "galeria", "desenho", "pintura", "trabalhador", "recreação",
    "avaliação", "família", "avenida", "madrugada", "serraria", "cerâmica",
    "poesia", "construção", "dimensão", "direção", "intenção", "instrução",
    "precisão", "projeção", "solução", "relação", "reação", "opinião",
    "tradição", "transmissão", "emoção", "qualidade", "quantidade",
    "restaurante", "cobrança", "clareza", "cultura", "distância", "certeza",
    "frequência", "presença", "brinquedo", "cadeirinha", "menininha",
    "cavalheiro", "travessia", "conserto", "disputa", "imprensa", "jornalismo",
    "lealdade", "lentidão", "mergulho", "palhaço", "penhasco", "pescaria",
    "promessa", "sardinha", "traição", "travessura", "valentia", "vaidade",
    "velhice", "caderneta", "trabalhista"
  ],

  nivel4: [
    // Originais
    "cachoeira", "desenvolvimento", "especialidade", "fotografia",
    "impressionante", "conhecimento", "maravilhoso", "contratempo",
    "empreendedor", "cristalização", "personagem", "aparelhamento",
    // Ações e processos
    "administração", "alimentação", "apresentação", "argumento", "arquitetura",
    "atmosfera", "celebração", "circunstância", "colaboração", "combinação",
    "compromisso", "comunicação", "confirmação", "conseqüência", "conservação",
    "consideração", "constituição", "contribuição", "contradição", "conveniência",
    "cooperação", "cortesia", "criatividade", "curiosidade", "declaração",
    "dedicação", "definição", "delegação", "deliberação", "demonstração",
    "desafio", "desigualdade", "descoberta", "desenvolvedor", "detalhamento",
    "diagnóstico", "diferenciação", "dificuldade", "disciplina", "disposição",
    "distribuição", "diversidade", "documentação", "eficiência", "elegância",
    "elemento", "emergência", "emocionante", "empregado", "empresário",
    "enfrentamento", "engenhoso", "enormidade", "ensinamento", "entusiasmo",
    "equilíbrio", "equivalência", "escalada", "especial", "espontâneo",
    "estatística", "euforia", "evolução", "existência", "expedição",
    "experiência", "felicidade", "finalidade", "fertilidade", "fabricação",
    "fascinação", "fundamento", "harmonia", "humildade", "iluminação",
    "imaginação", "importância", "impossível", "independência", "indicação",
    "industrial", "inovação", "instalação", "instrumento", "inteligência",
    "intensidade", "interpretação", "intervenção", "jornalista", "liberdade",
    "livraria", "matemática", "meditação", "migração", "mobilidade",
    "modernidade", "moralidade", "multiplicação", "narrativa", "necessidade",
    "negociação", "observação", "obstáculo", "ocupação", "orientação",
    "participação", "permanência", "persistência", "planejamento", "plataforma",
    "poderoso", "preferência", "propaganda", "possibilidade", "radiação",
    "realidade", "reciclagem", "religião", "rendimento", "sensibilidade",
    "sentimento", "simpatia", "situação", "suficiente", "tecnologia",
    "transformação", "tratamento", "atividade", "oportunidade", "articulação",
    "associação", "compartilhar", "competência", "conferência", "biografia",
    "calendário", "caminhada", "caravana", "cafeteria", "sorveteria",
    "tranquilidade", "literatura", "ferroviário"
  ],

  nivel5: [
    // Originais
    "pindamunhangaba", "paralelepipedo", "otorrinolaringologista", "estabelecimento",
    "infraestrutura", "cardiomiopatia", "inconstitucionalidade", "eletroencefalograma",
    "desoxirribonucleico", "institucionalização", "transcontinental", "responsabilização",
    // Técnicos e longos
    "anticonstitucionalissimamente", "contrarrecontra", "extraordinário",
    "responsabilidade", "incompatibilidade", "desindustrialização",
    "incompreensibilidade", "internacionalização", "constitucionalidade",
    "retroalimentação", "eletrocardiograma", "antropomorfização",
    "desproporcionalidade", "eletroencefalografia", "incomunicabilidade",
    "experimentalidade", "interdisciplinaridade", "irresponsabilidade",
    "incompreensível", "contraditório", "microcomputador", "despersonalização",
    "heterogeneidade", "particularidade", "intelectualidade", "onomatopeia",
    "pentacampeonato", "psicopatologia", "semitransparente", "universalização",
    "grandiosidade", "sensacionalismo", "verossimilhança", "interdependência",
    "constitucionalista", "desfibrilador", "homeopatia", "imobilização",
    "ginecologista", "pneumologista", "endocrinologista", "traumatologista",
    "hematologista", "microbiologista", "epidemiologista", "oftalmologista",
    "dermatologista", "anestesiologista", "reumatologista", "infectologista",
    "megalomania", "superlativamente", "termocontratual", "ultravioleta",
    "incondicionalidade", "inexistência", "universalismo", "desumanização",
    "psicoanálise", "irreversibilidade", "inigualável", "impopularidade",
    "interplanetário", "microssatélite", "totalitarismo",
    "inconveniência", "extraordinariedade", "imprescritibilidade",
    "inalienabilidade", "inamovibilidade", "indispensabilidade", "inefabilidade",
    "desconsideração", "reorganização", "intangibilidade", "intertextualidade",
    "individualização", "representatividade", "aeroespacial", "autoafirmação",
    "autoexploração", "intercomunicação", "neocolonialismo",
    "pneumoultramicroscopicossilicovulcanoconiótico", "transnacionalismo",
    "superalimentação", "reapresentação", "desidentificação",
    "multiplicabilidade", "sofisticadamente", "ininteligibilidade",
    "inquestionabilidade", "inabalabilidade", "inexplicabilidade",
    "indisponibilidade", "característica", "correspondência", "complexidade",
    "disponibilidade", "epistemologia", "etimologia", "impermeabilização",
    "resignificação", "interoperabilidade", "compartilhamento",
    "hiperelasticidade", "antropocentrismo", "inconstitucional",
    "internacionalismo", "eletroencefalografista", "psicofisiológico",
    "gastroenterologia", "neuropsicopedagoga", "especialização",
    "microprocessador", "teleconferência", "sustentabilidade",
    "imprevisibilidade", "comercialização", "personalização",
    "extraordinariamente", "euroescrutínio", "contrarreprodução"
  ]
};
