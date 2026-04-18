<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-rules -->
# Regras do Projeto

## NUNCA execute `taskkill` ou mate processos Node.js
- Quando houver erro de arquivo travado (EBUSY, lock file), informe o usuário para matar o processo manualmente
- O usuário deve rodar `taskkill /F /IM node.exe` no terminal e depois `npm run dev`
- NÃO use `taskkill`, `Stop-Process`, ou qualquer comando que mate processos — isso faz o OpenCode fechar e voltar ao cmd
<!-- END:project-rules -->
