// ============================================
// FUNÇÕES DE BANCO DE DADOS
// ============================================

const DB = {
    // USUÁRIOS
    async buscarUsuario(usuario, senha) {
        const { data, error } = await sb
            .from('usuarios')
            .select('*')
            .eq('usuario', usuario)
            .eq('senha', senha)
            .single();

        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }
        return data;
    },

    // PRODUTOS
    async listarProdutos() {
        const { data, error } = await sb
            .from('produtos')
            .select('*')
            .order('nome');

        if (error) {
            console.error('Erro ao listar produtos:', error);
            return [];
        }
        return data || [];
    },

    async buscarProdutoPorId(id) {
        const { data, error } = await sb
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
        return data;
    },

    async inserirProduto(produto) {
        const { data, error } = await sb
            .from('produtos')
            .insert([produto])
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir produto:', error);
            throw error;
        }
        return data;
    },

    async atualizarProduto(id, dados) {
        try {
        // Se estiver usando Supabase
        const { data, error } = await sb
            .from('produtos')
            .update(dados)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
    },

    async excluirProduto(id) {
        const { error } = await sb
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
        return true;
    },

    // ENTRADAS
    async listarEntradas(limite = null) {
        let query = sb
            .from('entradas')
            .select('*, produtos(nome, unidade)')
            .order('created_at', { ascending: false });

        if (limite) {
            query = query.limit(limite);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar entradas:', error);
            return [];
        }
        return data || [];
    },

    async inserirEntrada(entrada) {
        const { data, error } = await sb
            .from('entradas')
            .insert([entrada])
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir entrada:', error);
            throw error;
        }
        return data;
    },

    // SAÍDAS
    async listarSaidas(limite = null) {
        let query = sb
            .from('saidas')
            .select('*, produtos(nome, unidade)')
            .order('created_at', { ascending: false });

        if (limite) {
            query = query.limit(limite);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar saídas:', error);
            return [];
        }
        return data || [];
    },

    async inserirSaida(saida) {
        const { data, error } = await sb
            .from('saidas')
            .insert([saida])
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir saída:', error);
            throw error;
        }
        return data;
    },

    // RELATÓRIOS
    async filtrarEntradas(filtros = {}) {
        let query = sb
            .from('entradas')
            .select('*, produtos(nome, unidade)')
            .order('data_entrada', { ascending: false });

        if (filtros.produto_id) {
            query = query.eq('produto_id', filtros.produto_id);
        }
        if (filtros.data_inicio) {
            query = query.gte('data_entrada', filtros.data_inicio);
        }
        if (filtros.data_fim) {
            query = query.lte('data_entrada', filtros.data_fim);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao filtrar entradas:', error);
            return [];
        }
        return data || [];
    },

    async filtrarSaidas(filtros = {}) {
        let query = sb
            .from('saidas')
            .select('*, produtos(nome, unidade)')
            .order('data_saida', { ascending: false });

        if (filtros.produto_id) {
            query = query.eq('produto_id', filtros.produto_id);
        }
        if (filtros.data_inicio) {
            query = query.gte('data_saida', filtros.data_inicio);
        }
        if (filtros.data_fim) {
            query = query.lte('data_saida', filtros.data_fim);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao filtrar saídas:', error);
            return [];
        }
        return data || [];
    },

    async filtrarProdutos(filtros = {}) {
        let query = sb
            .from('produtos')
            .select('*')
            .order('nome');

        if (filtros.categoria) {
            query = query.eq('categoria', filtros.categoria);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao filtrar produtos:', error);
            return [];
        }

        let resultado = data || [];

        if (filtros.estoque_baixo) {
            resultado = resultado.filter(p => p.quantidade <= p.estoque_minimo || p.quantidade === 0);
        }

        return resultado;
    }
};
