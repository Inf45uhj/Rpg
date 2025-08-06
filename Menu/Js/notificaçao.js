import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc
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

let convitesPendentes = [];
let conviteAtualIndex = 0;
let usuarioAtual = null;

// Elementos DOM
const btnSino = document.getElementById("btnSino");
const noti = document.getElementById("notificacao-convite");
const mensagem = document.getElementById("mensagem-convite");
const btnAceitar = document.getElementById("btnAceitar");
const btnRecusar = document.getElementById("btnRecusar");

// Auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  usuarioAtual = user;

  const q = query(
    collectionGroup(db, "convites"),
    where("convidadoId", "==", user.uid),
    where("status", "==", "pendente")
  );

  const querySnapshot = await getDocs(q);
  convitesPendentes = querySnapshot.docs.map(doc => ({
    id: doc.id,
    grupoId: doc.ref.parent.parent.id,
    conviteRef: doc.ref,
    ...doc.data()
  }));

  if (convitesPendentes.length === 0) {
    console.log("Sem convites pendentes.");
  }
});

// Mostrar notificação
btnSino.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!noti.classList.contains("hidden")) {
    fecharNotificacao();
    return;
  }

  if (convitesPendentes.length === 0) {
    alert("Você não tem convites pendentes.");
    return;
  }

  const convite = convitesPendentes[conviteAtualIndex];
  mensagem.textContent = `Você foi convidado para o grupo "${convite.nomeGrupo || convite.grupoId}".`;
  noti.classList.remove("hidden");
});

// Aceitar convite
btnAceitar.addEventListener("click", async () => {
  const convite = convitesPendentes[conviteAtualIndex];
  try {
    // Atualiza o status do convite
    await updateDoc(convite.conviteRef, { status: "aceito" });

    // Adiciona o usuário ao grupo
    const jogadorRef = doc(db, "grupos", convite.grupoId, "jogadores", usuarioAtual.uid);
    await setDoc(jogadorRef, {
      id: usuarioAtual.uid,
      nome: usuarioAtual.displayName || "Aventureiro",
      entrouEm: new Date()
    });

    alert(`Você entrou no grupo "${convite.nomeGrupo || convite.grupoId}"!`);

    removerConviteAtual();
    fecharNotificacao();

    // (Opcional) recarregar a lista de grupos
    if (typeof carregarGruposUsuario === "function") {
      carregarGruposUsuario(); // você pode ter essa função em outro script
    }

  } catch (err) {
    console.error("Erro ao aceitar convite:", err);
    alert("Erro ao entrar no grupo.");
  }
});

// Recusar convite
btnRecusar.addEventListener("click", async () => {
  const convite = convitesPendentes[conviteAtualIndex];
  try {
    await updateDoc(convite.conviteRef, { status: "recusado" });
    removerConviteAtual();
    fecharNotificacao();
  } catch (err) {
    console.error("Erro ao recusar convite:", err);
    alert("Erro ao recusar convite.");
  }
});

// Fecha notificação
function fecharNotificacao() {
  noti.classList.add("hidden");
}

// Remove convite da lista
function removerConviteAtual() {
  convitesPendentes.splice(conviteAtualIndex, 1);
  if (convitesPendentes.length === 0) {
    conviteAtualIndex = 0;
  } else if (conviteAtualIndex >= convitesPendentes.length) {
    conviteAtualIndex = convitesPendentes.length - 1;
  }
}

// Fecha notificação ao clicar fora
document.addEventListener("click", (e) => {
  if (
    !noti.classList.contains("hidden") &&
    !noti.contains(e.target) &&
    !btnSino.contains(e.target)
  ) {
    fecharNotificacao();
  }
});

