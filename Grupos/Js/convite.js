import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

const formConvidar = document.getElementById("formConvidar");
const inputNick = document.getElementById("nickJogador");

// Pega o nome do grupo pela URL (ajuste conforme seu projeto)
const urlParams = new URLSearchParams(window.location.search);
const groupName = urlParams.get("groupName");

if (!groupName) {
  alert("Nome do grupo não informado na URL.");
  // pode desabilitar o form aqui, por exemplo
}

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Você precisa estar logado para convidar jogadores.");
    window.location.href = "../../Login/Html/Inicial.html";
  }
});

formConvidar.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomeBusca = inputNick.value.trim();
  if (!nomeBusca) {
    alert("Digite um nome válido.");
    return;
  }

  try {
    // Buscar usuário pelo campo 'nome' na coleção 'usuarios'
    const q = query(collection(db, "usuarios"), where("nome", "==", nomeBusca));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Usuário não encontrado.");
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Salva convite dentro da coleção 'convites' do grupo
    await setDoc(doc(db, "grupos", groupName, "convites", userDoc.id), {
      convidadoId: userDoc.id,
      convidadoNome: userData.nome,
      enviadoEm: new Date().toISOString(),
      status: "pendente"
    });

    alert(`Convite enviado para ${userData.nome}!`);
    inputNick.value = "";

  } catch (error) {
    console.error("Erro ao enviar convite:", error);
    alert("Erro ao enviar convite. Tente novamente.");
  }
});
