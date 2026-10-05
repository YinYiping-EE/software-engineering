# Frontend instructions

This is the Vue + Vite frontend for the calculator assignment at https://bbs.csdn.net/topics/620530837.

- Core arithmetic is exclusively on the backend. Send expression text to `/api/calculations` and display the returned result.
- Read and delete history through the backend API. Do not replace database history with LocalStorage or frontend computation.
- Run `npm ci`, `npm run dev`, and `npm run build` in this directory when working on this repository independently.
- The default frontend address is http://127.0.0.1:5173; the Vite proxy forwards `/api` to http://127.0.0.1:3001.
- Follow codestyle.md and preserve accessible keyboard interactions. Check relevant UI behavior after changes.
