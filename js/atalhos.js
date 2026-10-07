// ATALHOS DE TECLADO
// Ctrl+N = Novo produto | Ctrl+E = Estoque | Ctrl+R = Relatórios
// Ctrl+L = Sair | Ctrl+M = Menu | Esc = Voltar ao menu

document.addEventListener('keydown', function (e) {
    if (!e.key) return;

    const ctrl = e.ctrlKey || e.metaKey;
    const tecla = e.key.toLowerCase();

    if (typeof usuarioLogado === 'undefined' || !usuarioLogado) return;

    if (e.key === 'Escape') {
        const el = document.activeElement;
        if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
            el.blur();
            return;
        }
        renderMenuPrincipal();
        return;
    }

    if (!ctrl) return;

    switch (tecla) {
        case 'n': e.preventDefault(); renderCadastroProduto(); break;
        case 'r': e.preventDefault(); renderRelatorios(); break;
        case 'l': e.preventDefault(); logout(); break;
        case 'e': e.preventDefault(); renderEstoque(); break;
        case 'm': e.preventDefault(); renderMenuPrincipal(); break;
    }
});