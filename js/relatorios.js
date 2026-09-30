// relatorios v2
function renderRelatorios() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <button class="btn-voltar-fixo" onclick="renderMenuPrincipal()">← Voltar ao Menu</button>

        <div class="container container-com-voltar">
            <h1 class="titulo">Relatórios</h1>
            <p class="subtitulo">Consulte informações e histórico do estoque</p>

            <div id="mensagem-relatorio"></div>

            <div class="formulario no-print">
                <div class="campo">
                    <label>Tipo de Relatório</label>
                    <select id="tipo-relatorio" onchange="atualizarFiltrosRelatorio()">
                        <option value="estoque">Estoque Atual</option>
                        <option value="baixo">Produtos com Estoque Baixo</option>
                        <option value="entradas">Histórico de Entradas</option>
                        <option value="saidas">Histórico de Saídas</option>
                    </select>
                </div>

                <div class="filtros" id="filtros-relatorio"></div>

                <div class="botoes">
                    <button type="button" class="btn btn-primario" onclick="gerarRelatorio()">🔍 Pesquisar</button>
                    <button type="button" class="btn btn-secundario" onclick="limparFiltrosRelatorio()">❌ Limpar Filtros</button>
                    <button type="button" class="btn btn-sucesso oculto" id="btn-imprimir" onclick="imprimirTabela()">🖨️ Imprimir</button>
                </div>
            </div>

            <div id="resultados-relatorio"></div>
        </div>
    `;

    atualizarFiltrosRelatorio();
}

async function atualizarFiltrosRelatorio() {
    const tipo = document.getElementById('tipo-relatorio').value;
    const filtrosDiv = document.getElementById('filtros-relatorio');

    try {
        const produtos = await DB.listarProdutos();
        const categorias = [...new Set(produtos.map(p => p.categoria))];

        if (tipo === 'estoque' || tipo === 'baixo') {
            filtrosDiv.innerHTML = `
                <div class="campo">
                    <label>Categoria</label>
                    <select id="filtro-categoria-rel">
                        <option value="">Todas as categorias</option>
                        ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
            `;
        } else {
            filtrosDiv.innerHTML = `
                <div class="campo">
                    <label>Produto Específico</label>
                    <select id="filtro-produto-rel">
                        <option value="">Todos os produtos</option>
                        ${produtos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                    </select>
                </div>

                <div class="campo">
                    <label>Data Início</label>
                    <input type="date" id="filtro-data-inicio">
                </div>

                <div class="campo">
                    <label>Data Fim</label>
                    <input type="date" id="filtro-data-fim">
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao atualizar filtros:', error);
    }
}

async function gerarRelatorio() {
    const tipo = document.getElementById('tipo-relatorio').value;
    const resultadosDiv = document.getElementById('resultados-relatorio');
    const btnImprimir = document.getElementById('btn-imprimir');

    resultadosDiv.innerHTML = '<div class="loading">Gerando relatório...</div>';
    btnImprimir.classList.add('oculto');

    try {
        let dados = [];

        if (tipo === 'estoque') dados = await gerarRelatorioEstoque();
        if (tipo === 'baixo') dados = await gerarRelatorioBaixo();
        if (tipo === 'entradas') dados = await gerarRelatorioEntradas();
        if (tipo === 'saidas') dados = await gerarRelatorioSaidas();

        if (dados.length === 0) {
            mostrarMensagem('mensagem-relatorio', 'Nenhum registro encontrado com os filtros selecionados.', 'alerta');
            resultadosDiv.innerHTML = '';
            return;
        }

        renderizarResultadosRelatorio(dados, tipo);
        btnImprimir.classList.remove('oculto');
    } catch (error) {
        mostrarMensagem('mensagem-relatorio', 'Erro ao gerar relatório. Tente novamente.', 'erro');
        resultadosDiv.innerHTML = '';
        console.error('Erro ao gerar relatório:', error);
    }
}

async function gerarRelatorioEstoque() {
    const categoria = document.getElementById('filtro-categoria-rel')?.value;
    return await DB.filtrarProdutos({ categoria: categoria || null });
}

async function gerarRelatorioBaixo() {
    const categoria = document.getElementById('filtro-categoria-rel')?.value;
    return await DB.filtrarProdutos({
        categoria: categoria || null,
        estoque_baixo: true
    });
}

async function gerarRelatorioEntradas() {
    return await DB.filtrarEntradas({
        produto_id: document.getElementById('filtro-produto-rel')?.value || null,
        data_inicio: document.getElementById('filtro-data-inicio')?.value || null,
        data_fim: document.getElementById('filtro-data-fim')?.value || null
    });
}

async function gerarRelatorioSaidas() {
    return await DB.filtrarSaidas({
        produto_id: document.getElementById('filtro-produto-rel')?.value || null,
        data_inicio: document.getElementById('filtro-data-inicio')?.value || null,
        data_fim: document.getElementById('filtro-data-fim')?.value || null
    });
}

function renderizarResultadosRelatorio(dados, tipo) {
    const resultadosDiv = document.getElementById('resultados-relatorio');
    const titulos = {
        estoque: 'Estoque Atual',
        baixo: 'Produtos com Estoque Baixo',
        entradas: 'Histórico de Entradas',
        saidas: 'Histórico de Saídas'
    };

    let cabecalho = '';
    let linhas = '';

    if (tipo === 'estoque' || tipo === 'baixo') {
        cabecalho = `
            <tr>
                <th>Código</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Unidade</th>
                <th>Estoque Mín.</th>
                <th>Status</th>
            </tr>
        `;

        linhas = dados.map(produto => {
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
                </tr>
            `;
        }).join('');
    } else if (tipo === 'entradas') {
        cabecalho = `
            <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Fornecedor</th>
                <th>Responsável</th>
                <th>Observações</th>
            </tr>
        `;

        linhas = dados.map(entrada => `
            <tr>
                <td>${new Date(entrada.data_entrada).toLocaleDateString('pt-BR')}</td>
                <td>${entrada.produtos?.nome || 'Produto não encontrado'}</td>
                <td>${entrada.quantidade} ${entrada.produtos?.unidade || ''}</td>
                <td>${entrada.fornecedor || '-'}</td>
                <td>${entrada.responsavel}</td>
                <td>${entrada.observacoes || '-'}</td>
            </tr>
        `).join('');
    } else {
        cabecalho = `
            <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Local</th>
                <th>Responsável</th>
                <th>Observações</th>
            </tr>
        `;

        linhas = dados.map(saida => `
            <tr>
                <td>${new Date(saida.data_saida).toLocaleDateString('pt-BR')}</td>
                <td>${saida.produtos?.nome || 'Produto não encontrado'}</td>
                <td>${saida.quantidade} ${saida.produtos?.unidade || ''}</td>
                <td>${saida.local_uso || '-'}</td>
                <td>${saida.responsavel}</td>
                <td>${saida.observacoes || '-'}</td>
            </tr>
        `).join('');
    }

    resultadosDiv.innerHTML = `
        <div id="area-impressao">
            <h3 id="titulo-impressao">${titulos[tipo]} — ${dados.length} registro(s)</h3>
            <table class="tabela" id="tabela-impressao">
                <thead>${cabecalho}</thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>
    `;
}

function limparFiltrosRelatorio() {
    document.getElementById('mensagem-relatorio').innerHTML = '';
    document.getElementById('resultados-relatorio').innerHTML = '';
    document.getElementById('btn-imprimir').classList.add('oculto');
    atualizarFiltrosRelatorio();
}

function imprimirTabela() {
    const tabela = document.getElementById('tabela-impressao');

    if (!tabela) {
        alert('Gere um relatório antes de imprimir.');
        return;
    }

    const dataHora = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const janela = window.open('', '_blank');

    janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório</title>
            <style>
                @page { 
                    margin: 15mm;
                }
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    color: #222;
                }
                .relatorio-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .relatorio-header h1 {
                    margin: 0 0 5px 0;
                    font-size: 18px;
                }
                .relatorio-header p {
                    margin: 0;
                    font-size: 12px;
                    color: #666;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 12px; 
                }
                th, td { 
                    border: 1px solid #ccc; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background: #333; 
                    color: white; 
                }
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .status-ok { 
                    color: #2e7d32; 
                    font-weight: bold; 
                }
                .status-baixo { 
                    color: #ef6c00; 
                    font-weight: bold; 
                }
                .status-critico { 
                    color: #c62828; 
                    font-weight: bold; 
                }
            </style>
        </head>
        <body>
            <div class="relatorio-header">
                <h1>Relatório</h1>
                <p>${dataHora}</p>
            </div>
            ${tabela.outerHTML}
        </body>
        </html>
    `);

    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 300);
}