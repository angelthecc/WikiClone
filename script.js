import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9eLg5CJXzakMGEUfykW25Vay-pvcf2gQ",
  authDomain: "wikicloneangel.firebaseapp.com",
  projectId: "wikicloneangel",
  storageBucket: "wikicloneangel.firebasestorage.app",
  messagingSenderId: "326980840327",
  appId: "1:326980840327:web:7b8cf54747be1adc1f8122",
  measurementId: "G-XQ7ZHJ4DLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentArticleId = null;

const articleList = document.getElementById('articleList');
const articleTitle = document.getElementById('articleTitle');
const articleContent = document.getElementById('articleContent');
const articleEditor = document.getElementById('articleEditor');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');

const newArticleBtn = document.getElementById('newArticleBtn');
const modal = document.getElementById('modal');
const titleInput = document.getElementById('titleInput');
const contentInput = document.getElementById('contentInput');
const createBtn = document.getElementById('createBtn');
const cancelBtn = document.getElementById('cancelBtn');

const privacyLink = document.getElementById('privacyLink');
const termsLink = document.getElementById('termsLink');

async function loadArticles() {
  try {
    const snapshot = await getDocs(collection(db, "articles"));
    if (snapshot.empty) {
      await setDoc(doc(db, "articles", "Welcome"), {
        title: "Welcome to Wikiclone",
        content: "# Welcome to Wikiclone\n\nThis is the default article.\n\n## Markdown Tutorial\n- **Bold:** `**bold**`\n- *Italic:* `*italic*`\n- Headers: `# H1`, `## H2`\n- Links: `[example](https://example.com)`\n- Lists: `- item`",
        authorName: "System",
        readOnly: true
      });
      return loadArticles();
    }
    const articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    displayArticles(articles);
  } catch (err) {
    console.error('loadArticles error', err);
  }
}

function displayArticles(articles) {
  articleList.innerHTML = '';
  articles.forEach(art => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = art.title;
    a.onclick = () => showArticle(art.id);
    li.appendChild(a);
    articleList.appendChild(li);
  });
  if (articles.length > 0) showArticle(articles[0].id);
}

async function showArticle(id) {
  try {
    const artDoc = await getDoc(doc(db, "articles", id));
    if (!artDoc.exists()) return;
    const art = artDoc.data();
    currentArticleId = id;

    articleTitle.textContent = art.title;
    articleContent.innerHTML = typeof marked !== 'undefined' ? marked.parse(art.content || '') : (art.content || '');

    articleEditor.style.display = 'block';
    saveBtn.style.display = 'inline-block';
    deleteBtn.style.display = 'inline-block';
    articleEditor.value = art.content || '';
  } catch (err) {
    console.error('showArticle error', err);
  }
}

saveBtn.onclick = async () => {
  if (!currentArticleId) return;
  try {
    await updateDoc(doc(db, "articles", currentArticleId), { content: articleEditor.value });
    showArticle(currentArticleId);
  } catch (err) {
    console.error('save error', err);
  }
};

deleteBtn.onclick = async () => {
  if (!currentArticleId) return;
  try {
    await deleteDoc(doc(db, "articles", currentArticleId));
    currentArticleId = null;
    loadArticles();
  } catch (err) {
    console.error('delete error', err);
  }
};

newArticleBtn.onclick = () => {
  titleInput.value = '';
  contentInput.value = '';
  modal.style.display = 'flex';
};

cancelBtn.onclick = () => (modal.style.display = 'none');

createBtn.onclick = async () => {
  const title = (titleInput.value || '').trim();
  const content = (contentInput.value || '').trim();
  if (!title) {
    alert('Title is required');
    return;
  }
  try {
    const safeId = title.replace(/[.#$[\]/]/g, '_');
    const docRef = doc(db, "articles", safeId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      alert('Article with this title already exists.');
      return;
    }
    await setDoc(docRef, { title, content, authorName: 'Anonymous', readOnly: false });
    modal.style.display = 'none';
    loadArticles();
  } catch (err) {
    console.error('create error', err);
  }
};

privacyLink.onclick = () => alert('Privacy Policy: All articles are stored in Firebase Firestore.');
termsLink.onclick = () => alert('Terms of Use: Content is user-generated.');

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

loadArticles();
