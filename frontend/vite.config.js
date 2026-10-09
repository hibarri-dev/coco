import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Runs the Vercel functions in /api during `npm run dev`; Vercel serves them in production.
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value

      server.middlewares.use(async (req, res, next) => {
        const name = req.url?.match(/^\/api\/([a-z][\w-]*)(?:\?|$)/)?.[1]
        if (!name) return next()
        try {
          const handler = (await server.ssrLoadModule(`/api/${name}.js`))[req.method]
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const headers = new Headers()
          for (const key of ['content-type', 'stripe-signature']) if (req.headers[key]) headers.set(key, req.headers[key])
          const response = await handler(
            new Request(`http://${req.headers.host}${req.url}`, {
              method: req.method,
              headers,
              body: chunks.length ? Buffer.concat(chunks) : undefined,
            }),
          )
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devApi(),
  ],
  build: {
    // Vite's default JS target (iOS 16.4) can leave a blank page on older iPhones.
    target: ['es2020', 'safari15', 'ios15'],
    // Kept at Vite's default so the generated CSS (and the design) stays exactly as it was.
    cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
  },
})
