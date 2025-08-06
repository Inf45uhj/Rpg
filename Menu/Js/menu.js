import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBT2qhHDY5IYgJrW2JXyJRcDaqhPL-wR_4",
  authDomain: "login-cb183.firebaseapp.com",
  projectId: "login-cb183",
  storageBucket: "login-cb183.firebasestorage.app",
  messagingSenderId: "847075030829",
  appId: "1:847075030829:web:942c7964933cbaabac85a4",
  measurementId: "G-DLW6SQTX6L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Pega o span onde vai mostrar o nome do aventureiro
const nomeAventureiroSpan = document.querySelector("a .ml-2.font-semibold");

// Se você quiser colocar um id no span para ficar mais fácil, tipo:
// <span id="nomeAventureiro" class="ml-2 font-semibold">Nome do Aventureiro</span>
// dai aqui: document.getElementById("nomeAventureiro")

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Usuário logado, busca nome no Firestore
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dados = docSnap.data();
      nomeAventureiroSpan.textContent = dados.nome || "Aventureiro";
    } else {
      nomeAventureiroSpan.textContent = "Aventureiro";
    }
  } else {
    // Usuário não está logado, pode redirecionar para login
    window.location.href = "../../Login/Html/Inicial.html";
  }
});

btnSair.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    // Redireciona para a página inicial
    window.location.href = "../../../Login/Html/Inicial.html";
 // ajuste o caminho conforme sua estrutura
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("Erro ao sair. Tente novamente.");
  }
});
