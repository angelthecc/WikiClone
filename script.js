import { db } from './firebase-config.js';

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { marked } from "https://cdn.jsdelivr.net/npm/marked/marked.min.js";

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

let currentArticleId = null;
let currentAuthor = prompt("Enter your name");

async function loadArticles() {
  const snapshot = await getDocs(collection(db, "articles"));

  if(snapshot.empty){
    await setDoc(doc(db, "articles", "Welcome"), {
      title: "Welcome to Wikiclone",
      content: "# Welcome to Wikiclone\n\nThis is the default article. It cannot be edited.\n\n## Markdown Tutorial\n- **Bold:** `**bold**`\n- *Italic:* `*italic*`\n- Headers: `# H1`, `## H2`\n- Links: `[Google](https://www.google.com)`\n- Lists: `- Item`\n\nCreate your own article with Markdown!",
      author: "angelthec",
      readOnly: true
    });
    return loadArticles();
  }

  const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  displayArticles(articles);
}

function displayArticles(articleArray){
  articleList.innerHTML = '';
  articleArray.forEach(art => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = art.title;
    a.onclick = () => showArticle(art.id);
    li.appendChild(a);
    articleList.appendChild(li);
  });

  if(articleArray.length > 0) showArticle(articleArray[0].id);
}

async function showArticle(id){
  const artDoc = await getDoc(doc(db, "articles", id));
  if(!artDoc.exists()) return;

  const art = artDoc.data();
  currentArticleId = id;

  articleTitle.textContent = art.title;
  articleContent.innerHTML = marked.parse(art.content);
  articleAuthor.textContent = `Author: ${art.author}`;

  if(art.readOnly || art.author !== currentAuthor){
    articleEditor.style.display='none';
    saveBtn.style.display='none';
    if(deleteBtn) deleteBtn.style.display='none';
  } else {
    articleEditor.style.display='block';
    saveBtn.style.display='inline-block';
    if(deleteBtn) deleteBtn.style.display='inline-block';
    articleEditor.value = art.content;
  }
}

saveBtn.onclick = async ()=>{
  if(!currentArticleId) return;
  await updateDoc(doc(db, "articles", currentArticleId), { content: articleEditor.value });
  showArticle(currentArticleId);
}

if(deleteBtn){
  deleteBtn.onclick = async ()=>{
    if(!currentArticleId) return;
    await deleteDoc(doc(db, "articles", currentArticleId));
    loadArticles();
  }
}

newArticleBtn.onclick = ()=>{ 
  authorInput.value=''; titleInput.value=''; contentInput.value=''; 
  modal.style.display='flex'; 
}

cancelBtn.onclick = ()=>{ modal.style.display='none'; }

createBtn.onclick = async ()=>{
  const author = authorInput.value.trim() || currentAuthor;
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if(!title){
    alert('Title is required!');
    return;
  }

  const docSnap = await getDoc(doc(db, "articles", title));
  if(docSnap.exists()){
    alert('Article already exists!');
    return;
  }

  await setDoc(doc(db, "articles", title), { title, author, content });
  modal.style.display='none';
  loadArticles();
}

loadArticles();
