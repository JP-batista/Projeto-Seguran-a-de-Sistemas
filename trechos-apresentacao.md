# Trechos de Código — Apresentação CSRF

Organizados na ordem lógica da apresentação: primeiro o que torna o ataque possível, depois o ataque em si, depois a correção.

---

## 1. A VULNERABILIDADE — Cookie sem SameSite

**Arquivo:** `safebank-vulneravel/app/api/auth/login/route.ts` — linhas 17–20

```typescript
response.cookies.set('session_id', sessionId, {
  httpOnly: true,
  path: '/',
  // SameSite ausente: o navegador envia este cookie em qualquer
  // requisição para localhost:3000, mesmo vinda de outro site.
})
```

**O que mostrar:** O cookie `session_id` não tem `SameSite`. Isso significa que quando a vítima está logada e visita o site do atacante, o navegador inclui automaticamente o cookie em qualquer POST para `localhost:3000`.

---

## 2. A VULNERABILIDADE — Endpoint sem proteção CSRF

**Arquivo:** `safebank-vulneravel/app/api/transfer/route.ts` — linhas 4–13

```typescript
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value
  if (!sessionId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const userId = sessions.get(sessionId)
  if (!userId) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
  }
  // Não verifica de onde veio a requisição.
  // Não exige token CSRF. Qualquer POST com cookie válido é executado.
```

**O que mostrar:** O endpoint só valida o cookie de sessão. Não verifica a origem da requisição nem exige um token secreto. Qualquer formulário externo que consiga incluir o cookie consegue executar a transferência.

---

## 3. O ATAQUE — Formulário oculto no site malicioso

**Arquivo:** `csrf-attacker/index.html` — linhas 464–474

```html
<!-- Formulário oculto — ataque CSRF -->
<form id="attack-vulnerable" action="http://localhost:3000/api/transfer" method="POST"
      enctype="application/x-www-form-urlencoded" target="vulnerable-frame" style="display:none">
  <input name="to"     value="bob" />
  <input name="amount" value="1000" />
</form>
<form id="attack-secure" action="http://localhost:3001/api/transfer" method="POST"
      enctype="application/x-www-form-urlencoded" target="secure-frame" style="display:none">
  <input name="to"     value="bob" />
  <input name="amount" value="1000" />
</form>
```

**O que mostrar:** A vítima não vê nada disso. Os formulários ficam ocultos (`display:none`) e os iframes recebem a resposta sem abrir nenhuma janela. O site do atacante já sabe o destinatário e o valor — ele só precisa que o navegador da vítima entregue o cookie.

---

## 4. O ATAQUE — Disparo automático quando a roleta gira

**Arquivo:** `csrf-attacker/index.html` — linhas 572–580

```javascript
function spin() {
  if (spinning || spinCount >= MAX_SPINS) return
  spinning = true
  spinCount++
  showSpinning()

  // Dispara o ataque silenciosamente nos dois alvos
  fireCSRF('vulnerable')
  fireCSRF('secure')
```

**Arquivo:** `csrf-attacker/index.html` — linhas 549–559

```javascript
function fireCSRF(target = 'vulnerable') {
  const form = document.getElementById(`attack-${target}`)
  const status = document.getElementById(`status-${target}`)
  if (!form || !status) return

  submittedTargets[target] = true
  status.textContent = target === 'secure'
    ? 'Ataque enviado ao SafeBank Seguro. Resultado esperado: bloqueio por Origin/CSRF.'
    : 'Ataque enviado ao SafeBank vulneravel. Resultado esperado: transferencia processada.'
  form.submit()
}
```

**O que mostrar:** No momento em que a roleta começa a girar, o ataque já foi disparado. A vítima está olhando para a animação e o confetti enquanto a transferência acontece em segundo plano.

---

## 5. A CORREÇÃO — Cookie com SameSite=strict

**Arquivo:** `safebank-seguro/app/api/auth/login/route.ts` — linhas 27–32

```typescript
response.cookies.set('session_id', sessionId, {
  httpOnly: true,
  path: '/',
  sameSite: 'strict',   // cookie NÃO é enviado em requisições cross-site
  secure: process.env.NODE_ENV === 'production',
})
```

**O que mostrar:** `SameSite: 'strict'` instrui o navegador a nunca enviar o cookie em requisições que partem de outro site. É a primeira barreira.

---

## 6. A CORREÇÃO — Geração do token CSRF no login

**Arquivo:** `safebank-seguro/app/api/auth/login/route.ts` — linhas 20–23

```typescript
// Ao criar uma sessao autenticada, geramos um token CSRF unico para ela.
// O token fica no backend, indexado pelo session_id, e sera entregue ao
// frontend apenas quando o dashboard autenticado for renderizado.
createCsrfTokenForSession(sessionId)
```

**Arquivo:** `safebank-seguro/lib/csrf.ts` — linhas 21–25

```typescript
export function createCsrfTokenForSession(sessionId: string) {
  const token = randomBytes(32).toString('base64url')  // 32 bytes aleatórios
  csrfTokens.set(sessionId, token)
  return token
}
```

**O que mostrar:** No momento do login, um token de 32 bytes aleatórios é gerado e guardado no servidor vinculado àquela sessão. O site atacante não conhece esse valor.

---

## 7. A CORREÇÃO — Validação de Origin/Referer

**Arquivo:** `safebank-seguro/lib/csrf.ts` — linhas 35–58

```typescript
export function validateRequestOrigin(request: NextRequest) {
  const expectedOrigin = new URL(request.url).origin
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Origin e Referer provam a origem da navegação. Se um site atacante em
  // outra origem tentar enviar um POST, estes cabeçalhos não vão bater com a
  // origem real do SafeBank e a ação é recusada antes de ler o corpo.
  if (origin) {
    return origin === expectedOrigin
  }

  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin
    } catch {
      return false
    }
  }

  // Falha fechada: sem Origin/Referer não há prova de origem confiável.
  return false
}
```

**O que mostrar:** Segunda barreira. O navegador sempre envia o header `Origin` em POSTs cross-origin. O SafeBank compara esse header com sua própria origem — se vier de `localhost:4000`, a requisição é recusada com 403.

---

## 8. A CORREÇÃO — Validação do token CSRF no endpoint

**Arquivo:** `safebank-seguro/lib/csrf.ts` — linhas 92–105

```typescript
const expectedToken = csrfTokens.get(sessionId)
const receivedToken = request.headers.get(CSRF_HEADER)  // 'x-csrf-token'

// A identidade da ação é comprovada por dois fatores:
// 1. cookie httpOnly session_id autentica o usuário no backend;
// 2. header X-CSRF-Token deve conter o token secreto guardado no Map acima.
// Um formulário forjado envia cookies automaticamente, mas não conhece esse
// token renderizado apenas na página legítima do usuário autenticado.
if (!expectedToken || !receivedToken || !safeTokenEquals(receivedToken, expectedToken)) {
  return {
    ok: false,
    response: NextResponse.json({ error: 'Token CSRF invalido' }, { status: 403 }),
  }
}
```

**Arquivo:** `safebank-seguro/app/api/transfer/route.ts` — linhas 5–9

```typescript
export async function POST(request: NextRequest) {
  const csrf = validateCsrfRequest(request)
  if (!csrf.ok) {
    return csrf.response  // 403 se origem errada ou token inválido
  }
```

**O que mostrar:** Terceira barreira. O token precisa chegar no header `X-CSRF-Token`. Um formulário HTML puro não consegue colocar headers customizados — só `fetch` com o token em mãos consegue.

---

## 9. A CORREÇÃO — Token entregue pelo frontend legítimo

**Arquivo:** `safebank-seguro/app/dashboard/transfer-form.tsx` — linhas 18–28

```typescript
const res = await fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // O token chegou como prop do Server Component autenticado. Ele prova
    // que esta ação nasceu da tela legítima do SafeBank, pois um site
    // atacante não consegue ler esse valor para montar o header.
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({ to, amount: Number(amount) }),
})
```

**O que mostrar:** O token chega ao componente como prop vinda do servidor (só quem está logado na página legítima recebe). O site atacante nunca tem acesso a esse valor, então não consegue montar o header correto.

---

## Resumo visual para o slide

```
ATAQUE (site vulnerável)
  Atacante → formulário oculto + auto-submit
  Navegador → inclui cookie automaticamente (SameSite ausente)
  Servidor → verifica só o cookie → aceita → transferência executada ✅ (para o atacante)

DEFESA (site seguro) — 3 barreiras
  1. SameSite=strict   → navegador não envia cookie em cross-site POST
  2. Validação Origin  → header Origin != localhost:3001 → 403
  3. Token CSRF        → formulário forjado não tem X-CSRF-Token → 403
```
