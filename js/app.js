import { LANGUAGES, translate } from "./translate.js";
import * as fb from "./firebase.js";

const $ = (id) => document.getElementById(id);

const state = {
  user: null,
  words: [],
  lastTranslation: null, // { source, target, text, translated }
  unsubscribe: null,
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

// ---------- Đăng nhập ----------
$("btn-login").addEventListener("click", () =>
  fb.login().catch((err) => alert("Đăng nhập thất bại: " + err.message))
);
$("btn-logout").addEventListener("click", () => fb.logout());

function handleUserChanged(user) {
  state.user = user;
  $("btn-login").hidden = !!user;
  $("btn-logout").hidden = !user;
  $("user-name").textContent = user ? `👋 ${user.displayName}` : "";

  state.unsubscribe?.();
  state.unsubscribe = null;
  state.words = [];

  if (user) {
    state.unsubscribe = fb.watchWords(user.uid, (words) => {
      state.words = words;
      renderWords();
    });
  }
  renderWords();
}

// ---------- Lưu từ ----------
$("btn-save").addEventListener("click", async () => {
  if (!state.user) return alert("Vui lòng đăng nhập để lưu từ.");
  const t = state.lastTranslation;
  if (!t) return;

  const duplicated = state.words.some(
    (w) => w.text.toLowerCase() === t.text.toLowerCase() && w.target === t.target
  );
  if (duplicated) return alert("Từ này đã có trong sổ.");

  $("btn-save").disabled = true;
  try {
    await fb.addWord(state.user.uid, { ...t, note: $("note-input").value.trim() });
    $("result").hidden = true;
    $("input-text").value = "";
  } catch (err) {
    alert("Không lưu được: " + err.message);
  } finally {
    $("btn-save").disabled = false;
  }
});

// ---------- Danh sách từ ----------
function getFilteredWords() {
  const keyword = $("search").value.trim().toLowerCase();
  const filter = document.querySelector('input[name="filter"]:checked').value;
  return state.words.filter((w) => {
    if (filter === "learned" && !w.learned) return false;
    if (filter === "learning" && w.learned) return false;
    return (
      !keyword ||
      w.text.toLowerCase().includes(keyword) ||
      w.translated.toLowerCase().includes(keyword)
    );
  });
}

function renderWords() {
  const list = $("word-list");
  list.innerHTML = "";
  $("word-count").textContent = state.words.length;

  const words = getFilteredWords();
  $("empty-list").hidden = words.length > 0;
  $("empty-list").textContent = !state.user
    ? "Đăng nhập để lưu và xem sổ từ của bạn."
    : state.words.length
      ? "Không có từ nào khớp."
      : "Sổ từ trống – hãy dịch và lưu từ đầu tiên!";

  refreshFlashcardIfStale();

  for (const w of words) {
    const li = document.createElement("li");
    li.className = "word-item" + (w.learned ? " learned" : "");
    li.innerHTML = `
      <div>
        <div><span class="w-text"></span> → <span class="w-trans"></span></div>
        <div class="muted"><span class="w-lang"></span> <span class="w-note"></span></div>
      </div>
      <div class="w-actions">
        <button class="btn btn-sm btn-ghost" data-act="toggle"></button>
        <button class="btn btn-sm btn-danger" data-act="delete">Xóa</button>
      </div>`;
    // textContent để tránh chèn HTML từ dữ liệu người dùng
    li.querySelector(".w-text").textContent = w.text;
    li.querySelector(".w-trans").textContent = w.translated;
    li.querySelector(".w-lang").textContent = `[${w.source} → ${w.target}]`;
    li.querySelector(".w-note").textContent = w.note ? `· ${w.note}` : "";
    li.querySelector('[data-act="toggle"]').textContent = w.learned ? "↺ Học lại" : "✓ Đã thuộc";

    li.querySelector('[data-act="toggle"]').onclick = () =>
      fb.updateWord(state.user.uid, w.id, { learned: !w.learned });
    li.querySelector('[data-act="delete"]').onclick = () => {
      if (confirm(`Xóa "${w.text}"?`)) fb.deleteWord(state.user.uid, w.id);
    };
    list.appendChild(li);
  }
}

// ---------- Flashcard ----------
let currentCard = null;

function pickNextCard() {
  const pool = state.words.filter((w) => !w.learned && w.id !== currentCard?.id);
  // Nếu chỉ còn 1 từ chưa thuộc thì cho phép lặp lại từ đó
  const candidates = pool.length ? pool : state.words.filter((w) => !w.learned);
  currentCard = candidates[Math.floor(Math.random() * candidates.length)] || null;
  showCard();
}

function showCard() {
  $("flashcard").classList.remove("flipped");
  const remaining = state.words.filter((w) => !w.learned).length;

  if (!currentCard) {
    $("fc-front").textContent = state.words.length
      ? "🎉 Bạn đã thuộc hết các từ!"
      : "Chưa có từ để ôn";
    $("fc-back").textContent = "";
  } else {
    $("fc-front").textContent = currentCard.text;
    // Chờ hiệu ứng lật xong mới đổi mặt sau, tránh lộ đáp án
    setTimeout(() => {
      $("fc-back").textContent = currentCard?.translated ?? "";
    }, 250);
  }
  $("fc-progress").textContent = state.words.length
    ? `Còn ${remaining}/${state.words.length} từ chưa thuộc · bấm thẻ để lật`
    : "";
  $("btn-fc-again").disabled = $("btn-fc-know").disabled = !currentCard;
}

// Gọi mỗi khi danh sách từ thay đổi: đổi thẻ nếu thẻ hiện tại không còn hợp lệ
function refreshFlashcardIfStale() {
  const fresh = currentCard && state.words.find((w) => w.id === currentCard.id);
  if (!fresh || fresh.learned) {
    currentCard = null;
    pickNextCard();
  } else {
    currentCard = fresh;
    $("fc-progress").textContent =
      `Còn ${state.words.filter((w) => !w.learned).length}/${state.words.length} từ chưa thuộc · bấm thẻ để lật`;
  }
}

$("flashcard").addEventListener("click", () => {
  if (currentCard) $("flashcard").classList.toggle("flipped");
});

$("btn-fc-again").addEventListener("click", () => {
  fb.updateWord(state.user.uid, currentCard.id, {
    reviewCount: (currentCard.reviewCount || 0) + 1,
  });
  pickNextCard();
});

$("btn-fc-know").addEventListener("click", () => {
  fb.updateWord(state.user.uid, currentCard.id, {
    learned: true,
    reviewCount: (currentCard.reviewCount || 0) + 1,
  });
  // onSnapshot sẽ cập nhật state.words và tự chọn thẻ mới
});

$("search").addEventListener("input", renderWords);
document
  .querySelectorAll('input[name="filter"]')
  .forEach((r) => r.addEventListener("change", renderWords));

// ---------- Khởi động ----------
fillLanguageSelects();

if (fb.isConfigured) {
  fb.onUserChanged(handleUserChanged);
} else {
  $("notice").hidden = false;
  $("notice").textContent =
    "⚠️ Chưa cấu hình Firebase (js/config.js). Chức năng dịch vẫn dùng được, nhưng chưa thể đăng nhập và lưu từ.";
  $("btn-login").disabled = true;
  renderWords();
}
