import { defineConfig, loadEnv } from 'vite';
import { handleAnalyzeRequest } from './server/analyze.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const attach = server => server.middlewares.use('/api/analyze', (req, res) => handleAnalyzeRequest(req, res, { ...env, ...process.env }));
  return {
    base: './',
    esbuild: { jsx: 'automatic' },
    plugins: [{ name: 'memento-ai-local-api', configureServer: attach, configurePreviewServer: attach }],
  };
});
