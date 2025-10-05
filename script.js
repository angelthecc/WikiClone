import { db } from "./fbconfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { firebaseConfig } from "./fbconfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const articleList = document.getElementById("article-list");
const articleTitle = document.getElementById("article-title");
const articleContent = document.getElementById("article-content");
const newArticleBtn = document.getElementById("new-article");

async function loadArticles() {
  articleList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "articles"));
  snapshot.forEach((doc) => {
    const item = document.createElement("div");
    item.textContent = doc.data().title;
    item.classList.add("article-item");
    item.onclick = () => showArticle(doc.data());
    articleList.appendChild(item);
  });
}

function showArticle(data) {
  articleTitle.textContent = data.title;
  articleContent.innerHTML = marked.parse(data.content || "");
}

newArticleBtn.addEventListener("click", async () => {
  const title = prompt("Enter article title:");
  if (!title) return;
  const content = prompt("Enter Markdown content:");
  if (content == null) return;

  await addDoc(collection(db, "articles"), { title, content });
  loadArticles();
});

loadArticles();
