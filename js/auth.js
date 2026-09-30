// Função para renderizar a tela de login
function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container" style="max-width: 400px;">
            <h1 class="titulo">Controle de Estoque</h1>
            <p class="subtitulo">Sistema de Materiais de Limpeza</p>
            
            <div id="mensagem-login"></div>
            
            <form id="form-login" class="formulario">
                <div class="campo">
                    <label>Usuário</label>
                    <input type="text" id="usuario" placeholder="Digite seu usuário" required autofocus>
                </div>
                
                <div class="campo">
                    <label>Senha</label>
                    <input type="password" id="senha" placeholder="Digite sua senha" required>
                </div>
                
                <div class="botoes">
                    <button type="submit" class="btn btn-primario">Entrar</button>
                    <button type="button" class="btn btn-secundario" onclick="limparLogin()">Limpar</button>
                </div>
            </form>
            
            <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                <p>Usuário de teste: <strong>admin</strong></p>
                <p>Senha: <strong>admin123</strong></p>
            </div>
        </div>
    `;

    document.getElementById('form-login').addEventListener('submit', handleLogin);
}

// Função para fazer login
async function handleLogin(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const btnEntrar = e.target.querySelector('button[type="submit"]');
    
    btnEntrar.disabled = true;
    btnEntrar.textContent = 'Entrando...';
    
    try {
        const usuarioEncontrado = await DB.buscarUsuario(usuario, senha);

        if (!usuarioEncontrado) {
            mostrarMensagem('mensagem-login', 'Usuário ou senha incorretos!', 'erro');
        } else {
            usuarioLogado = usuarioEncontrado;
            renderMenuPrincipal();
        }
    } catch (error) {
        mostrarMensagem('mensagem-login', 'Erro ao tentar fazer login. Verifique sua conexão.', 'erro');
    } finally {
        btnEntrar.disabled = false;
        btnEntrar.textContent = 'Entrar';
    }
}

// Função para limpar campos de login
function limparLogin() {
    document.getElementById('usuario').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('mensagem-login').innerHTML = '';
}

// Função para fazer logout
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        usuarioLogado = null;
        renderLogin();
    }
}

// Função para renderizar o menu principal
function renderMenuPrincipal() {
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <div>
                    <h1 class="titulo">Menu Principal</h1>
                    <p class="subtitulo">${dataAtual}</p>
                </div>
                <div class="info-usuario">
                    <p><strong>Usuário:</strong> ${usuarioLogado.nome}</p>
                    <button class="btn btn-secundario" onclick="logout()" style="margin-top: 10px;">
                        🚪 Sair
                    </button>
                </div>
            </div>

            <div class="menu-grid">
                <div class="menu-card" onclick="renderEstoque()">
                    <div class="menu-card-icone">📦</div>
                    <h3 class="menu-card-titulo">Estoque</h3>
                    <p class="menu-card-descricao">Visualizar materiais cadastrados</p>
                </div>

                <div class="menu-card" onclick="renderCadastroProduto()">
                    <div class="menu-card-icone">➕</div>
                    <h3 class="menu-card-titulo">Cadastrar Produto</h3>
                    <p class="menu-card-descricao">Adicionar novo material</p>
                </div>

                <div class="menu-card" onclick="renderEntrada()">
                    <div class="menu-card-icone">📥</div>
                    <h3 class="menu-card-titulo">Registrar Entrada</h3>
                    <p class="menu-card-descricao">Entrada de novos materiais</p>
                </div>

                <div class="menu-card" onclick="renderSaida()">
                    <div class="menu-card-icone">📤</div>
                    <h3 class="menu-card-titulo">Registrar Saída</h3>
                    <p class="menu-card-descricao">Saída de materiais</p>
                </div>

                <div class="menu-card" onclick="renderRelatorios()">
                    <div class="menu-card-icone">📊</div>
                    <h3 class="menu-card-titulo">Relatórios</h3>
                    <p class="menu-card-descricao">Consultar informações</p>
                </div>
            </div>
        </div>
    `;
}

// Função auxiliar para mostrar mensagens
function mostrarMensagem(elementoId, texto, tipo) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;
        
        setTimeout(() => {
            elemento.innerHTML = '';
        }, 5000);
    }
}

// Iniciar o app
window.addEventListener('DOMContentLoaded', () => {
    renderLogin();
});