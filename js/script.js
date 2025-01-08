document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("formLogin");
    const cadastroForm = document.getElementById("formCadastro");
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");
    const pedidosLink = document.getElementById("pedidos-link");
    const mensagemErroLogin = document.getElementById("mensagem-erro-login"); // Elemento para mensagens de erro de login
    const mensagemErroCadastro = document.getElementById("mensagem-erro-cadastro"); // Elemento para mensagens de erro de cadastro

    // Função que atualiza o estado de login na navegação
    function atualizarEstadoLogin() {
        const token = localStorage.getItem("token");
        if (token) {
            if (loginLink) loginLink.style.display = "none";
            if (logoutLink) logoutLink.style.display = "block";
            if (pedidosLink) pedidosLink.style.display = "block";
        } else {
            if (loginLink) loginLink.style.display = "block";
            if (logoutLink) logoutLink.style.display = "none";
            if (pedidosLink) pedidosLink.style.display = "none";
        }
    }

    atualizarEstadoLogin();

    // Função para adicionar ao carrinho
    function adicionarAoCarrinho(produto, preco) {
        if (!produto || typeof preco !== "number") {
            console.error("Erro ao adicionar ao carrinho: Produto ou preço inválido.");
            alert("Erro ao adicionar produto ao carrinho.");
            return;
        }

        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        carrinho.push({ produto, preco });
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        console.log(`Produto adicionado: ${produto} - R$ ${preco.toFixed(2)}`);
        alert(`${produto} foi adicionado ao carrinho!`);
    }

    // Função que verifica se o usuário está logado antes de adicionar ao carrinho
    function verificarLoginParaCompra(produto, preco) {
        if (!produto || typeof preco !== "number") {
            console.error("Produto ou preço inválido:", produto, preco);
            alert("Ocorreu um erro ao tentar adicionar o produto ao carrinho.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado para adicionar produtos ao carrinho.");
            window.location.href = "login.html";
        } else {
            adicionarAoCarrinho(produto, preco);
        }
    }

    // Função de cadastro de usuário
    async function cadastrarUsuario(nome, email, senha) {
        if (mensagemErroCadastro) mensagemErroCadastro.textContent = ""; // Limpa mensagens de erro anteriores

        if (!nome || !email || !senha) {
            if (mensagemErroCadastro) mensagemErroCadastro.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        // Verifica se as senhas coincidem
        if (senha !== document.getElementById("confirmaSenha").value) {
            if (mensagemErroCadastro) mensagemErroCadastro.textContent = "As senhas não coincidem.";
            return;
        }

        try {
            // Envia a solicitação de cadastro
            const response = await fetch("http://localhost:3000/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha }),
            });

            if (response.ok) {
                alert("Cadastro realizado com sucesso!");
                window.location.href = "login.html";
            } else {
                const data = await response.json();
                if (mensagemErroCadastro) mensagemErroCadastro.textContent = data.message || "Erro ao realizar o cadastro.";
                console.error("Erro no cadastro:", data);
            }
        } catch (error) {
            console.error("Erro no cadastro:", error);
            if (mensagemErroCadastro) mensagemErroCadastro.textContent = "Erro ao realizar o cadastro. Tente novamente mais tarde.";
        }
    }

    // Função de login
    async function login(email, senha) { // Alterado para email e senha
        if (mensagemErroLogin) mensagemErroLogin.textContent = "";

        if (!email || !senha) {
            if (mensagemErroLogin) mensagemErroLogin.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }), // Alterado para email e senha
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                atualizarEstadoLogin();
                window.location.href = "index.html";
            } else {
                if (mensagemErroLogin) mensagemErroLogin.textContent = data.message || "Erro ao fazer login. Verifique suas credenciais.";
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            if (mensagemErroLogin) mensagemErroLogin.textContent = "Erro ao fazer login. Tente novamente mais tarde.";
        }
    }

    // Função de logout
    if (logoutLink) {
        logoutLink.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");
            atualizarEstadoLogin();
            window.location.href = "index.html";
        });
    }

    // Event listener para o formulário de login
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value; // Use email como username
            const senha = document.getElementById("senha").value;
            login(email, senha); // Passando email e senha
        });
    }

    // Event listener para o formulário de cadastro
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("emailCadastro").value;
            const senha = document.getElementById("senhaCadastro").value;
            cadastrarUsuario(nome, email, senha);
        });
    }

    // Verificação de login em links de acesso restrito
    document.querySelectorAll(".acessorio-link").forEach(link => {
        link.addEventListener("click", (event) => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Você precisa estar logado para acessar essa página.");
                window.location.href = "login.html";
                event.preventDefault();
            }
        });
    });
});
