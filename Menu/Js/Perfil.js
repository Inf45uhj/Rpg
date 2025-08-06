import { 
  getAuth, onAuthStateChanged, updateProfile, signOut, 
  updatePassword, reauthenticateWithCredential, EmailAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

import { 
  getFirestore, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

import { app } from './firebase.js';

window.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Elementos do DOM
  const previewImage = document.getElementById('previewImage');
  const userDisplayName = document.getElementById('userDisplayName'); // Header
  const profileNickname = document.getElementById('profileNickname'); // Abaixo da foto
  const nicknameInput = document.getElementById('nickname');
  const nicknameRestriction = document.getElementById('nicknameRestriction');
  const userEmailDisplay = document.getElementById('emailDisplay');
  const toggleEmailBtn = document.getElementById('toggleEmail');
  const btnSair = document.getElementById('btnSair');

  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
  const saveChangesBtn = document.getElementById('saveChangesBtn');

  const oneDayMs = 24 * 60 * 60 * 1000;

  if (!previewImage || !userDisplayName || !profileNickname || !nicknameInput || !nicknameRestriction || !userEmailDisplay || !toggleEmailBtn || !btnSair) {
    console.error("Algum elemento necessário não foi encontrado no HTML.");
    return;
  }

  // Array com 5 URLs fixas das skins (substitua pelas suas URLs reais)
  const skinUrls = [
    "../../Fotos/2368805ae966f4741bba0b2d32d9021f.jpg",
    "../../Fotos/eb0f6099ee1ba1987f38ad11662268a8.jpg",
    "../../Fotos/eb671d48f5065361adde355400b7b542.jpg",
    "../../Fotos/ecc963160874540a4c5d1a8a055b8b22.jpg",
    "../../Fotos/ultimaSkin.jpg" // 5ª skin
  ];

  // Variável para armazenar o timestamp da última alteração do apelido (em ms)
  let lastNicknameChange = null;

  // Função para mascarar email
  function maskEmail(email) {
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    const userMasked = user[0] + "*".repeat(user.length - 1);
    const domainParts = domain.split(".");
    const domainMasked = domainParts[0][0] + "*".repeat(domainParts[0].length - 1) + "." + domainParts.slice(1).join(".");
    return userMasked + "@" + domainMasked;
  }

  // Atualiza UI da restrição de alteração de apelido
  function updateNicknameRestrictionUI() {
    const now = Date.now();
    if (lastNicknameChange) {
      const elapsed = now - lastNicknameChange;
      if (elapsed < oneDayMs) {
        const left = oneDayMs - elapsed;
        const hours = Math.floor(left / (60 * 60 * 1000));
        const minutes = Math.floor((left % (60 * 60 * 1000)) / (60 * 1000));
        nicknameInput.readOnly = true;
        nicknameInput.classList.add('opacity-50', 'cursor-not-allowed');
        saveChangesBtn.disabled = true;
        saveChangesBtn.classList.add('opacity-50', 'cursor-not-allowed');
        nicknameRestriction.textContent = `Você pode alterar seu apelido novamente em ${hours}h e ${minutes}min.`;
        return;
      }
    }
    nicknameInput.readOnly = false;
    nicknameInput.classList.remove('opacity-50', 'cursor-not-allowed');
    saveChangesBtn.disabled = false;
    saveChangesBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    nicknameRestriction.textContent = 'Você pode alterar seu apelido.';
  }

  // Alterna visualização do e-mail
  let emailVisible = false;
  toggleEmailBtn.addEventListener('click', () => {
    emailVisible = !emailVisible;
    if (emailVisible) {
      userEmailDisplay.textContent = auth.currentUser.email;
      toggleEmailBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      userEmailDisplay.textContent = maskEmail(auth.currentUser.email);
      toggleEmailBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });

  // Carregar dados do usuário e skin
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../../Login/Html/Inicial.html";
      return;
    }

    await user.reload();
    const updatedUser = auth.currentUser;

    // Busca os dados do usuário no Firestore
    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        profileNickname.textContent = data.nome || updatedUser.displayName || "Aventureiro Desconhecido";
        lastNicknameChange = data.lastNicknameChange || null;
      } else {
        profileNickname.textContent = updatedUser.displayName || "Aventureiro Desconhecido";
      }
    } catch (error) {
      console.error("Erro ao buscar dados do Firestore:", error);
      profileNickname.textContent = updatedUser.displayName || "Aventureiro Desconhecido";
    }

    userDisplayName.textContent = updatedUser.displayName || "Aventureiro Desconhecido";
    nicknameInput.value = updatedUser.displayName || "";

    userEmailDisplay.textContent = maskEmail(user.email);
    toggleEmailBtn.innerHTML = '<i class="fas fa-eye"></i>';
    emailVisible = false;

    updateNicknameRestrictionUI();

    // Skin
    if (!user.photoURL) {
      const randomIndex = Math.floor(Math.random() * skinUrls.length);
      const selectedSkin = skinUrls[randomIndex];
      try {
        await updateProfile(user, { photoURL: selectedSkin });
        previewImage.src = selectedSkin;
      } catch (err) {
        console.error("Erro ao definir skin aleatória:", err);
        previewImage.src = ""; // fallback
      }
    } else {
      previewImage.src = user.photoURL;
    }
  });

  // Salvar alterações (apelido e senha)
  saveChangesBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("Usuário não autenticado.");

    const newNickname = nicknameInput.value.trim();
    if (!newNickname) return alert("Digite um apelido válido.");

    // Valida restrição Firestore
    const now = Date.now();
    if (lastNicknameChange && now - lastNicknameChange < oneDayMs) {
      alert("Você só pode alterar o apelido uma vez a cada 24 horas.");
      return;
    }

    // Validar senha
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (newPassword || confirmNewPassword || currentPassword) {
      if (!currentPassword) return alert("Informe sua senha atual para alterar a senha.");
      if (newPassword !== confirmNewPassword) return alert("Nova senha e confirmação não conferem.");
      if (newPassword.length < 6) return alert("A nova senha deve ter ao menos 6 caracteres.");

      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } catch {
        return alert("Senha atual incorreta.");
      }
    }

    // Atualiza apelido no Firebase Auth
    try {
      await updateProfile(user, { displayName: newNickname });
    } catch (err) {
      console.error("Erro ao atualizar apelido no Auth:", err);
      alert("Erro ao atualizar apelido.");
      return;
    }

    // Atualiza apelido e data no Firestore
    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: newNickname,
        lastNicknameChange: now
      }, { merge: true });
      lastNicknameChange = now;
    } catch (err) {
      console.error("Erro ao atualizar apelido no Firestore:", err);
      alert("Erro ao salvar apelido.");
      return;
    }

    // Atualiza senha se necessário
    if (newPassword) {
      try {
        await updatePassword(user, newPassword);
      } catch (err) {
        console.error("Erro ao atualizar senha:", err);
        alert("Erro ao atualizar senha.");
        return;
      }
    }

    userDisplayName.textContent = newNickname;
    profileNickname.textContent = newNickname;
    nicknameRestriction.textContent = "";

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmNewPasswordInput.value = "";

    alert("Perfil atualizado com sucesso!");
    updateNicknameRestrictionUI();
  });

  // Botão sair
  btnSair.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = "../../Login/Html/Inicial.html";
    } catch (err) {
      console.error("Erro ao sair:", err);
      alert("Erro ao sair. Tente novamente.");
    }
  });
});
