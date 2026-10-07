# Controle de Estoque - Materiais de Limpeza

Sistema web para gerenciar o estoque de materiais de limpeza de uma escola.

## 📋 Funcionalidades

- ✅ Cadastro de produtos com categorias
- ✅ Controle de entrada e saída de materiais
- ✅ Visualização do estoque em tempo real com alertas
- ✅ Geração de relatórios customizados
- ✅ Sistema de login seguro
- ✅ Impressão de relatórios formatados
- ✅ Histórico completo de movimentações
- ✅ Filtros por categoria, produto e período

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript ES6 (Vanilla)
- **Backend:** Supabase (PostgreSQL em nuvem)
- **Armazenamento:** LocalStorage (para modo offline)
- **Design:** Interface responsiva e intuitiva

## 📱 Como Usar

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/controle-estoque.git
cd controle-estoque
```

2. Configure o Supabase (opcional):
   - Acesse https://supabase.com
   - Crie uma conta grátis
   - Crie um novo projeto
   - Execute o SQL fornecido em `js/config.js`
   - Copie a URL e a chave pública
   - Cole em `js/config.js`

3. Rode um servidor local:

**Opção 1 - Com Python:**
```bash
python -m http.server 8000
```

**Opção 2 - Com Node.js:**
```bash
npx http-server -p 8000
```

**Opção 3 - VS Code (recomendado):**
- Instale a extensão "Live Server"
- Clique com botão direito em `index.html`
- Selecione "Open with Live Server"

4. Acesse no navegador:
```
http://localhost:8000
```

### Dados de Teste

- **Usuário:** admin
- **Senha:** admin123

> **Nota:** O sistema funciona sem Supabase usando LocalStorage. Para usar banco de dados em nuvem, configure o Supabase.

## 📁 Estrutura do Projeto

```
controle-estoque/
├── index.html                # Página principal
├── css/
│   └── style.css            # Estilos e responsividade
├── js/
│   ├── config.js            # Configuração do Supabase
│   ├── database.js          # Funções de banco de dados
│   ├── auth.js              # Sistema de autenticação
│   ├── produtos.js          # Cadastro e controle de estoque
│   ├── movimentacao.js      # Entradas e saídas
│   └── relatorios.js        # Geração e impressão de relatórios
├── README.md                # Este arquivo
└── .gitignore              # Arquivos ignorados pelo Git
```

## 📖 Descrição das Telas

### 🔐 Login
Acesso seguro ao sistema com validação de usuário e senha.

### 📊 Menu Principal
Dashboard com acesso a todas as funcionalidades através de cards intuitivos.

### ➕ Cadastro de Produtos
Adiciona novos materiais ao sistema com informações de categoria, quantidade e estoque mínimo.

### 📦 Controle de Estoque
Visualiza todos os produtos cadastrados em tempo real com busca e filtros. Mostra status visual do estoque.

### 📥 Entrada de Materiais
Registra a chegada de novos materiais com informações do fornecedor. Atualiza automaticamente o estoque.

### 📤 Saída de Materiais
Registra a retirada de materiais com validação de estoque. Emite alertas quando estoque fica baixo.

### 📊 Relatórios
Gera relatórios em tempo real com opções de filtro por categoria, produto e período. Permite impressão formatada.

## 🚀 Próximas Melhorias

- [ ] Editar produtos já cadastrados
- [ ] Gráficos de movimentação com Chart.js
- [ ] Exportar relatórios em Excel
- [ ] Sistema de múltiplos usuários com roles diferentes
- [ ] Notificações automáticas de estoque baixo
- [ ] Backup automático de dados
- [ ] App mobile responsivo melhorado

## 💡 Sobre o Desenvolvimento

Este projeto foi desenvolvido como trabalho de conclusão da disciplina **Desenvolvimento de Sistemas** do 3º ano do Ensino Médio. 

**Tecnologias aprendidas:**
- Desenvolvimento Frontend com HTML, CSS e JavaScript puro
- Integração com APIs (Supabase)
- Gerenciamento de dados com banco de dados SQL
- Versionamento com Git e GitHub
- Responsividade e UX/UI

**Auxílio:** Projeto desenvolvido com auxílio de IA para otimização de código e melhores práticas de desenvolvimento.

## 📞 Informações do Projeto

- **Aluno:** [Seu Nome]
- **Turma:** 3º ano - Desenvolvimento de Sistemas
- **Professor:** [Nome do Professor]
- **Escola:** [Nome da Escola]
- **Data:** 2025
- **Repositório:** https://github.com/SEU_USUARIO/controle-estoque

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e comerciais.

---

## 🎯 Como Contribuir

Se você quer melhorar o projeto:

1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
