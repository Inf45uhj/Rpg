import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  doc,
  getDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuração do Firebase
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
const ulMeusGrupos = document.getElementById("meus-grupos");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para ver seus grupos.");
    window.location.href = "login.html";
    return;
  }

  ulMeusGrupos.innerHTML = "";

  try {
    // Consulta todos os documentos em /grupos/{grupoId}/jogadores onde o ID seja do usuário
    const q = query(
      collectionGroup(db, "jogadores"),
      where("id", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      ulMeusGrupos.innerHTML = "<li class='text-gray-400'>Você ainda não participa de nenhum grupo.</li>";
      return;
    }

    for (const jogadorDoc of snapshot.docs) {
      const grupoRef = jogadorDoc.ref.parent.parent; // Referência ao grupo pai
      const grupoSnap = await getDoc(grupoRef);

      if (!grupoSnap.exists()) continue;

      const grupo = grupoSnap.data();

      // Função para escolher foto padrão
      function escolherFotoGrupo(grupo) {
        if (grupo.fotoUrl) return grupo.fotoUrl;
        const nomeMinusculo = grupo.nome.toLowerCase();
        if (nomeMinusculo.includes("dragão")) return "/imagens/dragao.png";
        return "/imagens/4c9eb364cd138d523dc725cf0a23efcd.jpg";
      }

      const fotoUrl = escolherFotoGrupo(grupo);

      const li = document.createElement("li");
      li.className = "bg-rpg-card p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-rpg-accent transition-colors";

      li.innerHTML = `
        <div class="flex items-center space-x-4">
          <img src="${fotoUrl}" alt="Foto do grupo ${grupo.nome}" class="w-12 h-12 rounded-full object-cover border border-rpg-accent" />
          <div>
            <h4 class="font-semibold text-white">${grupo.nome}</h4>
            <p class="text-sm text-gray-400">Criado em: ${new Date(grupo.criadoEm).toLocaleDateString()}</p>
          </div>
        </div>
        <i class="fas fa-arrow-right text-rpg-accent"></i>
      `;

      li.addEventListener("click", () => {
        window.location.href = `../../Grupos/Html/Grupo-RPG.html?groupName=${encodeURIComponent(grupo.nome)}`;
      });

      ulMeusGrupos.appendChild(li);
    }

  } catch (error) {
    console.error("Erro ao carregar grupos:", error);
    ulMeusGrupos.innerHTML = "<li class='text-red-500'>Erro ao carregar seus grupos.</li>";
  }
});
