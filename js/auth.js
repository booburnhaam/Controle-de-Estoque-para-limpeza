// Renderizar tela de login melhorada
function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container-login">
            <div class="login-box">
                <div class="login-header">
                    <h1 class="login-titulo">Controle de Estoque</h1>
                    <p class="login-subtitulo">Materiais de Limpeza</p>
                </div>

                <div id="mensagem-login"></div>

                <form id="form-login" class="formulario-login">
                    <div class="campo">
                        <label>Usuário</label>
                        <input type="text" id="usuario" placeholder="Digite seu usuário" required autofocus>
                    </div>

                    <div class="campo">
                        <label>Senha</label>
                        <input type="password" id="senha" placeholder="Digite sua senha" required>
                    </div>

                    <div class="campo-checkbox">
                        <input type="checkbox" id="lembrar" name="lembrar">
                        <label for="lembrar">Lembrar-me neste computador</label>
                    </div>

                    <button type="submit" class="btn btn-primario btn-login">Entrar</button>
                </form>

                <div class="login-info">
                    <p><strong>Dados de teste:</strong></p>
                    <p>Usuário: <code>admin</code></p>
                    <p>Senha: <code>admin123</code></p>
                </div>

                <div class="login-footer">
                    <p style="font-size: 12px; color: #999; margin-top: 20px;">
                        Este sistema usa autenticação local.<br>
                        Os dados são armazenados com segurança no seu navegador.
                    </p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('form-login').addEventListener('submit', handleLogin);
}

// Fazer login com segurança
async function handleLogin(e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const lembrar = document.getElementById('lembrar').checked;
    const btnEntrar = e.target.querySelector('button[type="submit"]');

    btnEntrar.disabled = true;
    btnEntrar.textContent = 'Entrando...';

    try {
        const usuarioEncontrado = await DB.validarUsuario(usuario, senha);

        if (!usuarioEncontrado.ativo) {
            mostrarMensagem('mensagem-login', 'Este usuário foi desativado.', 'erro');
            btnEntrar.disabled = false;
            btnEntrar.textContent = 'Entrar';
            return;
        }

        usuarioLogado = usuarioEncontrado;

        // Salvar preferência de lembrete
        if (lembrar) {
            sessionStorage.setItem('usuario_lembrado', JSON.stringify(usuarioEncontrado));
        }

        // Log de acesso
        console.log(`Usuário ${usuario} fez login em ${new Date().toLocaleString('pt-BR')}`);

        renderMenuPrincipal();
    } catch (error) {
        mostrarMensagem('mensagem-login', error.message || 'Erro ao tentar fazer login.', 'erro');
        btnEntrar.disabled = false;
        btnEntrar.textContent = 'Entrar';
    }
}

// Limpar campos de login
function limparLogin() {
    document.getElementById('usuario').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('lembrar').checked = false;
    document.getElementById('mensagem-login').innerHTML = '';
}

// Fazer logout com segurança (modal personalizado)
async function logout() {
    const ok = await confirmarModal({
        titulo: '🚪 Sair do sistema?',
        html: '<p>Tem certeza que deseja sair?</p>',
        textoOk: 'Sair',
        perigo: true
    });
    if (!ok) return;

    console.log(`Usuário ${usuarioLogado.nome} fez logout em ${new Date().toLocaleString('pt-BR')}`);
    usuarioLogado = null;
    sessionStorage.removeItem('usuario_lembrado');
    renderLogin();
}

// Renderizar menu principal melhorado
async function renderMenuPrincipal() {
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        // Buscar dados para o dashboard
        const produtos = await DB.listarProdutos();

        const totalProdutos = produtos.length;

        const produtosComBaixoEstoque = produtos.filter(
            p => p.quantidade <= p.estoque_minimo && p.quantidade > 0
        ).length;

        const produtosCriticos = produtos.filter(
            p => p.quantidade <= 0
        ).length;

        // Contar movimentações de hoje
        const hoje = new Date().toISOString().split('T')[0];

        const entradas = await DB.listarEntradas();
        const saidas = await DB.listarSaidas();

        const entradasHoje = entradas.filter(
            e => e.data_entrada === hoje
        ).length;

        const saidasHoje = saidas.filter(
            s => s.data_saida === hoje
        ).length;

        const app = document.getElementById('app');

        // =========================================================
        // HTML DA TELA
        // =========================================================

        app.innerHTML = `
            <div class="container">

                <div class="header">
                    <div>
                        <h1 class="titulo">Menu Principal</h1>
                        <p class="subtitulo">${dataAtual}</p>
                    </div>

                    <div class="info-usuario">
                        <div class="usuario-card">
                            <p>
                                <strong>Usuário:</strong>
                                ${usuarioLogado.nome}
                            </p>

                            <p style="font-size: 12px; color: #999;">
                                @${usuarioLogado.usuario}
                            </p>
                        </div>

                        <div class="botoes-usuario">
                            <button
                                class="btn btn-pequeno"
                                onclick="abrirAlterarSenha()">
                                🔐 Alterar Senha
                            </button>

                            ${usuarioLogado.nivel === 'admin' ? `
                                <button
                                    class="btn btn-pequeno"
                                    onclick="abrirPaginaAdmin()">
                                    ⚙️ Admin
                                </button>
                            ` : ''}

                            <button
                                class="btn btn-pequeno"
                                onclick="alternarModoEscuro()"
                                id="btnTemaMenu">
                                🌙 Tema
                            </button>

                            <button
                                class="btn btn-pequeno btn-perigo"
                                onclick="logout()">
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                </div>


                <!-- CARDS DO MENU -->

                <div class="menu-grid">

                    <div class="menu-card" onclick="renderEstoque()">
                        <div class="menu-card-icone">📦</div>
                        <h3 class="menu-card-titulo">Estoque</h3>
                        <p class="menu-card-descricao">
                            Visualizar materiais cadastrados
                        </p>
                    </div>

                    <div class="menu-card" onclick="renderCadastroProduto()">
                        <div class="menu-card-icone">➕</div>
                        <h3 class="menu-card-titulo">Cadastrar Produto</h3>
                        <p class="menu-card-descricao">
                            Adicionar novo material
                        </p>
                    </div>

                    <div class="menu-card" onclick="renderEntrada()">
                        <div class="menu-card-icone">📥</div>
                        <h3 class="menu-card-titulo">Registrar Entrada</h3>
                        <p class="menu-card-descricao">
                            Entrada de novos materiais
                        </p>
                    </div>

                    <div class="menu-card" onclick="renderSaida()">
                        <div class="menu-card-icone">📤</div>
                        <h3 class="menu-card-titulo">Registrar Saída</h3>
                        <p class="menu-card-descricao">
                            Saída de materiais
                        </p>
                    </div>

                    <div class="menu-card" onclick="renderRelatorios()">
                        <div class="menu-card-icone">📊</div>
                        <h3 class="menu-card-titulo">Relatórios</h3>
                        <p class="menu-card-descricao">
                            Consultar informações
                        </p>
                    </div>

                </div>


                <!-- RESUMO DO ESTOQUE -->

                <div class="dashboard-secao">

                    <h2 class="dashboard-titulo">
                        Resumo do Estoque
                    </h2>

                    <div class="dashboard-grid">

                        <div class="dashboard-card card-azul">
                            <div class="dashboard-valor">
                                ${totalProdutos}
                            </div>

                            <div class="dashboard-label">
                                Total de Produtos
                            </div>

                            <div class="dashboard-icone">
                                📦
                            </div>
                        </div>


                        <div class="dashboard-card card-amarelo">
                            <div class="dashboard-valor">
                                ${produtosComBaixoEstoque}
                            </div>

                            <div class="dashboard-label">
                                Estoque Baixo
                            </div>

                            <div class="dashboard-icone">
                                ⚠️
                            </div>
                        </div>


                        <div class="dashboard-card card-vermelho">
                            <div class="dashboard-valor">
                                ${produtosCriticos}
                            </div>

                            <div class="dashboard-label">
                                Produtos Críticos
                            </div>

                            <div class="dashboard-icone">
                                🚨
                            </div>
                        </div>


                        <div class="dashboard-card card-verde">
                            <div class="dashboard-valor">
                                ${entradasHoje}
                            </div>

                            <div class="dashboard-label">
                                Entradas Hoje
                            </div>

                            <div class="dashboard-icone">
                                📥
                            </div>
                        </div>


                        <div class="dashboard-card card-roxo">
                            <div class="dashboard-valor">
                                ${saidasHoje}
                            </div>

                            <div class="dashboard-label">
                                Saídas Hoje
                            </div>

                            <div class="dashboard-icone">
                                📤
                            </div>
                        </div>


                        <div class="dashboard-card card-laranja">
                            <div class="dashboard-valor">
                                ${entradasHoje + saidasHoje}
                            </div>

                            <div class="dashboard-label">
                                Movimentações Hoje
                            </div>

                            <div class="dashboard-icone">
                                ↔️
                            </div>
                        </div>

                    </div>

                </div>


                <!-- GRÁFICO -->

                <div class="grafico-secao">

                    <h2 class="dashboard-titulo">
                        Status do Estoque
                    </h2>

                    <div
                        id="grafico-status"
                        class="grafico-container">
                    </div>

                </div>


                <!-- LISTAS -->

                <div class="dashboard-listagens">

                    <div class="dashboard-lista">

                        <h3>
                            Produtos com Estoque Baixo
                        </h3>

                        <div id="lista-baixo-estoque">
                        </div>

                    </div>


                    <div class="dashboard-lista">

                        <h3>
                            Produtos Sem Estoque
                        </h3>

                        <div id="lista-critica">
                        </div>

                    </div>

                </div>


                <!-- ATALHOS -->

                <div class="atalhos-info">

                    <strong>⌨️ Atalhos:</strong>

                    <span>
                        <kbd>Ctrl</kbd>+<kbd>N</kbd>
                        Novo produto
                    </span>

                    <span>
                        <kbd>Ctrl</kbd>+<kbd>E</kbd>
                        Estoque
                    </span>

                    <span>
                        <kbd>Ctrl</kbd>+<kbd>R</kbd>
                        Relatórios
                    </span>

                    <span>
                        <kbd>Ctrl</kbd>+<kbd>L</kbd>
                        Sair
                    </span>

                    <span>
                        <kbd>Esc</kbd>
                        Voltar ao menu
                    </span>

                </div>

            </div>
        `;


        // =========================================================
        // JAVASCRIPT EXECUTADO DEPOIS DO HTML
        // =========================================================

        // Preencher lista de produtos com estoque baixo
        preencherListaBaixoEstoque();

        // Preencher lista de produtos sem estoque
        preencherListaCritica();


        // Desenhar o gráfico de status
        if (typeof desenharGraficoStatus === 'function') {

            desenharGraficoStatus(
                totalProdutos -
                produtosComBaixoEstoque -
                produtosCriticos,

                produtosComBaixoEstoque,

                produtosCriticos
            );

        } else {

            console.error(
                'A função desenharGraficoStatus não foi encontrada. Verifique se o grafico.js foi carregado.'
            );

        }


    } catch (error) {

        console.error(
            'Erro ao carregar dashboard:',
            error
        );

        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="container">

                <p style="color: red;">
                    Erro ao carregar o dashboard.
                    Tente recarregar a página.
                </p>

            </div>
        `;
    }
}

// ============================================
// LISTA DE PRODUTOS COM ESTOQUE BAIXO
// ============================================

async function preencherListaBaixoEstoque() {

    const lista = document.getElementById('lista-baixo-estoque');

    if (!lista) return;

    const produtos = (await DB.listarProdutos()).filter(
        p => p.quantidade <= p.estoque_minimo && p.quantidade > 0
    );

    // Nenhum produto com estoque baixo
    if (produtos.length === 0) {

        lista.innerHTML = `
            <div class="lista-vazia">
                <span class="lista-vazia-icone">✅</span>

                <div>
                    <strong>Estoque em dia!</strong>

                    <p>
                        Nenhum produto está abaixo do estoque mínimo.
                    </p>
                </div>
            </div>
        `;

        return;
    }

    // Mostrar no máximo 5 produtos no dashboard
    const produtosExibidos = produtos.slice(0, 5);

    lista.innerHTML = produtosExibidos.map(p => {

        const percentual = p.estoque_minimo > 0
            ? Math.round((p.quantidade / p.estoque_minimo) * 100)
            : 0;

        return `
            <div class="item-lista item-estoque-baixo">

                <div class="item-lista-icone">
                    ⚠️
                </div>

                <div class="item-info">

                    <strong>${p.nome}</strong>

                    <div class="item-detalhes">
                        <span>
                            Estoque:
                            <b>${p.quantidade} ${p.unidade}</b>
                        </span>

                        <span>
                            Mínimo:
                            <b>${p.estoque_minimo} ${p.unidade}</b>
                        </span>
                    </div>

                    <div class="barra-estoque">

                        <div
                            class="barra-estoque-preenchida"
                            style="width: ${Math.min(percentual, 100)}%">
                        </div>

                    </div>

                </div>

                <div class="item-acao">

                    <button
                        class="btn-repor"
                        onclick="reporProduto('${p.id}')"
                        title="Registrar entrada">

                        📥 Repor

                    </button>

                </div>

            </div>
        `;

    }).join('');

    // Avisar se existem mais produtos além dos 5 mostrados
    if (produtos.length > 5) {

        lista.innerHTML += `
            <button
                class="btn-ver-todos"
                onclick="renderEstoque()">

                Ver todos os ${produtos.length} produtos →

            </button>
        `;

    }
}

// ============================================
// LISTA DE PRODUTOS SEM ESTOQUE
// ============================================

async function preencherListaCritica() {

    const lista = document.getElementById('lista-critica');

    if (!lista) return;

    const produtos = (await DB.listarProdutos()).filter(
        p => p.quantidade <= 0
    );

    // Nenhum produto sem estoque
    if (produtos.length === 0) {

        lista.innerHTML = `
            <div class="lista-vazia">
                <span class="lista-vazia-icone">📦</span>

                <div>
                    <strong>Nenhum produto zerado</strong>

                    <p>
                        Todos os produtos possuem estoque.
                    </p>
                </div>
            </div>
        `;

        return;
    }

    // Mostrar no máximo 5 produtos
    const produtosExibidos = produtos.slice(0, 5);

    lista.innerHTML = produtosExibidos.map(p => {

        return `
            <div class="item-lista item-critico">

                <div class="item-lista-icone">
                    🚨
                </div>

                <div class="item-info">

                    <strong>${p.nome}</strong>

                    <div class="item-detalhes">

                        <span>
                            Categoria:
                            <b>${p.categoria}</b>
                        </span>

                        <span>
                            Estoque:
                            <b class="estoque-zero">0 ${p.unidade}</b>
                        </span>

                    </div>

                </div>

                <div class="item-acao">

                    <button

                        class="btn-repor btn-repor-critico"
                        onclick="reporProduto('${p.id}')"
                        title="Registrar entrada">

                        📥 Repor

                    </button>

                </div>

            </div>
        `;

    }).join('');

    // Avisar se existem mais produtos
    if (produtos.length > 5) {

        lista.innerHTML += `
            <button
                class="btn-ver-todos"
                onclick="renderEstoque()">

                Ver todos os ${produtos.length} produtos →

            </button>
        `;

    }
}

// ============================================
// REPOR PRODUTO PELO DASHBOARD
// ============================================

function reporProduto(produtoId) {
    renderEntrada(produtoId);
}

// Abrir tela de alterar senha
function abrirAlterarSenha() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>

        <div class="container container-com-voltar">
            <h1 class="titulo">Alterar Senha</h1>
            <p class="subtitulo">Atualize sua senha de acesso</p>

            <div id="mensagem-senha"></div>

            <form id="form-alterar-senha" class="formulario" style="max-width: 500px; margin: 30px auto;">
                <div class="campo">
                    <label>Senha Atual *</label>
                    <input type="password" id="senha-atual" placeholder="Digite sua senha atual" required autofocus>
                </div>

                <div class="campo">
                    <label>Nova Senha *</label>
                    <input type="password" id="senha-nova" placeholder="Digite a nova senha" required>
                </div>

                <div class="campo">
                    <label>Confirmar Nova Senha *</label>
                    <input type="password" id="senha-confirma" placeholder="Confirme a nova senha" required>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; font-size: 13px; color: #666;">
                    <p><strong>Requisitos para a senha:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Mínimo de 6 caracteres</li>
                        <li>Recomenda-se usar letras, números e símbolos</li>
                    </ul>
                </div>

                <div class="botoes">
                    <button type="submit" class="btn btn-primario">✓ Alterar Senha</button>
                    <button type="button" class="btn btn-secundario" onclick="renderMenuPrincipal()">← Cancelar</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('form-alterar-senha').addEventListener('submit', handleAlterarSenha);
}

// Alterar senha
async function handleAlterarSenha(e) {
    e.preventDefault();

    const senhaAtual = document.getElementById('senha-atual').value;
    const senhaNova = document.getElementById('senha-nova').value;
    const senhaConfirma = document.getElementById('senha-confirma').value;
    const btnAlterar = e.target.querySelector('button[type="submit"]');

    // Validações
    if (senhaNova.length < 6) {
        mostrarMensagem('mensagem-senha', 'A nova senha deve ter pelo menos 6 caracteres.', 'erro');
        return;
    }

    if (senhaNova !== senhaConfirma) {
        mostrarMensagem('mensagem-senha', 'As senhas não coincidem.', 'erro');
        return;
    }

    if (senhaAtual === senhaNova) {
        mostrarMensagem('mensagem-senha', 'A nova senha deve ser diferente da atual.', 'erro');
        return;
    }

    btnAlterar.disabled = true;
    btnAlterar.textContent = 'Alterando...';

    try {
        await DB.alterarSenha(usuarioLogado.id, senhaAtual, senhaNova);
        mostrarMensagem('mensagem-senha', '✓ Senha alterada com sucesso!', 'sucesso');

        setTimeout(() => {
            renderMenuPrincipal();
        }, 1500);
    } catch (error) {
        mostrarMensagem('mensagem-senha', error.message || 'Erro ao alterar senha.', 'erro');
        btnAlterar.disabled = false;
        btnAlterar.textContent = '✓ Alterar Senha';
    }
}

// Abrir página de Admin
async function abrirPaginaAdmin() {

    if (!usuarioLogado || usuarioLogado.nivel !== 'admin') {
        alert('Você não tem permissão para acessar o painel administrativo.');
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>

        <div class="container container-com-voltar">
            <h1 class="titulo">Painel de Administração</h1>
            <p class="subtitulo">Gerenciar usuários do sistema</p>

            <div id="mensagem-admin"></div>

            <div class="admin-tabs">
                <button class="tab-btn tab-ativo" onclick="mostrarAbaUsers()">Usuários</button>
                <button class="tab-btn" onclick="mostrarAbaNovoUser()">Novo Usuário</button>
            </div>

            <div id="aba-users" class="tab-conteudo">
                <div class="admin-tabela-container">
                    <table class="tabela">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Nome</th>
                                <th>Criado em</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-usuarios">
                            <tr>
                                <td colspan="5" class="loading">Carregando usuários...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="aba-novo-user" class="tab-conteudo oculto">
                <form id="form-novo-usuario" class="formulario" style="max-width: 500px; margin: 20px auto;">
                    <div class="campo">
                        <label>Usuário *</label>
                        <input type="text" id="novo-usuario" placeholder="Nome de usuário" required autofocus>
                    </div>

                    <div class="campo">
                        <label>Nome Completo *</label>
                        <input type="text" id="novo-nome" placeholder="Nome da pessoa" required>
                    </div>

                    <div class="campo">
                        <label>Senha *</label>
                        <input type="password" id="nova-senha" placeholder="Senha inicial" required>
                    </div>

                    <div class="campo">
                        <label>Confirmar Senha *</label>
                        <input type="password" id="nova-senha-confirma" placeholder="Confirme a senha" required>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; font-size: 13px; color: #666;">
                        <p><strong>Requisitos:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Mínimo 6 caracteres</li>
                            <li>Usuário deve ser único</li>
                            <li>Nome para identificar a pessoa</li>
                        </ul>
                    </div>

                    <div class="botoes">
                        <button type="submit" class="btn btn-primario">✓ Criar Usuário</button>
                        <button type="button" class="btn btn-secundario" onclick="limparFormNovoUser()">🗑️ Limpar</button>
                    </div>
                </form>
            </div>

            <div class="backup-secao">
                <h3>💾 Backup dos dados</h3>
                <p>Baixe uma cópia de tudo (usuários, produtos, entradas e saídas) ou restaure a partir de um arquivo.</p>
                <p id="info-ultimo-backup" class="backup-info"></p>

                <div class="botoes">
                    <button type="button" class="btn btn-primario" onclick="baixarBackup()">⬇️ Baixar backup</button>
                    <button type="button" class="btn btn-secundario" onclick="escolherArquivoBackup()">⬆️ Restaurar backup</button>
                </div>

                <input type="file" id="arquivo-backup" accept=".json,application/json" class="oculto" onchange="restaurarBackup(event)">
            </div>
        </div>
    `;

    carregarListaUsuarios();
    atualizarInfoBackup();
    document.getElementById('form-novo-usuario').addEventListener('submit', handleNovoUsuario);
}

// Mostrar aba de usuários
function mostrarAbaUsers() {
    document.getElementById('aba-users').classList.remove('oculto');
    document.getElementById('aba-novo-user').classList.add('oculto');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-ativo');
    });
    document.querySelectorAll('.tab-btn')[0].classList.add('tab-ativo');

    carregarListaUsuarios();
}

// Mostrar aba de novo usuário
function mostrarAbaNovoUser() {
    document.getElementById('aba-users').classList.add('oculto');
    document.getElementById('aba-novo-user').classList.remove('oculto');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-ativo');
    });
    document.querySelectorAll('.tab-btn')[1].classList.add('tab-ativo');
}

// Carregar lista de usuários
async function carregarListaUsuarios() {
    try {
        const usuarios = await DB.listarUsuarios();
        const tbody = document.getElementById('tbody-usuarios');

        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                        Nenhum usuário cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = usuarios.map(usuario => {
            const dataCriacao = new Date(usuario.criado_em).toLocaleDateString('pt-BR');
            const statusClasse = usuario.ativo ? 'status-ok' : 'status-critico';
            const statusTexto = usuario.ativo ? 'Ativo' : 'Inativo';

            return `
                <tr>
                    <td><strong>@${usuario.usuario}</strong></td>
                    <td>${usuario.nome}</td>
                    <td>${dataCriacao}</td>
                    <td><span class="status ${statusClasse}">${statusTexto}</span></td>
                    <td>
                        <div class="acoes">
                            ${usuario.ativo ?
                                `<button class="btn-icone btn-perigo" onclick="desativarUsuarioConfirm('${usuario.id}', '${usuario.nome.replace(/'/g, "\\'")}')">🔒 Desativar</button>` :
                                `<button class="btn-icone btn-sucesso" onclick="ativarUsuario('${usuario.id}')">🔓 Ativar</button>`
                            }
                            <button class="btn-icone btn-secundario" onclick="resetarSenhaUser('${usuario.id}', '${usuario.nome.replace(/'/g, "\\'")}')">🔑 Reset Senha</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarMensagem('mensagem-admin', 'Erro ao carregar lista de usuários.', 'erro');
    }
}

// Criar novo usuário
async function handleNovoUsuario(e) {
    e.preventDefault();

    const novoUsuario = document.getElementById('novo-usuario').value.trim();
    const novoNome = document.getElementById('novo-nome').value.trim();
    const novaSenha = document.getElementById('nova-senha').value;
    const novaSenhaConfirma = document.getElementById('nova-senha-confirma').value;
    const btnCriar = e.target.querySelector('button[type="submit"]');

    // Validações
    if (novoUsuario.length < 3) {
        mostrarMensagem('mensagem-admin', 'O usuário deve ter pelo menos 3 caracteres.', 'erro');
        return;
    }

    if (novaSenha.length < 6) {
        mostrarMensagem('mensagem-admin', 'A senha deve ter pelo menos 6 caracteres.', 'erro');
        return;
    }

    if (novaSenha !== novaSenhaConfirma) {
        mostrarMensagem('mensagem-admin', 'As senhas não coincidem.', 'erro');
        return;
    }

    btnCriar.disabled = true;
    btnCriar.textContent = 'Criando...';

    try {
        await DB.criarUsuario(novoUsuario, novaSenha, novoNome);
        mostrarMensagem('mensagem-admin', `✓ Usuário ${novoUsuario} criado com sucesso!`, 'sucesso');
        limparFormNovoUser();
        carregarListaUsuarios();
        mostrarAbaUsers();
    } catch (error) {
        mostrarMensagem('mensagem-admin', error.message || 'Erro ao criar usuário.', 'erro');
    } finally {
        btnCriar.disabled = false;
        btnCriar.textContent = '✓ Criar Usuário';
    }
}

// Limpar formulário de novo usuário
function limparFormNovoUser() {
    document.getElementById('novo-usuario').value = '';
    document.getElementById('novo-nome').value = '';
    document.getElementById('nova-senha').value = '';
    document.getElementById('nova-senha-confirma').value = '';
}

// Desativar usuário com confirmação (modal personalizado)
async function desativarUsuarioConfirm(id, nome) {
    if (id === usuarioLogado.id) {
        alert('Você não pode desativar sua própria conta!');
        return;
    }

    const ok = await confirmarModal({
        titulo: '🔒 Desativar usuário?',
        html: `<p>Tem certeza que deseja desativar <strong>${nome}</strong>?</p>
               <p style="margin-top:8px;">Ele não conseguirá fazer login.</p>`,
        textoOk: 'Desativar',
        perigo: true
    });
    if (ok) desativarUsuario(id, nome);
}

// Desativar usuário
async function desativarUsuario(id, nome) {
    try {
        await DB.desativarUsuario(id);
        mostrarMensagem('mensagem-admin', `✓ Usuário ${nome} desativado com sucesso!`, 'sucesso');
        carregarListaUsuarios();
    } catch (error) {
        mostrarMensagem('mensagem-admin', 'Erro ao desativar usuário.', 'erro');
    }
}

// Ativar usuário
async function ativarUsuario(id) {
    try {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.id === id);

        if (usuario) {
            usuario.ativo = true;
            usuarios[usuarios.indexOf(usuario)] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            mostrarMensagem('mensagem-admin', `✓ Usuário ativado com sucesso!`, 'sucesso');
            carregarListaUsuarios();
        }
    } catch (error) {
        mostrarMensagem('mensagem-admin', 'Erro ao ativar usuário.', 'erro');
    }
}

// Resetar senha do usuário (o prompt continua do navegador, pois precisa de um campo de texto)
async function resetarSenhaUser(id, nome) {
    const novaSenha = prompt(`Digite a nova senha para ${nome}:\n\n(Mínimo 6 caracteres)`);

    if (novaSenha === null) return;

    if (novaSenha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    const ok = await confirmarModal({
        titulo: '🔑 Alterar senha?',
        html: `<p>Confirma a alteração de senha de <strong>${nome}</strong>?</p>`,
        textoOk: 'Confirmar'
    });
    if (ok) executarResetSenha(id, novaSenha, nome);
}

// Executar reset de senha
async function executarResetSenha(id, novaSenha, nome) {
    try {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.id === id);

        if (usuario) {
            const senhaHash = btoa(novaSenha + 'salt_controle_estoque');
            usuario.senha = senhaHash;
            usuario.tentativas_falhas = 0;
            usuario.bloqueado_ate = null;
            usuarios[usuarios.indexOf(usuario)] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            mostrarMensagem('mensagem-admin', `✓ Senha de ${nome} resetada com sucesso!`, 'sucesso');
        }
    } catch (error) {
        mostrarMensagem('mensagem-admin', 'Erro ao resetar senha.', 'erro');
    }
}

// Mostrar mensagens
function mostrarMensagem(elementoId, texto, tipo) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.innerHTML = `<div class="mensagem mensagem-${tipo}">${texto}</div>`;

        setTimeout(() => {
            elemento.innerHTML = '';
        }, 5000);
    }
}

// Iniciar app
window.addEventListener('DOMContentLoaded', () => {
    const usuarioLembrado = sessionStorage.getItem('usuario_lembrado');
    if (usuarioLembrado) {
        usuarioLogado = JSON.parse(usuarioLembrado);
        renderMenuPrincipal();
    } else {
        renderLogin();
    }
});