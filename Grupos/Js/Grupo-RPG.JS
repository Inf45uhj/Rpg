import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Config Firebase
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

// 🧠 Pega o nome do grupo pela URL
const urlParams = new URLSearchParams(window.location.search);
const groupName = urlParams.get("groupName");



// 🔄 Atualiza as infos do grupo na tela
async function atualizarInformacoesDoGrupo() {
  const grupoRef = doc(db, "grupos", groupName);
  const grupoSnap = await getDoc(grupoRef);

  if (!grupoSnap.exists()) {
    alert("Grupo não encontrado!");
    return;
  }

  const grupo = grupoSnap.data();

  // Atualiza o nome no topo e na sidebar
  document.querySelector("h2.text-5xl").textContent = grupo.nome;
  document.getElementById("groupNameSidebar").textContent = grupo.nome;

  // Atualiza visibilidade
  const visibilidadeSpan = document.querySelector(".content-area span:nth-child(2)");
  visibilidadeSpan.textContent = grupo.visibilidade === "publico" ? "Grupo Público" : "Grupo Privado";

  // Atualiza número máximo de jogadores
  const jogadoresSpan = document.querySelector(".content-area span:nth-child(1)");
  jogadoresSpan.textContent = `${grupo.maxJogadores} Jogadores`;

  // Atualiza imagem
  const imagemGrupo = document.querySelector(".content-area img");
  if (grupo.fotoUrl) {
    imagemGrupo.src = grupo.fotoUrl;
  } else {
    imagemGrupo.src = grupo.nome.toLowerCase().includes("dragão") ?
      "/imagens/dragao.png" :
      "/imagens/4c9eb364cd138d523dc725cf0a23efcd.jpg";
  }

  // Buscar nome do criador
  const criadorRef = doc(db, "usuarios", grupo.criador);
  const criadorSnap = await getDoc(criadorRef);
  const nomeCriador = criadorSnap.exists() ? criadorSnap.data().nome : "Mestre Desconhecido";

  // Atualizar o primeiro nome da lista
  const primeiroNome = document.querySelector(".content-area ul li h4");
  if (primeiroNome) {
    primeiroNome.innerHTML = `${nomeCriador} <span class="text-sm font-normal text-gray-500">(Você)</span>`;
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../../Login/Html/Inicial.html";
    return;
  }

  atualizarInformacoesDoGrupo();
});
