import { LANGUAGES, translate } from "./translate.js";

const $ = (id) => document.getElementById(id);

const state = {
  lastTranslation: null, // { source, target, text, translated }
};

// ---------- Ngôn ngữ ----------
function fillLanguageSelects() {
  for (const [code, name] of Object.entries(LANGUAGES)) {
    $("source-lang").add(new Option(name, code));
    if (code !== "auto") $("target-lang").add(new Option(name, code));
  }
  $("source-lang").value = "auto";
  $("target-lang").value = "vi";
}

$("btn-swap").addEventListener("click", () => {
  const src = $("source-lang").value;
  const tgt = $("target-lang").value;
  $("source-lang").value = tgt;
  $("target-lang").value = src === "auto" ? "en" : src;
});

// ---------- Dịch ----------
async function handleTranslate() {
  const text = $("input-text").value.trim();
  const source = $("source-lang").value;
  const target = $("target-lang").value;

  $("btn-translate").disabled = true;
  $("btn-translate").textContent = "Đang dịch...";
  try {
    const result = await translate(text, target, source);
    state.lastTranslation = {
      source: result.detectedSource,
      target,
      text,
      translated: result.text,
    };
    $("result-text").textContent = result.text;
    $("result-meta").textContent =
      `${LANGUAGES[result.detectedSource] || result.detectedSource} → ${LANGUAGES[target]}`;
    $("note-input").value = "";
    $("result").hidden = false;
  } catch (err) {
    alert(err.message);
  } finally {
    $("btn-translate").disabled = false;
    $("btn-translate").textContent = "Dịch";
  }
}

$("btn-translate").addEventListener("click", handleTranslate);
$("input-text").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleTranslate();
  }
});

fillLanguageSelects();
