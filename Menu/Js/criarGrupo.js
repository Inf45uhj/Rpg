  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

  const form = document.getElementById("formGrupo");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Você precisa estar logado para criar um grupo.");
      window.location.href = "login.html";
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const groupName = form.groupName.value.trim();
      const numPlayers = parseInt(form.numPlayers.value);
      const visibility = form.groupVisibility.value;

      if (!groupName || numPlayers < 3 || numPlayers > 10) {
        alert("Preencha os dados corretamente.");
        return;
      }

      const grupoRef = doc(db, "grupos", groupName); // nome como ID do grupo
      const grupoData = {
        nome: groupName,
        maxJogadores: numPlayers,
        visibilidade: visibility,
        criador: user.uid,
        criadoEm: new Date().toISOString(),
      };

      try {
        await setDoc(grupoRef, grupoData);
        alert("Grupo criado com sucesso!");
        window.location.href = `Grupo.html?groupName=${groupName}`;
      } catch (error) {
        console.error("Erro ao criar grupo:", error);
        alert("Erro ao criar grupo.");
      }
    });
  });