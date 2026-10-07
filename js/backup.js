// BACKUP E RESTAURAÇÃO DE DADOS

function limparRelacao(item) {
    const { produtos, ...resto } = item;
    return resto;
}

function dataParaNomeArquivo() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
}

async function baixarBackup() {
    try {
        const backup = {
            versao: 1,
            gerado_em: new Date().toISOString(),
            gerado_por: usuarioLogado ? usuarioLogado.usuario : null,
            usuarios: JSON.parse(localStorage.getItem('usuarios')) || [],
            produtos: await DB.listarProdutos(),
            entradas: (await DB.listarEntradas()).map(limparRelacao),
            saidas: (await DB.listarSaidas()).map(limparRelacao)
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-estoque-${dataParaNomeArquivo()}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        localStorage.setItem('ultimoBackup', new Date().toISOString());
        atualizarInfoBackup();

        mostrarMensagem('mensagem-admin',
            `✓ Backup baixado! (${backup.produtos.length} produtos, ${backup.entradas.length} entradas, ${backup.saidas.length} saídas)`,
            'sucesso');
    } catch (error) {
        console.error('Erro ao gerar backup:', error);
        mostrarMensagem('mensagem-admin', 'Erro ao gerar o backup.', 'erro');
    }
}

function escolherArquivoBackup() {
    document.getElementById('arquivo-backup').click();
}

async function restaurarBackup(event) {
    const arquivo = event.target.files[0];
    event.target.value = '';
    if (!arquivo) return;

    try {
        const backup = JSON.parse(await arquivo.text());

        if (!backup || !Array.isArray(backup.produtos) || !Array.isArray(backup.entradas) ||
            !Array.isArray(backup.saidas) || !Array.isArray(backup.usuarios)) {
            mostrarMensagem('mensagem-admin', 'Esse arquivo não é um backup válido.', 'erro');
            return;
        }

                const ok = await confirmarModal({
            titulo: '♻️ Restaurar backup?',
            html: reciboBackup(backup),
            textoOk: 'Restaurar',
            textoCancelar: 'Cancelar'
        });
        if (!ok) return;

        const atuais = JSON.parse(localStorage.getItem('usuarios')) || [];
        backup.usuarios.forEach(u => {
            const i = atuais.findIndex(x => x.id === u.id);
            if (i >= 0) atuais[i] = u;
            else atuais.push(u);
        });
        localStorage.setItem('usuarios', JSON.stringify(atuais));

        await restaurarTabela('produtos', backup.produtos);
        await restaurarTabela('entradas', backup.entradas);
        await restaurarTabela('saidas', backup.saidas);

        mostrarMensagem('mensagem-admin', '✓ Backup restaurado com sucesso!', 'sucesso');
        carregarListaUsuarios();
    } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        mostrarMensagem('mensagem-admin', 'Erro ao restaurar o backup. Veja o console (F12).', 'erro');
    }
}

async function restaurarTabela(nome, linhas) {
    if (linhas.length === 0) return;
    if (typeof sb === 'undefined') throw new Error('Supabase (sb) não está configurado.');

    const { error } = await sb.from(nome).upsert(linhas);
    if (error) throw error;
}

function atualizarInfoBackup() {
    const el = document.getElementById('info-ultimo-backup');
    if (!el) return;

    const ultimo = localStorage.getItem('ultimoBackup');
    el.textContent = ultimo
        ? `Último backup: ${new Date(ultimo).toLocaleString('pt-BR')}`
        : 'Nenhum backup feito ainda neste navegador.';
}

// ============================================
// MODAL PERSONALIZADO (substitui o confirm do navegador)
// ============================================

function confirmarModal({ titulo, html, textoOk = 'Confirmar', textoCancelar = 'Cancelar', perigo = false }) {
    return new Promise(resolve => {
        const fundo = document.createElement('div');
        fundo.className = 'modal-fundo';
        fundo.innerHTML = `
            <div class="modal-caixa" role="dialog" aria-modal="true">
                <h3 class="modal-titulo">${titulo}</h3>
                <div class="modal-corpo">${html}</div>
                <div class="modal-botoes">
                    <button type="button" class="btn btn-secundario" id="modal-cancelar">${textoCancelar}</button>
                    <button type="button" class="btn ${perigo ? 'btn-perigo' : 'btn-primario'}" id="modal-ok">${textoOk}</button>
                </div>
            </div>
        `;
        document.body.appendChild(fundo);

        const fechar = (resultado) => {
            document.removeEventListener('keydown', teclas, true);
            fundo.remove();
            resolve(resultado);
        };

        const teclas = (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); fechar(false); }
            if (e.key === 'Enter')  { e.preventDefault(); fechar(true); }
        };
        document.addEventListener('keydown', teclas, true);

        fundo.querySelector('#modal-ok').onclick = () => fechar(true);
        fundo.querySelector('#modal-cancelar').onclick = () => fechar(false);
        fundo.addEventListener('click', e => { if (e.target === fundo) fechar(false); });
        fundo.querySelector('#modal-ok').focus();
    });
}

// Modelo "recibo" do backup
function reciboBackup(backup) {
    const dataBackup = backup.gerado_em
        ? new Date(backup.gerado_em).toLocaleString('pt-BR')
        : 'Data desconhecida';

    const linha = (nome, qtd) => `
        <div class="recibo-linha">
            <span>${nome}</span>
            <span class="recibo-pontilhado"></span>
            <strong>${qtd}</strong>
        </div>`;

    const total = backup.usuarios.length + backup.produtos.length +
                  backup.entradas.length + backup.saidas.length;

    return `
        <div class="recibo">
            <div class="recibo-cabecalho">
                <strong>RESTAURAÇÃO DE BACKUP</strong>
                <small>Backup de ${dataBackup}</small>
                ${backup.gerado_por ? `<small>Gerado por @${backup.gerado_por}</small>` : ''}
            </div>
            <div class="recibo-itens">
                ${linha('Usuários', backup.usuarios.length)}
                ${linha('Produtos', backup.produtos.length)}
                ${linha('Entradas', backup.entradas.length)}
                ${linha('Saídas', backup.saidas.length)}
            </div>
            <div class="recibo-total">
                <span>TOTAL DE REGISTROS</span>
                <strong>${total}</strong>
            </div>
            <p class="recibo-aviso">
                Registros com o mesmo ID serão sobrescritos. Os outros são mantidos.
            </p>
        </div>`;
}