const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Use variáveis de ambiente para a chave secreta (mais seguro)
const SECRET_KEY = process.env.SECRET_KEY || 'seu-segredo-muito-secreto-para-desenvolvimento'; // Chave de fallback para desenvolvimento

if (process.env.NODE_ENV !== 'production' && SECRET_KEY === 'seu-segredo-muito-secreto-para-desenvolvimento') {
    console.warn("AVISO: Usando chave secreta padrão para desenvolvimento. NÃO use isso em produção!");
}

app.use(bodyParser.json());
app.use(cors());

// "Banco de dados" fictício (substitua por um banco de dados real em produção!)
let users = [];

app.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(409).json({ message: 'Já existe um usuário cadastrado com este email.' }); // Código 409 Conflict
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        users.push({ nome, email, password: hashedPassword });
        return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        return res.status(500).json({ message: 'Erro interno ao cadastrar o usuário.' }); // Erro 500 para erros no servidor
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos.' }); // Mensagem mais genérica para segurança
    }

    try {
        const isPasswordValid = await bcrypt.compare(senha, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Usuário ou senha incorretos.' }); // Mensagem mais genérica para segurança
        }

        const token = jwt.sign({ email: user.email, nome: user.nome }, SECRET_KEY, { expiresIn: '1h' }); // Inclui email e nome no payload
        return res.status(200).json({ token }); // Retorna apenas o token
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return res.status(500).json({ message: 'Erro interno ao realizar o login.' }); // Erro 500 para erros no servidor
    }
});

app.get('/dados', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Verifica se o header existe e começa com "Bearer "
        return res.status(401).json({ message: 'Token não fornecido ou em formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return res.status(200).json({ user: decoded }); // Retorna apenas os dados do usuário decodificados
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend rodando na porta ${port}`);
});