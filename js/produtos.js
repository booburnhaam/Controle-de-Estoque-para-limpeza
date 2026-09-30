function renderCadastroProduto() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>
        
        <div class="container container-com-voltar">
            <h1 class="titulo">Cadastro de Materiais</h1>
            <p class="subtitulo">Adicione um novo produto ao estoque</p>
            
            <div id="mensagem-cadastro"></div>
            
            <form id="form-cadastro" class="formulario">
                <div class="campo">
                    <label>Nome do Produto *</label>
                    <input type="text" id="nome" placeholder="Ex: Detergente, Sabão em pó" required autofocus>
                </div>
                
                <div class="campo">
                    <label>Categoria *</label>
                    <select id="categoria" required>
                        <option value="">Selecione uma categoria</option>
                        <option value="Limpeza">Limpeza</option>
                        <option value="Higiene">Higiene</option>
                        <option value="Descartáveis">Descartáveis</option>
                        <option value="Químicos">Químicos</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                
                <div class="campo">
                    <label>Quantidade Inicial *</label>
                    <input type="number" id="quantidade" placeholder="Ex: 10" step="0.01" min="0" required>
                </div>
                
                <div class="campo">
                    <label>Unidade de Medida *</label>
                    <select id="unidade" required>
                        <option value="">Selecione a unidade</option>
                        <option value="Unidades">Unidades</option>
                        <option value="Litros">Litros</option>
                        <option value="Quilos">Quilos</option>
                        <option value="Caixas">Caixas</option>
                        <option value="Pacotes">Pacotes</option>
                        <option value="Fardos">Fardos</option>
                    </select>
                </div>
                
                <div class="campo">
                    <label>Estoque Mínimo *</label>
                    <input type="number" id="estoque-minimo" placeholder="Ex: 5" step="0.01" min="0" required>
                </div>
                
                <div class="botoes">
                    <button type="submit" class="btn btn-primario">✓ Cadastrar</button>
                    <button type="button" class="btn btn-secundario" onclick="limparCadastroProduto()">🗑️ Limpar Campos</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('form-cadastro').addEventListener('submit', handleCadastroProduto);
}

async function handleCadastroProduto(e) {
    e.preventDefault();
    
    const btnCadastrar = e.target.querySelector('button[type="submit"]');
    btnCadastrar.disabled = true;
    btnCadastrar.textContent = 'Cadastrando...';
    
    try {
        await DB.inserirProduto({
            nome: document.getElementById('nome').value,
            categoria: document.getElementById('categoria').value,
            quantidade: parseFloat(document.getElementById('quantidade').value),
            unidade: document.getElementById('unidade').value,
            estoque_minimo: parseFloat(document.getElementById('estoque-minimo').value)
        });

        mostrarMensagem('mensagem-cadastro', '✓ Produto cadastrado com sucesso!', 'sucesso');
        limparCadastroProduto();
    } catch (error) {
        mostrarMensagem('mensagem-cadastro', '✗ Erro ao cadastrar produto. Tente novamente.', 'erro');
    } finally {
        btnCadastrar.disabled = false;
        btnCadastrar.textContent = '✓ Cadastrar';
    }
}

function limparCadastroProduto() {
    document.getElementById('nome').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('unidade').value = '';
    document.getElementById('estoque-minimo').value = '';
    document.getElementById('nome').focus();
}

function renderEstoque() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>
        
        <div class="container container-com-voltar">
            <h1 class="titulo">Controle de Estoque</h1>
            <p class="subtitulo">Visualize e gerencie todos os materiais cadastrados</p>
            
            <div id="mensagem-estoque"></div>
            
            <div class="pesquisa">
                <input type="text" id="pesquisa" placeholder="🔍 Pesquisar por nome ou código..." onkeyup="filtrarEstoque()">
            </div>
            
            <div class="filtros">
                <div class="campo">
                    <label>Filtrar por categoria:</label>
                    <select id="filtro-categoria" onchange="filtrarEstoque()">
                        <option value="">Todas as categorias</option>
                    </select>
                </div>
            </div>
            
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Quantidade</th>
                            <th>Unidade</th>
                            <th>Estoque Mín.</th>
                            <th>Situação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-estoque">
                        <tr>
                            <td colspan="8" class="loading">Carregando produtos...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="botoes">
                <button class="btn btn-primario" onclick="carregarEstoque()">🔄 Atualizar</button>
            </div>
        </div>
    `;

    carregarEstoque();
}

let todosOsProdutos = [];

async function carregarEstoque() {
    try {
        todosOsProdutos = await DB.listarProdutos();
        
        const categorias = [...new Set(todosOsProdutos.map(p => p.categoria))];
        const selectCategorias = document.getElementById('filtro-categoria');
        if (selectCategorias) {
            selectCategorias.innerHTML = '<option value="">Todas as categorias</option>';
            categorias.forEach(cat => {
                selectCategorias.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
        
        exibirProdutos(todosOsProdutos);
    } catch (error) {
        mostrarMensagem('mensagem-estoque', 'Erro ao carregar produtos.', 'erro');
    }
}

function exibirProdutos(produtos) {
    const tbody = document.getElementById('tbody-estoque');
    
    if (produtos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    📦 Nenhum produto cadastrado ainda
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => {
        let statusClasse = 'status-ok';
        let statusTexto = 'OK';
        
        if (produto.quantidade <= 0) {
            statusClasse = 'status-critico';
            statusTexto = 'Sem estoque';
        } else if (produto.quantidade <= produto.estoque_minimo) {
            statusClasse = 'status-baixo';
            statusTexto = 'Baixo';
        }
        
        return `
            <tr>
                <td>${produto.codigo}</td>
                <td>${produto.nome}</td>
                <td>${produto.categoria}</td>
                <td>${produto.quantidade}</td>
                <td>${produto.unidade}</td>
                <td>${produto.estoque_minimo}</td>
                <td><span class="status ${statusClasse}">${statusTexto}</span></td>
                <td>
                    <div class="acoes">
                        <button class="btn-icone btn-excluir" onclick="excluirProduto('${produto.id}', '${produto.nome.replace(/'/g, "\\'")}')">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarEstoque() {
    const pesquisa = document.getElementById('pesquisa').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    
    let produtosFiltrados = todosOsProdutos;
    
    if (pesquisa) {
        produtosFiltrados = produtosFiltrados.filter(p => 
            p.nome.toLowerCase().includes(pesquisa) ||
            p.codigo.toString().includes(pesquisa)
        );
    }
    
    if (categoria) {
        produtosFiltrados = produtosFiltrados.filter(p => p.categoria === categoria);
    }
    
    exibirProdutos(produtosFiltrados);
}

async function excluirProduto(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?\n\nEsta ação não pode ser desfeita!`)) {
        return;
    }
    
    try {
        await DB.excluirProduto(id);
        mostrarMensagem('mensagem-estoque', '✓ Produto excluído com sucesso!', 'sucesso');
        carregarEstoque();
    } catch (error) {
        mostrarMensagem('mensagem-estoque', '✗ Erro ao excluir produto.', 'erro');
    }
}