const mongoose = require('mongoose');
const Registro = require('./src/modelo/registro');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares para permitir JSON e CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROTAS DA API ---

app.post("/registra", async (req, res) => {
    console.log('[SERVIDOR] Requisição recebida na rota /registra');
    try {
        const dados = req.body;
        // ETAPA 1: Validar os dados recebidos (CORRIGIDO)
        if (!dados.usuario || !dados.email || !dados.senha) {
            return res.status(400).json({ erro: "Dados incompletos. 'usuario', 'email' e 'senha' são obrigatórios." });
        }

        // ETAPA 2: Chamar a função para registrar o usuário
        const novoUsuario = await registraUser(dados);

        // ETAPA 3: Enviar a resposta correta baseada no resultado
        if (novoUsuario) {
            // Se um novo usuário foi criado com sucesso
            return res.status(200).json({ msg: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
        } else {
            // Se o usuário já existia (registraUser retornou null)
            return res.status(409).json({ erro: "Este e-mail já está cadastrado." }); // 409 Conflict
        }

    } catch (error) {
        console.error("Erro na rota /registra:", error);
        return res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
    }
});

app.post("/login", async (req, res) => { 
    console.log('[SERVIDOR] Requisição recebida na rota /login');
    try {
        const dados = req.body;
        
        // ETAPA 1: Validar os dados recebidos 
        if (!dados.email || !dados.senha) {
            return res.status(400).json({ erro: "Dados incompletos. 'email' e 'senha' são obrigatórios." });
        }
        // ETAPA 2: Chamar a função para buscar o usuário
        const usuario = await buscaUser(dados.email, dados.senha);

        if (usuario) {
            // Se o usuário foi encontrado, login sucesso!
            return res.status(200).json({
                msg: "Login realizado com sucesso! Seja bem-vindo(a) à Agro Analyst!",
                // Não envie a senha de volta para o cliente! Apenas dados seguros.
                usuario: {
                    id: usuario.usuarioId,
                    nome: usuario.usuario,
                    email: usuario.email
                }
            });
        } else {
            // Se nenhum usuário foi encontrado (email ou senha incorretos)
            return res.status(404).json({ erro: "Usuário não encontrado ou senha incorreta. Verifique os dados e tente novamente." });
        }

    } catch (error) {
        console.error("Erro na rota /login:", error);
        return res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
    }
});
// --- FUNÇÕES DE BANCO DE DADOS ---

async function conectaDB() {
    console.log('Iniciando conexao!');
    if (mongoose.connection.readyState === 1) return;
    try {
        console.log('Conectando ao banco de dados...');
        await mongoose.connect(
            'mongodb+srv://Testesala:teste123@ravicluster.keccztf.mongodb.net/AgroDbUsuarios?retryWrites=true&w=majority&appName=RaviCluster',
            { serverSelectionTimeoutMS: 10000 }, // Aumentei o timeout para redes mais lentas
        );
        console.log('Banco de dados conectado !!');
    } catch (e) {
        console.error('Erro de conexão com o banco de dados:', e.message);
        process.exit(1); // Encerra a aplicação se não conseguir conectar
    }
}

// Função para registrar um novo usuário (SIMPLIFICADA E CORRIGIDA)
async function registraUser(dados) {
    // 1. Verifica se o usuário já existe
    const usuarioExistente = await Registro.findOne({ email: dados.email });
    if (usuarioExistente) {
        console.log(`Tentativa de cadastro com e-mail já existente: ${dados.email}`);
        return null; // Retorna nulo para sinalizar que o usuário já existe
    }

    // 2. Se não existir, cria e salva o novo usuário
    console.log(`Criando novo usuário: ${dados.usuario}`);
    const usuarioId = Math.random().toString(36).substring(2, 15);
    const novoUsuario = new Registro({
        usuarioId,
        usuario: dados.usuario,
        email: dados.email,
        senha: dados.senha, // Em um projeto real, você deveria criptografar a senha aqui
        idade: dados.idade || null
    });
    return await novoUsuario.save();
}

async function buscaUser(email, senha) {
    return await Registro.findOne({email:email,senha:senha})
}

// --- INICIALIZAÇÃO DO SERVIDOR ---

async function startServer() {
    // ETAPA 1: Conectar ao banco de dados (CORRIGIDO)
    await conectaDB();

    // ETAPA 2: Iniciar o servidor Express
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}. Aguardando requisições...`);
    });
}

// --- INICIA A APLICAÇÃO ---
// A única função que precisa ser chamada é a que inicia o servidor.
startServer();