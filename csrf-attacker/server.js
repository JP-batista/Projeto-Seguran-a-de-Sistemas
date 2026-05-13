const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3001
const TARGET = 'http://localhost:3000'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.ico':  'image/x-icon',
}

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url)

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('  CSRF Attacker — Site Malicioso (uso acadêmico)')
  console.log('='.repeat(60))
  console.log(`  Atacante : http://localhost:${PORT}`)
  console.log(`  Alvo     : ${TARGET}`)
  console.log('='.repeat(60))
  console.log('  1. Inicie o SafeBank:  cd ../safebank-vulneravel && npm run dev')
  console.log('  2. Faça login como alice em http://localhost:3000')
  console.log('  3. Abra http://localhost:3001 em outra aba')
  console.log('='.repeat(60))
})
