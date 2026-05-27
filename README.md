# Projeto de Seguranca de Sistemas - CSRF

Demonstracao academica de ataque **Cross-Site Request Forgery (CSRF)** com tres ambientes locais:

| Projeto | Descricao | Porta |
|---|---|---|
| `safebank-vulneravel` | Aplicacao bancaria com vulnerabilidade CSRF intencional | 3000 |
| `safebank-seguro` | Copia protegida com token CSRF, validacao de origem e cookie SameSite | 3001 |
| `csrf-attacker` | Site malicioso usado para disparar o ataque | 4000 |

## Pre-requisitos

- Node.js 18+
- npm

Se o PowerShell bloquear `npm` ou `npx` por politica de execucao, use `npm.cmd` e `npx.cmd`.

## Como executar

Abra um terminal para cada aplicacao.

### 1. SafeBank vulneravel

```bash
cd safebank-vulneravel
npm install
npm run dev
```

Acesse: <http://localhost:3000>

### 2. SafeBank seguro

```bash
cd safebank-seguro
npm install
npm run dev -- -p 3001
```

Acesse: <http://localhost:3001>

### 3. Site do atacante

```bash
cd csrf-attacker
npm start
```

Acesse: <http://localhost:4000>

## Contas disponiveis

| Usuario | Senha | Saldo inicial |
|---|---|---|
| `alice` | `alice123` | R$ 10.000,00 |
| `bob` | `bob123` | R$ 500,00 |

## Demonstracao do ataque no site vulneravel

1. Acesse <http://localhost:3000> e faca login como `alice`.
2. Sem fazer logout, abra <http://localhost:4000>.
3. A roleta do site atacante dispara automaticamente um POST para `http://localhost:3000/api/transfer`.
4. Volte ao dashboard do SafeBank vulneravel e verifique que o saldo de `alice` diminuiu.

O ataque tambem pode ser repetido manualmente no painel "Demonstracao tecnica do CSRF", usando o botao **Atacar alvo vulneravel**.

## Demonstracao contra o site seguro

Para deixar o resultado claro, teste um alvo por vez. Como os dois bancos rodam em `localhost` e usam o cookie `session_id`, o login feito por ultimo pode sobrescrever o cookie do outro ambiente.

1. Acesse <http://localhost:3001> e faca login como `alice`.
2. Abra <http://localhost:4000>.
3. No painel "Demonstracao tecnica do CSRF", clique em **Atacar alvo seguro**.
4. O iframe de resposta deve mostrar erro de bloqueio, normalmente `403`, por falta de token CSRF valido e/ou origem externa.
5. Volte ao dashboard do SafeBank seguro e confirme que o saldo de `alice` nao mudou.

## Como o ataque funciona no alvo vulneravel

O site do atacante (`localhost:4000`) submete um formulario HTML oculto para `localhost:3000/api/transfer`. O navegador envia automaticamente o cookie de sessao da vitima para o SafeBank vulneravel. Como o endpoint nao exige token CSRF e nao valida `Origin`/`Referer`, a transferencia e processada.

```text
Vitima logada       Site atacante          SafeBank vulneravel
localhost:3000      localhost:4000         localhost:3000
      |                   |                       |
      | acessa pagina     |                       |
      |------------------>|                       |
      |                   | POST /api/transfer    |
      |                   | Cookie: session_id    |
      |                   |---------------------->|
      |                   |                       | processa transferencia
      |                   | 200 OK                |
      |                   |<----------------------|
```

## Por que o ataque falha no alvo seguro

O `safebank-seguro` aplica defesas em camadas:

- Cookie de sessao com `HttpOnly` e `SameSite=Strict`.
- Token CSRF unico por sessao, guardado no backend e enviado pelo frontend legitimo no header `X-CSRF-Token`.
- Validacao de `Origin`/`Referer` nas rotas sensiveis.
- Rotas de transferencia, alteracao de e-mail e logout recusam POST sem sessao valida, sem token correto ou vindo de origem externa.

Um formulario forjado consegue enviar cookies automaticamente, mas nao consegue descobrir o token CSRF renderizado na tela legitima do usuario. Alem disso, a origem do POST aponta para o site atacante, nao para o SafeBank.

## Rotas sensiveis protegidas no ambiente seguro

- `POST /api/transfer`
- `POST /api/email`
- `POST /api/auth/logout`

## Observacao

Este projeto e exclusivamente academico e deve ser executado apenas em ambiente local controlado.
