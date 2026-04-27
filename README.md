# 🛒 Marketplace API

Plataforma multi-vendedor estilo Shopee/Shein desenvolvida com Node.js, Fastify, TypeScript e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** + **Fastify** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **JWT** para autenticação
- **Zod** para validação de dados
- **Docker** para banco de dados

## 📦 Funcionalidades

- ✅ Cadastro e autenticação de usuários (JWT)
- ✅ Multi-vendedor — qualquer usuário pode abrir uma loja
- ✅ CRUD completo de produtos com filtros e paginação
- ✅ Categorias de produtos
- ✅ Carrinho e pedidos com controle de estoque
- ✅ Pagamento via Pix simulado
- ✅ Sistema de avaliações com média automática

## 🗂️ Estrutura

src/
├── modules/
│   ├── users/
│   ├── sellers/
│   ├── products/
│   ├── orders/
│   └── reviews/
├── lib/
│   └── prisma.ts
├── app.ts
├── server.ts
└── env.ts


## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Docker

### Instalação

```bash
# Clone o repositório
git clone https://github.com/JoseMateus-hub/marketplace-api.git
cd marketplace-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Suba o banco de dados
docker run -d --name marketplace-db -p 5432:5432 \
  -e POSTGRES_USER=docker \
  -e POSTGRES_PASSWORD=docker \
  -e POSTGRES_DB=marketplace \
  postgres:16

# Rode as migrations
npx prisma migrate dev

# Inicie o servidor
npm run dev
```

## 🔥 Endpoints

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/users/register` | Cadastro |
| POST | `/api/users/login` | Login |
| GET | `/api/users/profile` | Perfil autenticado |

### Lojas
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/sellers` | Criar loja |
| GET | `/api/sellers` | Listar lojas |
| GET | `/api/sellers/me` | Minha loja |

### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Listar produtos |
| GET | `/api/products/:id` | Detalhar produto |
| POST | `/api/products` | Criar produto |
| PUT | `/api/products/:id` | Editar produto |
| DELETE | `/api/products/:id` | Remover produto |

### Categorias
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/categories` | Listar categorias |
| POST | `/api/categories` | Criar categoria |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/orders` | Criar pedido |
| GET | `/api/orders` | Meus pedidos |
| GET | `/api/orders/:id` | Detalhar pedido |
| PATCH | `/api/orders/:id/status` | Atualizar status |

### Avaliações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products/:productId/reviews` | Listar avaliações |
| POST | `/api/products/:productId/reviews` | Avaliar produto |

## 👨‍💻 Autor

**José Mateus**
- GitHub: [@JoseMateus-hub](https://github.com/JoseMateus-hub)
- LinkedIn: [jose-mateus](https://linkedin.com/in/jose-mateus-222a5a144)