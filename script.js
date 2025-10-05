import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const ENConfig = "eyJhcGlLZXkiOiAiQUl6YVN5QTllTGdNQ0pYWmFrTUdFRWZ5a1c1NlZheS1wdmNmM2ciLCAiYXV0aERvbWFpbiI6ICJ3aWtpY2xvbmVhbmdlbC5maXJlYmFzZWFwcC5jb20iLCAicHJvamVjdElkIjogIndpa2ljbG9uZWFuZ2VsIiwgInN0b3JhZ2VCdWNrZXQiOiAid2lraWNsb25lYW5nZWwuZmlyZWJhc2VzdG9yYWdlLmFwcCIsICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIzMjY5ODA4NDAzMjciLCAiYXBwSWQiOiAiMTozMjY5ODA4NDAzMjd3ZGIiLCAibWVhc3VyZW1lbnRJZCI6ICJHLVhRN1pISjRELkRMTiJ9";

const firebaseConfig = JSON.parse(atob(ENConfig));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let currentArticleId = null;

const articleList = document.getElementById('articleList');
const articleTitle = document.getElementById('articleTitle');
const articleContent = document.getElementById('articleContent');
const articleAuthor = document.getElementById('articleAuthor');
const articleEditor = document.getElementById('articleEditor');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');

const newArticleBtn = document.getElementById('newArticleBtn');
const modal = document.getElementById('modal');
const authorInput = document.getElementById('authorInput');
const titleInput = document.getElementById('titleInput');
const contentInput = document.getElementById('contentInput');
const createBtn = document.getElementById('createBtn');
const cancelBtn = document.getElementById('cancelBtn');

const privacyLink = document.getElementById('privacyLink');
const termsLink = document.getElementById('termsLink');

signInAnonymously(auth).catch((e) => {
  console.error('Anonymous sign-in failed:', e);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  loadArticles();
});

async function loadArticles() {
  try {
    const snapshot = await getDocs(collection(db, "articles"));
    if (snapshot.empty) {
      await setDoc(doc(db, "articles", "Welcome"), {
        title: "Welcome to Wikiclone",
        content: "# Welcome to Wikiclone\n\nThis is the default article. It cannot be edited.\n\n## Markdown Tutorial\n\n- **Bold:** `**bold**`\n- *Italic:* `*italic*`\n- Headers: `# H1`, `## H2`\n- Links: `[example](https://example.com)`\n- Lists: `- item`\n\nCreate your own article with Markdown!",
        authorName: "System",
        uid: "system",
        readOnly: true
      });
      return loadArticles();
    }

    const articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    displayArticles(articles);
  } catch (err) {
    console.error('loadArticles error', err);
    alert('Could not load articles. Check console for details.');
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
    articleAuthor.textContent = `Author: ${art.authorName || 'Anonymous'}`;

    const isOwner = currentUser && art.uid && currentUser.uid === art.uid;
    articleEditor.style.display = isOwner ? 'block' : 'none';
    saveBtn.style.display = isOwner ? 'inline-block' : 'none';
    deleteBtn.style.display = isOwner ? 'inline-block' : 'none';
    if (isOwner) articleEditor.value = art.content || '';
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
    alert('Save failed. Check permissions and rules.');
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
    alert('Delete failed. Check permissions and rules.');
  }
};

newArticleBtn.onclick = () => {
  authorInput.value = '';
  titleInput.value = '';
  contentInput.value = '';
  modal.style.display = 'flex';
};

cancelBtn.onclick = () => (modal.style.display = 'none');

createBtn.onclick = async () => {
  const title = (titleInput.value || '').trim();
  const content = (contentInput.value || '').trim();
  const authorName = (authorInput.value || '').trim() || 'Anonymous';
  if (!title) {
    alert('Title is required');
    return;
  }
  if (!currentUser) {
    alert('Signing in... please wait a moment and try again.');
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
    await setDoc(docRef, {
      title,
      content,
      authorName,
      uid: currentUser.uid,
      readOnly: false
    });
    modal.style.display = 'none';
    loadArticles();
  } catch (err) {
    console.error('create error', err);
    alert('Create failed. Check console for details.');
  }
};

privacyLink.onclick = () => alert('Privacy Policy: All articles are stored in Firebase Firestore.');
termsLink.onclick = () => alert('Terms of Use: Content is user-generated.');

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});
