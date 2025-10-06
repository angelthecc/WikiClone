import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9eLg5CJXzakMGEUfykW25Vay-pvcf2gQ",
  authDomain: "wikicloneangel.firebaseapp.com",
  projectId: "wikicloneangel",
  storageBucket: "wikicloneangel.appspot.com",
  messagingSenderId: "326980840327",
  appId: "1:326980840327:web:7b8cf54747be1adc1f8122",
  measurementId: "G-XQ7ZHJ4DLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

let currentArticleId = null;

async function loadArticles() {
  try {
    const snapshot = await getDocs(collection(db, "articles"));

    if (snapshot.empty) {
      await setDoc(doc(db, "articles", "Welcome"), {
        title: "Hi There!",
        content: "# We are currently Down! Please try again later!",
        author: "angelthec",
        readOnly: true
      });
      return loadArticles();
    }

    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayArticles(articles);
  } catch (err) {
    console.error("Error loading articles:", err);
  }
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

async function showArticle(id) {
  try {
    const artDoc = await getDoc(doc(db, "articles", id));
    if (!artDoc.exists()) return;

    const art = artDoc.data();
    currentArticleId = id;

    articleTitle.textContent = art.title;
    articleContent.innerHTML = marked.parse(art.content);
    articleAuthor.textContent = `Author: ${art.author}`;

    const enteredAuthor = authorInput.value.trim();
    if (!art.readOnly && enteredAuthor === art.author) {
      articleEditor.style.display = 'block';
      saveBtn.style.display = 'inline-block';
      deleteBtn.style.display = 'inline-block';
      articleEditor.value = art.content;
    } else {
      articleEditor.style.display = 'none';
      saveBtn.style.display = 'none';
      deleteBtn.style.display = 'none';
    }
  } catch (err) {
    console.error("Error showing article:", err);
  }
}

saveBtn.onclick = async ()=>{
  if(!currentArticleId) return;
  try {
    await updateDoc(doc(db, "articles", currentArticleId), { content: articleEditor.value });
    articleContent.innerHTML = marked.parse(articleEditor.value);
  } catch(err){
    console.error("Error saving article:", err);
  }
}

deleteBtn.onclick = async ()=>{
  if(!currentArticleId) return;
  if(!confirm("Are you sure you want to delete this article?")) return;
  try {
    await deleteDoc(doc(db, "articles", currentArticleId));
    currentArticleId = null;
    loadArticles();
  } catch(err){
    console.error("Error deleting article:", err);
  }
}

newArticleBtn.onclick = ()=>{
  authorInput.value='';
  titleInput.value='';
  contentInput.value='';
  modal.style.display='flex';
}

cancelBtn.onclick = ()=>{ modal.style.display='none'; }

createBtn.onclick = async () => {
  const author = authorInput.value.trim();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!author || !title) {
    alert('Author and Title are required!');
    return;
  }

  const docRef = doc(db, "articles", title);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    alert('Article already exists!');
    return;
  }

  await setDoc(docRef, { title, author, content, readOnly: false });
  modal.style.display = 'none';
  loadArticles();
};

privacyLink.onclick = ()=>{ alert("Privacy Policy:\nAll articles are stored online in Firebase."); }
termsLink.onclick = ()=>{ alert("Terms of Use:\nContent is user-generated. Admin not responsible."); }

loadArticles();
