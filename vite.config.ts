import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], resolve: {dedupe: ["react", "react-dom", "remotion", "@remotion/media", "@remotion/player"]}, server: { port: 5173 } });
