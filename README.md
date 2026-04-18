# Banca do Jonas - Sistema de Gestão de Estoque

## Projeto criado com sucesso!

### Como rodar localmente

```bash
cd banca-do-jonas
npm run dev
```

Acesse: http://localhost:3000

### Criar usuário Admin

1. Acesse http://localhost:3000/admin/login
2. Crie manualmente pelo painel do Supabase:
   - Acesse https://supabase.com/dashboard/project/drwslymbpvdvzuyjvwle/auth/users
   - Clique em "Add user" > "Create new user"
   - Email: admin@bancadojonas.com
   - Senha: admin123
   - Auto Confirm Email: SIM

### Estrutura do Projeto

```
banca-do-jonas/
├── app/
│   ├── (admin)/           # Painel administrativo (protegido)
│   │   ├── login/         # Tela de login
│   │   ├── dashboard/     # Resumo diário
│   │   ├── caixa/         # Terminal de vendas (PDV)
│   │   ├── estoque/       # Gestão de produtos
│   │   ├── categorias/    # Gestão de categorias
│   │   └── relatorios/    # Relatório de vendas
│   ├── (catalogo)/        # Vitrine pública
│   │   ├── page.tsx       # Home com grade de produtos
│   │   └── produto/[id]/  # Detalhes do produto
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── admin/AdminLayout.tsx
│   ├── shared/ProductModal.tsx
├── lib/supabase/
│   ├── client.ts          # Client-side Supabase
│   └── server.ts          # Server-side Supabase
├── types/index.ts         # TypeScript types
├── middleware.ts           # Auth protection
├── Dockerfile             # Para deploy no EasyPanel
└── supabase/migrations/
    └── 001_create_tables.sql
```

### Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Catálogo (vitrine) |
| `/produto/[id]` | Público | Detalhes do produto |
| `/admin/login` | Público | Login do admin |
| `/admin/dashboard` | Admin | Painel com resumo |
| `/admin/caixa` | Admin | Terminal de vendas |
| `/admin/estoque` | Admin | Gestão de produtos |
| `/admin/categorias` | Admin | Gestão de categorias |
| `/admin/relatorios` | Admin | Relatório de vendas |

### Deploy no EasyPanel

1. Push o repositório para o GitHub
2. No EasyPanel, conecte o repositório
3. O Dockerfile já está configurado com:
   - Node.js 20 Alpine
   - Timezone America/Sao_Paulo
   - Output standalone do Next.js
4. Adicione as variáveis de ambiente no EasyPanel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`

### Banco de Dados

Tabelas criadas no Supabase:
- `categorias` - Categorias de produtos
- `produtos` - Produtos com estoque
- `vendas` - Registro de vendas
- `venda_itens` - Itens de cada venda

Função `finalizar_venda()` - Deduz estoque atomicamente ao finalizar venda.
