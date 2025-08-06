// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

// Configurações do Firebase
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
const db = getFirestore(app);

// Referência ao formulário
const form = document.getElementById("cadastroForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("username").value;
  const email = document.getElementById("emailCadastro").value;
  const senha = document.getElementById("senhaCadastro").value;

  try {
    // Criar usuário com e-mail e senha
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salvar dados adicionais no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome: nome,
      email: email,
      criadoEm: new Date()
    });

    // Mostrar aviso customizado
    const aviso = document.getElementById("avisoSucesso");
    aviso.classList.remove("hidden");

    // Resetar formulário
    form.reset();

    // Redirecionar após 2 segundos
    setTimeout(() => {
      window.location.href = "../../Menu/Html/Menu_Principal.html";// ajuste o caminho da página que deseja
    }, 2000);

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Este e-mail já está cadastrado. Faça login ou use outro e-mail.");
    } else if (error.code === "auth/invalid-email") {
      alert("E-mail inválido. Verifique e tente novamente.");
    } else if (error.code === "auth/weak-password") {
      alert("Senha muito fraca. Use pelo menos 6 caracteres.");
    } else {
      console.error("Erro ao criar conta:", error);
      alert("Erro ao criar conta: " + error.message);
    }
  }
});
