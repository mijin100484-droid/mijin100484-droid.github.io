// ===== 타이핑 효과 =====
const phrases = ["AI와 함께 자동화합니다.", "새로운 세상을 여행합니다.", "매일 조금씩 성장합니다."];
const typingEl = document.querySelector(".typing");
let phraseIdx = 0;
let charIdx = 0;
let deleting = false;

function type() {
  const current = phrases[phraseIdx];
  typingEl.textContent = current.slice(0, charIdx);

  if (!deleting && charIdx < current.length) {
    charIdx++;
    setTimeout(type, 110);
  } else if (!deleting) {
    deleting = true;
    setTimeout(type, 1600);
  } else if (charIdx > 0) {
    charIdx--;
    setTimeout(type, 50);
  } else {
    deleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    setTimeout(type, 300);
  }
}
type();

// ===== 다크 모드 =====
const themeBtn = document.querySelector(".theme-btn");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
setTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

// ===== 모바일 메뉴 =====
const menuBtn = document.querySelector(".menu-btn");
const navEl = document.querySelector(".nav nav");
menuBtn.addEventListener("click", () => navEl.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach((link) =>
  link.addEventListener("click", () => navEl.classList.remove("open"))
);

// ===== 스크롤 등장 애니메이션 + 진행바 =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      entry.target.querySelectorAll(".fill").forEach((bar) => {
        bar.style.width = bar.dataset.value + "%";
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== 현재 섹션 메뉴 강조 + 맨 위로 버튼 =====
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");
const topBtn = document.querySelector(".top-btn");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((sec) => {
    if (scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  topBtn.classList.toggle("visible", scrollY > 400);
});
topBtn.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

// ===== 독서 기록 =====
const STATUS_LABEL = { done: "완독 ✅", reading: "읽는 중 📖", wish: "읽고 싶은 책 ⭐" };
const defaultBooks = [
  { title: "사피엔스", author: "유발 하라리", status: "done" },
  { title: "여행의 이유", author: "김영하", status: "done" },
  { title: "AI 2041", author: "리카이푸, 천치우판", status: "reading" },
  { title: "클루지", author: "개리 마커스", status: "wish" },
];

let books;
try { books = JSON.parse(localStorage.getItem("books")) || defaultBooks; } catch (e) { books = defaultBooks; }
let currentFilter = "all";

const bookList = document.getElementById("bookList");

function saveBooks() {
  try { localStorage.setItem("books", JSON.stringify(books)); } catch (e) {}
}

function renderBooks() {
  bookList.innerHTML = "";
  const visible = books
    .map((book, idx) => ({ ...book, idx }))
    .filter((b) => currentFilter === "all" || b.status === currentFilter);

  if (visible.length === 0) {
    bookList.innerHTML = '<li class="empty">아직 등록된 책이 없어요.</li>';
    return;
  }

  visible.forEach((b) => {
    const li = document.createElement("li");
    li.className = "book-item";
    li.dataset.status = b.status;

    const info = document.createElement("div");
    info.className = "book-info";
    const title = document.createElement("strong");
    title.textContent = b.title;
    const author = document.createElement("span");
    author.textContent = b.author || "저자 미상";
    info.append(title, author);

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = STATUS_LABEL[b.status];

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✕";
    del.setAttribute("aria-label", "삭제");
    del.addEventListener("click", () => {
      books.splice(b.idx, 1);
      saveBooks();
      renderBooks();
    });

    li.append(info, badge, del);
    bookList.appendChild(li);
  });
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderBooks();
  });
});

document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("bookTitle");
  const authorInput = document.getElementById("bookAuthor");
  books.unshift({
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    status: document.getElementById("bookStatus").value,
  });
  saveBooks();
  renderBooks();
  e.target.reset();
});

renderBooks();

// ===== 오늘의 문장 =====
const quotes = [
  "“책은 한 권 한 권이 하나의 세계다.” — 윌리엄 워즈워스",
  "“세상은 한 권의 책이다. 여행하지 않는 사람은 그 책의 한 페이지만 읽는 것이다.” — 아우구스티누스",
  "“미래를 예측하는 가장 좋은 방법은 그것을 만드는 것이다.” — 앨런 케이",
  "“천 리 길도 한 걸음부터.”",
  "“반복되는 일을 자동화하면, 생각할 시간이 생긴다.”",
];
const quoteEl = document.getElementById("quote");
let quoteIdx = Math.floor(Math.random() * quotes.length);
quoteEl.textContent = quotes[quoteIdx];

document.getElementById("quoteBtn").addEventListener("click", () => {
  quoteIdx = (quoteIdx + 1) % quotes.length;
  quoteEl.textContent = quotes[quoteIdx];
});

// ===== 푸터 연도 =====
document.getElementById("year").textContent = new Date().getFullYear();
