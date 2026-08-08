import CryptoJS from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://ambativasi.page.gd/ambativasi-api";

let challengeCookie = null;

function xorBytes(a, b) {
  const out = [];
  for (let i = 0; i < a.length && i < b.length; i++) out.push(a[i] ^ b[i]);
  return out;
}

function decryptSlowAES(html) {
  const matches = [];
  const re = /toNumbers\("([0-9a-f]+)"\)/g;
  let m;
  while ((m = re.exec(html)) !== null) matches.push(m[1]);
  if (matches.length < 3) return null;
  const [keyHex, ivHex, ctHex] = matches;

  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const ct = CryptoJS.enc.Hex.parse(ctHex);

  const decrypted = CryptoJS.algo.AES.createDecryptor(key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).finalize(ct);

  const toBytes = (wa) =>
    wa.words
      .slice(0, 4)
      .map((w) => [(w >>> 24) & 0xff, (w >>> 16) & 0xff, (w >>> 8) & 0xff, w & 0xff])
      .flat();

  const xored = xorBytes(toBytes(decrypted), toBytes(iv));
  return xored.map((b) => (b < 16 ? "0" : "") + b.toString(16)).join("");
}

async function buildHeaders(options, withCookie) {
  const headers = { ...options.headers };

  // 🔐 AUTENTIKASI TOKEN: kirim auth_token sesi (dari login) ke semua request
  try {
    const session = await AsyncStorage.getItem("userSession");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed && parsed.auth_token) {
        headers.Authorization = `Bearer ${parsed.auth_token}`;
      }
    }
  } catch (e) {
    // abaikan bila session belum tersedia / corrupt
  }

  if (withCookie && challengeCookie) {
    headers.Cookie = `__test=${challengeCookie}`;
  }
  return headers;
}

async function fetchWithChallenge(url, options = {}) {
  let res = await fetch(url, { ...options, headers: await buildHeaders(options, true) });
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return res;
  }

  const text = await res.text();

  if (text.includes("slowAES.decrypt") || text.includes("aes.js")) {
    challengeCookie = decryptSlowAES(text);
    if (challengeCookie) {
      res = await fetch(url, { ...options, headers: await buildHeaders(options, true) });
      return res;
    }
  }

  return new Response(text, { status: res.status, headers: res.headers });
}

export async function apiFetch(url, options = {}) {
  return fetchWithChallenge(url, options);
}

export default API_URL;
