- [x] Update API base URL + create request helper
- [x] Replace mock AI functions with real REST calls: GET /api/ai/health, POST /api/ai/chat, POST /api/ai/search (as needed)
- [x] Update AIProjectBrain to use real chat response (remove history dependency since no history endpoint exists)
- [x] Add polling-based "real-time" updates (every N seconds) for new chat items (best-effort refresh due to no chat history endpoint)
- [ ] Test locally: start frontend, verify /api/ai/health works, verify chat works with backend

- [ ] Document required backend changes if history endpoint is still needed

Backend note:
- Dedicated chat history / messages endpoint is NOT available yet.
- Current frontend polling re-asks POST /api/ai/chat for the most recent user question every few seconds.
- Recommended backend addition for true streaming/history:
  - GET /api/ai/chat/:chatId/messages (or /api/ai/history)
  - or GET /api/ai/chat/:chatId/latest








