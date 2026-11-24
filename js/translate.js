import { TRANSLATE_API_KEY } from "./config.js";

export const LANGUAGES = {
  auto: "Tự nhận diện",
  en: "Tiếng Anh",
  vi: "Tiếng Việt",
  ja: "Tiếng Nhật",
  ko: "Tiếng Hàn",
  zh: "Tiếng Trung",
  fr: "Tiếng Pháp",
  de: "Tiếng Đức",
  es: "Tiếng Tây Ban Nha",
};

/**
 * Dịch văn bản bằng Google Translate.
 * Trả về { text, detectedSource }.
 */
export async function translate(text, target, source = "auto") {
  if (!text.trim()) throw new Error("Chưa nhập nội dung cần dịch.");
  return TRANSLATE_API_KEY
    ? translateWithCloudApi(text, target, source)
    : translateWithFreeEndpoint(text, target, source);
}

// Google Cloud Translation API v2 (chính thức, cần API key)
async function translateWithCloudApi(text, target, source) {
  const body = { q: text, target, format: "text" };
  if (source !== "auto") body.source = source;

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Lỗi Translate API");

  const t = data.data.translations[0];
  return {
    text: t.translatedText,
    detectedSource: t.detectedSourceLanguage || source,
  };
}

// Endpoint công khai của Google Translate (không cần key)
async function translateWithFreeEndpoint(text, target, source) {
  const params = new URLSearchParams({
    client: "gtx",
    sl: source,
    tl: target,
    dt: "t",
    q: text,
  });
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
  let data;
  try {
    data = await res.json();
  } catch {
    // Google trả về trang captcha khi chặn request không có key
    throw new Error(
      "Endpoint miễn phí đang bị Google chặn. Hãy điền TRANSLATE_API_KEY trong js/config.js."
    );
  }
  if (!res.ok) throw new Error(`Lỗi dịch (HTTP ${res.status})`);

  return {
    text: data[0].map((part) => part[0]).join(""),
    detectedSource: data[2] || source,
  };
}
