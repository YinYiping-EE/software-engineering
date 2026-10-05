import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const apiProxy = {
  '/api': { target: 'http://127.0.0.1:3001' },
};

// Public HTML directories need explicit index resolution before Vite's SPA fallback.
function projectPageMiddleware(request, response, next) {
  const [pathname, query] = (request.url || '').split('?');
  if (pathname === '/scriptchisel') {
    response.writeHead(308, { Location: `/scriptchisel/${query ? `?${query}` : ''}` });
    response.end();
    return;
  }
  if (pathname === '/scriptchisel/') {
    request.url = `/scriptchisel/index.html${query ? `?${query}` : ''}`;
  }
  next();
}

export default defineConfig({
  plugins: [vue(), {
    name: 'scriptchisel-page',
    configureServer(server) { server.middlewares.use(projectPageMiddleware); },
    configurePreviewServer(server) { server.middlewares.use(projectPageMiddleware); },
  }],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: apiProxy,
  },
  preview: { proxy: apiProxy },
});
