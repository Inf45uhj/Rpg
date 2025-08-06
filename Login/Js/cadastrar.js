// Importe as funções necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBT2qhHDY5IYgJrW2JXyJRcDaqhPL-wR_4",
    authDomain: "login-cb183.firebaseapp.com",
    projectId: "login-cb183",
    storageBucket: "login-cb183.firebasestorage.app",
    messagingSenderId: "847075030829",
    appId: "1:847075030829:web:942c7964933cbaabac85a4",
    measurementId: "G-DLW6SQTX6L"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- FUNÇÃO PARA CADASTRO DE NOVO USUÁRIO ---
// Esta função cria o usuário e armazena o email no banco de dados
async function cadastrarUsuario(email, senha) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Após criar o usuário no Firebase Auth, salve os dados no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            uid: user.uid,
            email: user.email,
        });

        console.log("Usuário cadastrado com sucesso:", user);
        return { success: true, message: "Usuário cadastrado com sucesso!" };

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error.message);
        return { success: false, message: error.message };
    }
}

// Exporte a função para que ela possa ser usada no seu HTML
export { cadastrarUsuario };