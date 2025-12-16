// FIX: Use a specific import for `cwd` from Node's `process` module. This is
// a more robust method than using a triple-slash directive, as it explicitly
// brings in the required function and its type, resolving the TypeScript
// error for `process.cwd()` without relying on global ambient types.
import { cwd } from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')
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