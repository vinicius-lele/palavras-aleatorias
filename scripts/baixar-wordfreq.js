// Baixa large_pt do wordfreq (https://github.com/rspeer/wordfreq, CC-BY 4.0)
// e converte em scripts/wordfreq-pt.tsv:  palavra \t cB (centibels, -300 = 1/1000 tokens)
//
// Formato cBpack: msgpack gzipado = [header, lista0, lista1, ...] onde o
// índice de cada lista = -frequência em centibels. O índice maior = mais raro.
import { writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const url = "https://raw.githubusercontent.com/rspeer/wordfreq/master/wordfreq/data/large_pt.msgpack.gz";
const r = await fetch(url);
if (!r.ok) throw new Error("HTTP " + r.status);
const buf = gunzipSync(Buffer.from(await r.arrayBuffer()));

// --- decoder msgpack mínimo (só o subconjunto usado: array/map/str/int/bool/nil) ---
function decode(b) {
  let p = 0;
  const u8 = () => b[p++];
  const take = (n) => { const s = b.subarray(p, p + n); p += n; return s; };
  const num = (code) => {
    switch (code) {
      case 0xcc: return u8();
      case 0xcd: return take(2).readUInt16BE(0);
      case 0xce: return take(4).readUInt32BE(0);
      case 0xcf: return Number(take(8).readBigUInt64BE(0));
      case 0xd0: return take(1).readInt8(0);
      case 0xd1: return take(2).readInt16BE(0);
      case 0xd2: return take(4).readInt32BE(0);
      case 0xd3: return Number(take(8).readBigInt64BE(0));
      case 0xca: return take(4).readFloatBE(0);
      case 0xcb: return take(8).readDoubleBE(0);
      default: throw new Error("int/float desconhecido 0x" + code.toString(16));
    }
  };
  function item() {
    const code = u8();
    if (code <= 0x7f || code >= 0xe0) return code; // fixint
    if (code >= 0xa0 && code <= 0xbf) return take(code - 0xa0).toString("utf8"); // fixstr
    if (code >= 0x90 && code <= 0x9f) { const n = code - 0x90; const a = []; for (let i = 0; i < n; i++) a.push(item()); return a; } // fixarray
    if (code >= 0x80 && code <= 0x8f) { const n = code - 0x80; const o = {}; for (let i = 0; i < n; i++) { const k = item(); o[k] = item(); } return o; } // fixmap
    switch (code) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;
      case 0xd9: return take(u8()).toString("utf8");
      case 0xda: { const n = take(2).readUInt16BE(0); return take(n).toString("utf8"); }
      case 0xdb: { const n = take(4).readUInt32BE(0); return take(n).toString("utf8"); }
      case 0xdc: { const n = take(2).readUInt16BE(0); const a = []; for (let i = 0; i < n; i++) a.push(item()); return a; }
      case 0xdd: { const n = take(4).readUInt32BE(0); const a = []; for (let i = 0; i < n; i++) a.push(item()); return a; }
      default: {
        if ([0xcc, 0xcd, 0xce, 0xcf, 0xd0, 0xd1, 0xd2, 0xd3, 0xca, 0xcb].includes(code)) return num(code);
        throw new Error("code desconhecido 0x" + code.toString(16) + " em " + p);
      }
    }
  }
  return item();
}

const dados = decode(buf);
const header = dados[0];
if (!header || header.format !== "cB") throw new Error("header inesperado: " + JSON.stringify(header));
const bandas = dados.slice(1);
console.log("cBpack ok:", bandas.length, "bandas (0 a -" + (bandas.length - 1) + " cB)");

const linhas = [];
let n = 0;
for (let cb = 0; cb < bandas.length; cb++) {
  for (const w of bandas[cb]) {
    linhas.push(w + "\t" + -cb);
    n++;
  }
}
writeFileSync("scripts/wordfreq-pt.tsv", "palavra\tcb\n" + linhas.join("\n") + "\n", "utf8");
console.log("->", n, "tokens em scripts/wordfreq-pt.tsv");

// sanidade: palavras conhecidas devem ser pouco negativas
const mapa = new Map(linhas.map((l) => { const [w, cb] = l.split("\t"); return [w, Number(cb)]; }));
for (const w of ["o", "casa", "escola", "abobrinha", "dezenove", "enxugar", "camarão"]) {
  console.log(" ", w, "->", mapa.get(w) ?? "AUSENTE", "cB");
}
