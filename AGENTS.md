<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Triple Language Rule (EN/FR/AR)

All user-facing UI text must support English, French, and Arabic.

Required rules:
- Never add new hardcoded UI text in pages/components when it should be translated.
- Keep translation keys synchronized across `src/messages/en.json`, `src/messages/fr.json`, and `src/messages/ar.json`.
- Database values must remain unchanged; localization is visual only (display layer/helpers).
- Before merge, run `npm run lint` (this includes ESLint + i18n parity + hardcoded text guard).
- Treat any i18n parity failure or new hardcoded-text failure as a blocking issue.
