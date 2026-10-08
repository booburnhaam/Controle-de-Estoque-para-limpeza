function unidadeAceitaDecimal(unidade) {
    return unidade === 'Litros' || unidade === 'Quilos';
}


function converterQuantidade(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return 0;
    }

    const numero = parseFloat(String(valor).replace(',', '.'));

    return Number.isFinite(numero) ? numero : 0;
}


function quantidadeValida(quantidade, unidade) {
    const numero = converterQuantidade(quantidade);

    if (unidadeAceitaDecimal(unidade)) {
        return numero >= 0;
    }

    return Number.isInteger(numero) && numero >= 0;
}

async function renderEntrada(produtoId = null) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>

        <div class="container container-com-voltar">
            <h1 class="titulo">Entrada de Materiais</h1>
            <p class="subtitulo">Registre a chegada de novos materiais no estoque</p>

            <div id="mensagem-entrada"></div>

            <form id="form-entrada" class="formulario">
                <div class="campo">
                    <label>Produto *</label>
                    <select id="produto-entrada" required>
                        <option value="">Carregando produtos...</option>
                    </select>
                </div>

                <div class="campo">
                    <label>Quantidade *</label>
                    <input type="number" id="quantidade-entrada"
                    placeholder="Quantidade recebida"
                    step="1" min="0.01" required>
                </div>

                <div class="campo">
                    <label>Data da Entrada *</label>
                    <input type="date" id="data-entrada" required>
                </div>

                <div class="campo">
                    <label>Fornecedor</label>
                    <input type="text" id="fornecedor" placeholder="Nome do fornecedor (opcional)">
                </div>

                <div class="campo">
                    <label>Responsável</label>
                    <input type="text" id="responsavel-entrada" value="${usuarioLogado.nome}" disabled style="background: #f5f5f5;">
                </div>

                <div class="campo">
                    <label>Observações</label>
                    <textarea id="observacoes-entrada" placeholder="Informações adicionais (opcional)"></textarea>
                </div>

                <div class="botoes">
                    <button type="submit" class="btn btn-primario">✓ Registrar Entrada</button>
                </div>
            </form>

            <div class="historico">
                <h3>📋 Últimas 5 Entradas</h3>
                <div id="historico-entradas">Carregando...</div>
            </div>
        </div>
    `;

    document.getElementById('data-entrada').valueAsDate = new Date();

    await carregarProdutosEntrada();

    document.getElementById('produto-entrada')
    .addEventListener('change', ajustarCampoQuantidadeEntrada);

    if (produtoId !== null) {
        const select = document.getElementById('produto-entrada');

        if (select) {
            select.value = produtoId;
        }
    }

    carregarHistoricoEntradas();

    document.getElementById('form-entrada').addEventListener('submit', handleEntrada);
}

function ajustarCampoQuantidadeEntrada() {
    const select = document.getElementById('produto-entrada');
    const input = document.getElementById('quantidade-entrada');

    if (!select || !input || !select.value) {
        return;
    }

    const option = select.options[select.selectedIndex];
    const unidade = option.dataset.unidade;

    if (unidadeAceitaDecimal(unidade)) {
        input.step = '0.01';
        input.min = '0.01';
        input.placeholder = 'Ex: 3,5';
    } else {
        input.step = '1';
        input.min = '1';
        input.placeholder = 'Ex: 10';
    }

    input.value = '';
}

async function carregarProdutosEntrada() {
    try {
        const produtos = await DB.listarProdutos();
        const select = document.getElementById('produto-entrada');
        select.innerHTML = '<option value="">Selecione o produto</option>';

        produtos.forEach(produto => {
            select.innerHTML += `
                <option value="${produto.id}" data-nome="${produto.nome}" data-unidade="${produto.unidade}" data-quantidade="${produto.quantidade}">
                    ${produto.nome} - Atual: ${produto.quantidade} ${produto.unidade}
                </option>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

async function carregarHistoricoEntradas() {
    try {
        const entradas = await DB.listarEntradas(5);
        const historico = document.getElementById('historico-entradas');

        if (entradas.length === 0) {
            historico.innerHTML = '<p style="color: #999; text-align: center;">Nenhuma entrada registrada ainda.</p>';
            return;
        }

        historico.innerHTML = entradas.map(entrada => `
            <div class="historico-item">
                <strong>${entrada.produtos?.nome || 'Produto não encontrado'}</strong> - ${entrada.quantidade} unidades<br>
                <small>
                    📅 ${new Date(entrada.data_entrada).toLocaleDateString('pt-BR')} |
                    👤 ${entrada.responsavel}
                    ${entrada.fornecedor ? ` | 🏪 ${entrada.fornecedor}` : ''}
                </small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

async function handleEntrada(e) {
    e.preventDefault();

    const btnRegistrar = e.target.querySelector('button[type="submit"]');
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = 'Registrando...';

    try {
        const produtoId = document.getElementById('produto-entrada').value;
        const quantidade = parseFloat(document.getElementById('quantidade-entrada').value);
        const select = document.getElementById('produto-entrada');
        const option = select.options[select.selectedIndex];
        const quantidadeAtual = parseFloat(option.dataset.quantidade);
        const unidade = option.dataset.unidade;
        if (!quantidadeValida(quantidade, unidade)) {
            mostrarMensagem(
                'mensagem-entrada',
                `✗ A quantidade informada não é válida para a unidade ${unidade}.`,
                'erro'
            );

            btnRegistrar.disabled = false;
            btnRegistrar.textContent = '✓ Registrar Entrada';
            return;
        }
        const nomeProduto = option.dataset.nome;

        await DB.inserirEntrada({
            produto_id: produtoId,
            quantidade: quantidade,
            data_entrada: document.getElementById('data-entrada').value,
            fornecedor: document.getElementById('fornecedor').value,
            responsavel: usuarioLogado.nome,
            observacoes: document.getElementById('observacoes-entrada').value
        });

        const novaQuantidade = quantidadeAtual + quantidade;
        await DB.atualizarProduto(produtoId, { quantidade: novaQuantidade });

        mostrarMensagem('mensagem-entrada',
            `✓ Entrada registrada! Novo estoque de ${nomeProduto}: ${novaQuantidade} ${unidade}`,
            'sucesso');

        document.getElementById('quantidade-entrada').value = '';
        document.getElementById('fornecedor').value = '';
        document.getElementById('observacoes-entrada').value = '';

        carregarProdutosEntrada();
        carregarHistoricoEntradas();
    } catch (error) {
        mostrarMensagem('mensagem-entrada', '✗ Erro ao registrar entrada. Tente novamente.', 'erro');
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = '✓ Registrar Entrada';
    }
}

function renderSaida() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>

        <div class="container container-com-voltar">
            <h1 class="titulo">Saída de Materiais</h1>
            <p class="subtitulo">Registre a retirada de materiais do estoque</p>

            <div id="mensagem-saida"></div>

            <form id="form-saida" class="formulario">
                <div class="campo">
                    <label>Produto *</label>
                    <select id="produto-saida" required>
                        <option value="">Carregando produtos...</option>
                    </select>
                </div>

                <div class="campo">
                    <label>Quantidade *</label>
                    <input type="number" id="quantidade-saida"
                    placeholder="Quantidade"
                    step="1" min="1" required>
                    </div>

                <div class="campo">
                    <label>Data da Saída *</label>
                    <input type="date" id="data-saida" required>
                </div>

                <div class="campo">
                    <label>Local de Uso</label>
                    <input type="text" id="local-uso" placeholder="Ex: Banheiro masculino, Sala 5, Cozinha">
                </div>

                <div class="campo">
                    <label>Responsável</label>
                    <input type="text" id="responsavel-saida" value="${usuarioLogado.nome}" disabled style="background: #f5f5f5;">
                </div>

                <div class="campo">
                    <label>Observações</label>
                    <textarea id="observacoes-saida" placeholder="Informações adicionais (opcional)"></textarea>
                </div>

                <div class="botoes">
                    <button type="submit" class="btn btn-primario">✓ Registrar Saída</button>
                </div>
            </form>

            <div class="historico">
                <h3>📋 Últimas 5 Saídas</h3>
                <div id="historico-saidas">Carregando...</div>
            </div>
        </div>
    `;

    document.getElementById('data-saida').valueAsDate = new Date();

    carregarProdutosSaida();
    document.getElementById('produto-saida')
        .addEventListener('change', ajustarCampoQuantidadeSaida);

    carregarHistoricoSaidas();
    document.getElementById('form-saida').addEventListener('submit', handleSaida);
}

function ajustarCampoQuantidadeSaida() {
    const select = document.getElementById('produto-saida');
    const input = document.getElementById('quantidade-saida');

    if (!select || !input || !select.value) {
        return;
    }

    const option = select.options[select.selectedIndex];
    const unidade = option.dataset.unidade;

    if (unidadeAceitaDecimal(unidade)) {
        input.step = '0.01';
        input.min = '0.01';
        input.placeholder = 'Ex: 3,5';
    } else {
        input.step = '1';
        input.min = '1';
        input.placeholder = 'Ex: 10';
    }

    input.value = '';
}

async function carregarProdutosSaida() {
    try {
        const produtos = await DB.listarProdutos();
        const select = document.getElementById('produto-saida');
        select.innerHTML = '<option value="">Selecione o produto</option>';

        produtos.forEach(produto => {
            select.innerHTML += `
                <option value="${produto.id}"
                        data-nome="${produto.nome}"
                        data-unidade="${produto.unidade}"
                        data-quantidade="${produto.quantidade}"
                        data-minimo="${produto.estoque_minimo}">
                    ${produto.nome} - Disponível: ${produto.quantidade} ${produto.unidade}
                </option>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

async function carregarHistoricoSaidas() {
    try {
        const saidas = await DB.listarSaidas(5);
        const historico = document.getElementById('historico-saidas');

        if (saidas.length === 0) {
            historico.innerHTML = '<p style="color: #999; text-align: center;">Nenhuma saída registrada ainda.</p>';
            return;
        }

        historico.innerHTML = saidas.map(saida => `
            <div class="historico-item">
                <strong>${saida.produtos?.nome || 'Produto não encontrado'}</strong> - ${saida.quantidade} unidades<br>
                <small>
                    📅 ${new Date(saida.data_saida).toLocaleDateString('pt-BR')} |
                    👤 ${saida.responsavel}
                    ${saida.local_uso ? ` | 📍 ${saida.local_uso}` : ''}
                </small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

async function handleSaida(e) {
    e.preventDefault();

    const btnRegistrar = e.target.querySelector('button[type="submit"]');
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = 'Registrando...';

    try {
        const produtoId = document.getElementById('produto-saida').value;
        const quantidade = parseFloat(document.getElementById('quantidade-saida').value);
        const select = document.getElementById('produto-saida');
        const option = select.options[select.selectedIndex];
        const quantidadeAtual = parseFloat(option.dataset.quantidade);
        const estoqueMinimo = parseFloat(option.dataset.minimo);
        const unidade = option.dataset.unidade;
        const nomeProduto = option.dataset.nome;

        if (!quantidadeValida(quantidade, unidade)) {
            mostrarMensagem(
                'mensagem-saida',
                `✗ A quantidade informada não é válida para a unidade ${unidade}.`,
                'erro'
            );

            btnRegistrar.disabled = false;
            btnRegistrar.textContent = '✓ Registrar Saída';
            return;
        }

        if (quantidadeAtual < quantidade) {
            mostrarMensagem('mensagem-saida',
                `⚠️ Estoque insuficiente! Disponível: ${quantidadeAtual} ${unidade}`,
                'erro');
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = '✓ Registrar Saída';
            return;
        }

        const responsavel = document.getElementById('responsavel-saida').value || usuarioLogado.nome;

        await DB.inserirSaida({
            produto_id: produtoId,
            quantidade: quantidade,
            data_saida: document.getElementById('data-saida').value,
            local_uso: document.getElementById('local-uso').value,
            responsavel: usuarioLogado.nome,
            observacoes: document.getElementById('observacoes-saida').value
        });

        const novaQuantidade = quantidadeAtual - quantidade;
        await DB.atualizarProduto(produtoId, { quantidade: novaQuantidade });

        let mensagemTexto = `✓ Saída registrada! Novo estoque de ${nomeProduto}: ${novaQuantidade} ${unidade}`;
        let mensagemTipo = 'sucesso';

        if (novaQuantidade <= 0) {
            mensagemTexto += `<br><strong>🚨 PRODUTO SEM ESTOQUE!</strong>`;
            mensagemTipo = 'erro';
        } else if (novaQuantidade <= estoqueMinimo) {
            mensagemTexto += `<br><strong>⚠️ ATENÇÃO: Estoque abaixo do mínimo!</strong>`;
            mensagemTipo = 'alerta';
        }

        mostrarMensagem('mensagem-saida', mensagemTexto, mensagemTipo);

        document.getElementById('quantidade-saida').value = '';
        document.getElementById('local-uso').value = '';
        document.getElementById('responsavel-saida').value = '';
        document.getElementById('observacoes-saida').value = '';

        carregarProdutosSaida();
        carregarHistoricoSaidas();
    } catch (error) {
        mostrarMensagem('mensagem-saida', '✗ Erro ao registrar saída. Tente novamente.', 'erro');
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = '✓ Registrar Saída';
    }
}
