// ============================================
// FUNÇÕES DE BANCO DE DADOS
// ============================================

const DB = {
    // Gerar ID único
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Inicializar banco local
    init() {
        if (!localStorage.getItem('usuarios')) {
            localStorage.setItem('usuarios', JSON.stringify([
                {
                    id: this.gerarId(),
                    usuario: 'admin',
                    senha: btoa('admin123' + 'salt_controle_estoque'),
                    nome: 'Administrador',
                    criado_em: new Date().toISOString(),
                    ativo: true,
                    tentativas_falhas: 0,
                    bloqueado_ate: null
                }
            ]));
        }
    },

    // PRODUTOS
    async listarProdutos() {
        try {
            const { data, error } = await sb
                .from('produtos')
                .select('*')
                .order('nome');

            if (error) {
                console.error('Erro ao listar produtos:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            return [];
        }
    },

    async buscarProdutoPorId(id) {
        try {
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
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
    },

    async inserirProduto(produto) {
        try {
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
        } catch (error) {
            console.error('Erro ao inserir produto:', error);
            throw error;
        }
    },

    async atualizarProduto(id, dados) {
        try {
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
        try {
            const { error } = await sb
                .from('produtos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir produto:', error);
                throw error;
            }
            return true;
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
    },

    // ENTRADAS
    async listarEntradas(limite = null) {
        try {
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
        } catch (error) {
            console.error('Erro ao listar entradas:', error);
            return [];
        }
    },

    async inserirEntrada(entrada) {
        try {
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
        } catch (error) {
            console.error('Erro ao inserir entrada:', error);
            throw error;
        }
    },

    // SAÍDAS
    async listarSaidas(limite = null) {
        try {
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
        } catch (error) {
            console.error('Erro ao listar saídas:', error);
            return [];
        }
    },

    async inserirSaida(saida) {
        try {
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
        } catch (error) {
            console.error('Erro ao inserir saída:', error);
            throw error;
        }
    },

    // RELATÓRIOS
    async filtrarEntradas(filtros = {}) {
        try {
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
        } catch (error) {
            console.error('Erro ao filtrar entradas:', error);
            return [];
        }
    },

    async filtrarSaidas(filtros = {}) {
        try {
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
        } catch (error) {
            console.error('Erro ao filtrar saídas:', error);
            return [];
        }
    },

    async filtrarProdutos(filtros = {}) {
        try {
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
        } catch (error) {
            console.error('Erro ao filtrar produtos:', error);
            return [];
        }
    },

    // ============================================
    // AUTENTICAÇÃO MELHORADA (localStorage)
    // ============================================

    async criarUsuario(usuario, senha, nome) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            
            if (usuarios.find(u => u.usuario === usuario)) {
                throw new Error('Usuário já existe');
            }

            const senhaHash = btoa(senha + 'salt_controle_estoque');

            const novoUsuario = {
                id: this.gerarId(),
                usuario: usuario,
                senha: senhaHash,
                nome: nome,
                criado_em: new Date().toISOString(),
                ativo: true,
                tentativas_falhas: 0,
                bloqueado_ate: null
            };

            usuarios.push(novoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            return novoUsuario;
        } catch (error) {
            throw error;
        }
    },

    async validarUsuario(usuario, senha) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            let usuarioEncontrado = usuarios.find(u => u.usuario === usuario);

            if (!usuarioEncontrado) {
                throw new Error('Usuário não encontrado');
            }

            if (!usuarioEncontrado.ativo) {
                throw new Error('Este usuário foi desativado');
            }

            // Verificar se está bloqueado
            if (usuarioEncontrado.bloqueado_ate) {
                const agora = new Date();
                const desbloqueioEm = new Date(usuarioEncontrado.bloqueado_ate);
                
                if (agora < desbloqueioEm) {
                    throw new Error('Usuário bloqueado temporariamente. Tente mais tarde.');
                } else {
                    usuarioEncontrado.bloqueado_ate = null;
                    usuarioEncontrado.tentativas_falhas = 0;
                    usuarios[usuarios.indexOf(usuarioEncontrado)] = usuarioEncontrado;
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));
                }
            }

            const senhaHash = btoa(senha + 'salt_controle_estoque');

            if (usuarioEncontrado.senha !== senhaHash) {
                usuarioEncontrado.tentativas_falhas = (usuarioEncontrado.tentativas_falhas || 0) + 1;

                if (usuarioEncontrado.tentativas_falhas >= 3) {
                    usuarioEncontrado.bloqueado_ate = new Date(Date.now() + 15 * 60000).toISOString();
                    usuarios[usuarios.indexOf(usuarioEncontrado)] = usuarioEncontrado;
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));
                    throw new Error('Muitas tentativas falhas. Usuário bloqueado por 15 minutos.');
                }

                usuarios[usuarios.indexOf(usuarioEncontrado)] = usuarioEncontrado;
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                throw new Error('Senha incorreta');
            }

            usuarioEncontrado.tentativas_falhas = 0;
            usuarios[usuarios.indexOf(usuarioEncontrado)] = usuarioEncontrado;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            return usuarioEncontrado;
        } catch (error) {
            throw error;
        }
    },

    async listarUsuarios() {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            return usuarios.map(u => ({
                id: u.id,
                usuario: u.usuario,
                nome: u.nome,
                criado_em: u.criado_em,
                ativo: u.ativo
            }));
        } catch (error) {
            return [];
        }
    },

    async desativarUsuario(id) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuario = usuarios.find(u => u.id === id);
            
            if (usuario) {
                usuario.ativo = false;
                usuarios[usuarios.indexOf(usuario)] = usuario;
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    },

    async alterarSenha(id, senhaAntiga, senhaNova) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuario = usuarios.find(u => u.id === id);

            if (!usuario) {
                throw new Error('Usuário não encontrado');
            }

            const senhaAntiguaHash = btoa(senhaAntiga + 'salt_controle_estoque');
            
            if (usuario.senha !== senhaAntiguaHash) {
                throw new Error('Senha atual incorreta');
            }

            const senhanovaHash = btoa(senhaNova + 'salt_controle_estoque');
            usuario.senha = senhanovaHash;
            usuarios[usuarios.indexOf(usuario)] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            return true;
        } catch (error) {
            throw error;
        }
    }
};

// Inicializar o banco local ao carregar
DB.init();