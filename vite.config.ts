// FIX: Add a triple-slash directive to include Node.js types. This resolves the
// TypeScript error for `process.cwd()` by ensuring the full Node.js `process`
// object type is available in this file's context.
/// <reference types="node" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './',
    // Define process.env.API_KEY to make the environment variable available in client-side code.
    // This is necessary to fix the "API Key must be set" error by securely exposing
    // the API_KEY from the deployment environment (e.g., Vercel) to the application,
    // adhering to the @google/genai SDK's requirement of using process.env.API_KEY.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
