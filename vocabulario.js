// Vocabulário de ampliação — base da atividade "Palavras Desconhecidas"
// (BNCC EF35LP05: inferir o sentido de palavras ou expressões desconhecidas).
//
// Fonte única, editável à mão, sem build. Cada entrada é uma palavra incomum
// + significado curto, SEM frase de contexto — a tela mostra só as duas
// coisas, no ritmo do Treino Livre (decisão de projeto: exposição ao
// vocabulário novo, sem acerto/erro).
//
// Regras das entradas:
//   - palavra em MINÚSCULAS, UMA por entrada, sem repetir;
//   - significado de uma linha só, em português simples, do jeito que se
//     explicaria para uma criança de 3º ao 5º ano;
//   - a palavra precisa ser incomum o bastante para a criança ainda não
//     conhecer — o valor do módulo é justamente essa descoberta;
//   - evitar regionalismos fortes demais e duplas sinônimas (a lista tem
//     sinônimos o bastante).
//
// Validacao (duplicatas, campos vazios, caixa): `node scripts/validar-palavras.mjs`.

export const VOCABULARIO = [
  { palavra: "abalroado", significado: "cansado e abatido; meio durinho de tanto esforço" },
  { palavra: "acanhado", significado: "com vergonha; que não se solta diante dos outros" },
  { palavra: "afobado", significado: "com pressa e agitado, sem saber o que fazer primeiro" },
  { palavra: "agouro", significado: "pressentimento de que algo ruim pode acontecer" },
  { palavra: "alarde", significado: "exibição; mostrar-se com orgulho para os outros" },
  { palavra: "algazarra", significado: "muito barulho de vozes e brincadeiras" },
  { palavra: "alpargata", significado: "sapato leve de tecido, com sola de corda" },
  { palavra: "alvoroço", significado: "grande agitação; confusão; comoção" },
  { palavra: "amarfanhado", significado: "amassado e desarrumado, como roupa guardada de qualquer jeito" },
  { palavra: "anedota", significado: "história curta e engraçada, contada para dar risada" },
  { palavra: "arrelia", significado: "raiva; irritação de leve duração" },
  { palavra: "atabalhoado", significado: "feito às pressas e sem cuidado" },
  { palavra: "atordoado", significado: "confuso, sem entender o que está acontecendo" },
  { palavra: "aturdido", significado: "tonto; sem clareza para pensar" },
  { palavra: "azafamado", significado: "que vive com pressa, sempre correndo" },
  { palavra: "balbúrdia", significado: "barulho e confusão de muita gente junta" },
  { palavra: "balela", significado: "mentira contada para enganar" },
  { palavra: "berlinda", significado: "situação complicada, de prestar contas" },
  { palavra: "boquirroto", significado: "que fala demais, sem pensar no que diz" },
  { palavra: "bravura", significado: "coragem diante do perigo ou da dificuldade" },
  { palavra: "cambaio", significado: "torto; que não fica reto" },
  { palavra: "cambalhota", significado: "pulo em que a pessoa vira de cabeça para baixo" },
  { palavra: "cobiça", significado: "vontade intensa de ter o que é dos outros" },
  { palavra: "deboche", significado: "zombaria; fazer pouco caso para provocar" },
  { palavra: "desajeitado", significado: "sem jeito; que tropeça ou faz tudo de qualquer jeito" },
  { palavra: "descomunal", significado: "enorme; maior que o normal" },
  { palavra: "desdém", significado: "desprezo; achar que algo ou alguém não vale nada" },
  { palavra: "deslize", significado: "pequeno erro; escorregão sem querer" },
  { palavra: "embaraço", significado: "situação que envergonha; constrangimento" },
  { palavra: "empapado", significado: "encharcado; molhado demais" },
  { palavra: "esdrúxulo", significado: "estranho, fora do comum" },
  { palavra: "esfarrapado", significado: "todo rasgado e roto, como roupa velha de uso" },
  { palavra: "farsa", significado: "encenação fingida para enganar alguém" },
  { palavra: "fanfarrão", significado: "que se gaba do que fez; que conta vantagem" },
  { palavra: "folia", significado: "festa alegre com música, dança e brincadeira" },
  { palavra: "gana", significado: "vontade forte e disposição para fazer alguma coisa" },
  { palavra: "gargalhada", significado: "risada alta e de coração" },
  { palavra: "gritaria", significado: "muita gente gritando ao mesmo tempo" },
  { palavra: "imprudente", significado: "que age sem pensar nas consequências" },
  { palavra: "impertinente", significado: "que responde com falta de educação" },
  { palavra: "inquieto", significado: "que não para quieto; agitado ou incomodado" },
  { palavra: "insolente", significado: "que fala e age sem respeito com os outros" },
  { palavra: "jactância", significado: "ato de se gabar; orgulho em mostrar o que fez" },
  { palavra: "lambança", significado: "bagunça; desordem feita sem cuidado" },
  { palavra: "manha", significado: "jeitinho esperto para enganar ou se dar bem" },
  { palavra: "marola", significado: "ondas fortes, de mar agitado" },
  { palavra: "mexerico", significado: "fofoca; conversa pelas costas de alguém" },
  { palavra: "migalha", significado: "pedacinho bem pequeno de pão ou de comida" },
  { palavra: "ojeriza", significado: "muita antipatia; repulsa por alguém ou por algo" },
  { palavra: "palerma", significado: "bobo; que faz asneiras sem querer" },
  { palavra: "pândego", significado: "engraçado; que gosta de fazer piada" },
  { palavra: "pechincha", significado: "preço muito bom; negócio vantajoso" },
  { palavra: "peleja", significado: "luta; esforço para conseguir alguma coisa" },
  { palavra: "penumbra", significado: "meio claro, meio escuro; claridade fraca" },
  { palavra: "petulante", significado: "que fala com grosseria se achando melhor dos outros" },
  { palavra: "pífio", significado: "fraco; que não dá resultado nenhum" },
  { palavra: "pirraça", significado: "teimosia em não querer cooperar; birra" },
  { palavra: "resmungar", significado: "reclamar em voz baixa e de mal humor" },
  { palavra: "ríspido", significado: "seco; que responde com dureza" },
  { palavra: "sofrego", significado: "com pressa; ansioso para comer ou para agir" },
  { palavra: "tagarela", significado: "que fala sem parar" },
  { palavra: "transtorno", significado: "problema; confusão que atrapalha" },
  { palavra: "trambique", significado: "trapaça; golpe para enganar alguém" },
  { palavra: "tristonho", significado: "triste; que passa tristeza" },
  { palavra: "valentão", significado: "que se faz de valente para intimidar os outros" },
  { palavra: "zangado", significado: "com raiva; irritado com alguém ou com algo" },
  { palavra: "zombar", significado: "tirar sarro; provocar rindo de alguém" }
];
