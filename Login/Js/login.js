import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

// Configurações do Firebase - use as mesmas do cadastro
const firebaseConfig = {
  apiKey: "AIzaSyBT2qhHDY5IYgJrW2JXyJRcDaqhPL-wR_4",
  authDomain: "login-cb183.firebaseapp.com",
  projectId: "login-cb183",
  storageBucket: "login-cb183.firebasestorage.app",
  messagingSenderId: "847075030829",
  appId: "1:847075030829:web:942c7964933cbaabac85a4",
  measurementId: "G-DLW6SQTX6L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configura a persistência para manter o usuário logado localmente (localStorage)
await setPersistence(auth, browserLocalPersistence);

const form = document.getElementById("loginForm");

// Detecta se já existe um usuário logado ao abrir a página
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário já está logado, redireciona direto
    window.location.href = "../../Menu/Html/Menu_Principal.html";
  }
  // Se não estiver logado, deixa o formulário disponível
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailLogin").value;
  const senha = document.getElementById("senhaLogin").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);

    // Login bem-sucedido
    const aviso = document.getElementById("avisoSucessoLogin");
    aviso.classList.add("show");

    // Redireciona após 2 segundos
    setTimeout(() => {
      window.location.href = "../../Menu/Html/Menu_Principal.html";
    }, 2000);
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      alert("Senha incorreta. Tente novamente.");
    } else if (error.code === "auth/user-not-found") {
      alert("Usuário não encontrado. Verifique o e-mail.");
    } else if (error.code === "auth/invalid-email") {
      alert("E-mail inválido. Verifique e tente novamente.");
    } else {
      console.error("Erro no login:", error);
      alert("Erro no login: " + error.message);
    }
  }
});
