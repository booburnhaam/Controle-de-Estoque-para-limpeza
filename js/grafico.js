// GRÁFICO DE STATUS DO ESTOQUE (rosca em SVG)

function desenharGraficoStatus(ok, baixo, critico) {
    const el = document.getElementById('grafico-status');
    if (!el) return;

    const total = ok + baixo + critico;

    const dados = [
        { nome: 'Estoque OK',    valor: ok,      cor: '#2ecc71' },
        { nome: 'Estoque baixo', valor: baixo,   cor: '#f39c12' },
        { nome: 'Sem estoque',   valor: critico, cor: '#e74c3c' }
    ];

    let pedacos = '';
    if (total > 0) {
        let deslocamento = 25;
        dados.forEach(d => {
            if (d.valor === 0) return;
            const pct = (d.valor / total) * 100;
            pedacos += `
                <circle cx="21" cy="21" r="15.9155" fill="none"
                        stroke="${d.cor}" stroke-width="6"
                        stroke-dasharray="${pct} ${100 - pct}"
                        stroke-dashoffset="${deslocamento}">
                    <title>${d.nome}: ${d.valor}</title>
                </circle>`;
            deslocamento -= pct;
        });
    }

    const legenda = dados.map(d => {
        const pct = total > 0 ? Math.round((d.valor / total) * 100) : 0;
        return `
            <div class="grafico-legenda-item">
                <span class="grafico-cor" style="background:${d.cor}"></span>
                <span class="grafico-nome">${d.nome}</span>
                <strong>${d.valor}</strong>
                <small>(${pct}%)</small>
            </div>`;
    }).join('');

    el.innerHTML = `
        <div class="grafico-rosca" role="img"
             aria-label="Gráfico de status: ${ok} OK, ${baixo} baixo, ${critico} sem estoque">
            <svg viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9155" fill="none"
                        stroke="var(--border-color, #e0e0e0)" stroke-width="6"></circle>
                ${pedacos}
            </svg>
            <div class="grafico-centro">
                <strong>${total}</strong>
                <small>${total === 1 ? 'produto' : 'produtos'}</small>
            </div>
        </div>

        <div class="grafico-legenda">
            ${legenda}
            ${total === 0 ? '<p class="grafico-vazio">Cadastre produtos para ver o gráfico.</p>' : ''}
        </div>
    `;
}