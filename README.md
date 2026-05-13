# Projeto de Segurança de Sistemas — CSRF

Demonstração prática de ataque **Cross-Site Request Forgery (CSRF)** composta por dois projetos independentes:

| Projeto | Descrição | Porta |
|---|---|---|
| `safebank-vulneravel` | Aplicação bancária com vulnerabilidade CSRF intencional | 3000 |
| `csrf-attacker` | Site malicioso que executa o ataque | 4000 |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm

---

## Como executar

### 1. SafeBank (aplicação alvo)

```bash
cd safebank-vulneravel
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

**Contas disponíveis:**

| Usuário | Senha | Saldo inicial |
|---|---|---|
| alice | alice123 | R$ 10.000,00 |
| bob | bob123 | R$ 500,00 |

---

### 2. Site do atacante

Em outro terminal, a partir da **raiz do projeto**:

```bash
npx serve csrf-attacker -p 4000
```

Acesse: [http://localhost:4000](http://localhost:4000)

---

## Executando o ataque

1. Inicie o SafeBank e faça login como **alice**
2. Sem fazer logout, abra [http://localhost:4000](http://localhost:4000) em outra aba
3. O pop-up da roleta aparece e o ataque é disparado automaticamente
4. Volte ao dashboard do SafeBank e verifique que o saldo de alice diminuiu

O ataque transfere **R$ 500,00** da conta de alice para bob sem qualquer interação da vítima.

---

## Como o ataque funciona

O site do atacante (`localhost:4000`) submete um formulário HTML oculto para `localhost:3000/api/transfer` assim que a página carrega. O navegador inclui automaticamente o cookie `session_id` da vítima na requisição, pois ambos os domínios compartilham o mesmo site registrável (`localhost`). Como o endpoint não valida um token CSRF nem verifica a origem da requisição, a transferência é processada normalmente.

```
Vítima logada     Site malicioso         SafeBank
em localhost:3000  localhost:4000     localhost:3000
       │                 │                  │
       │  acessa página  │                  │
       │────────────────►│                  │
       │                 │  POST /transfer  │
       │                 │  Cookie: session │ ← enviado automaticamente
       │                 │─────────────────►│
       │                 │                  │ processa transferência
       │                 │  200 OK          │
       │                 │◄─────────────────│
```

---

## Vulnerabilidades presentes no SafeBank

- Cookie de sessão sem `SameSite=Strict`
- Endpoint `/api/transfer` não verifica token CSRF
- Endpoint não valida o header `Origin` da requisição
- Aceita `application/x-www-form-urlencoded` (formulários HTML puros)

## Correções

- Definir `sameSite: 'strict'` no cookie de sessão
- Gerar e validar token CSRF único por sessão
- Verificar o header `Origin` nas ações sensíveis
