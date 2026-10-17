import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerRouter = Router();

const openApiJsonPath = path.join(__dirname, 'openapi.json');
const openApiYamlPath = path.join(__dirname, 'openapi.yaml');

let swaggerDoc = null;
try {
  swaggerDoc = JSON.parse(fs.readFileSync(openApiJsonPath, 'utf8'));
} catch (err) {
  console.error('[Swagger] Failed to load openapi.json:', err.message);
}

// Custom CSS for a sleek, premium CoCo & Hibarri brand presentation in Swagger UI
const customCss = `
  body {
    background-color: #0b0c10 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  }
  .swagger-ui {
    color: #e0e2ec !important;
  }
  .swagger-ui .topbar {
    background-color: #12131a !important;
    border-bottom: 1px solid rgba(158, 0, 255, 0.3) !important;
    padding: 14px 20px !important;
  }
  .swagger-ui .topbar-wrapper a {
    color: #ffffff !important;
    font-weight: 700 !important;
    font-size: 1.2rem !important;
  }
  .swagger-ui .topbar-wrapper a span {
    color: #a855f7 !important;
  }
  .swagger-ui .info {
    margin: 30px 0 !important;
  }
  .swagger-ui .info .title {
    color: #ffffff !important;
    font-weight: 800 !important;
    letter-spacing: -0.02em !important;
  }
  .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info table {
    color: #c4c7d5 !important;
  }
  .swagger-ui .scheme-container {
    background-color: #161822 !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
    border: 1px solid #232736 !important;
    border-radius: 8px !important;
    margin-bottom: 24px !important;
    padding: 16px 24px !important;
  }
  .swagger-ui .opblock {
    background-color: #13151f !important;
    border: 1px solid #212534 !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
    margin: 0 0 16px !important;
  }
  .swagger-ui .opblock .opblock-summary {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
  .swagger-ui .opblock .opblock-summary-method {
    font-weight: 700 !important;
    border-radius: 6px !important;
    text-shadow: none !important;
  }
  .swagger-ui .opblock .opblock-summary-path,
  .swagger-ui .opblock .opblock-summary-description {
    color: #e2e8f0 !important;
  }
  .swagger-ui .opblock-body {
    background: #0f1017 !important;
  }
  .swagger-ui table thead tr th, .swagger-ui table thead tr td {
    color: #94a3b8 !important;
    border-bottom: 1px solid #2d3748 !important;
  }
  .swagger-ui .tabli button {
    color: #94a3b8 !important;
  }
  .swagger-ui .tabli.active button {
    color: #a855f7 !important;
    border-bottom: 2px solid #a855f7 !important;
  }
  .swagger-ui .btn.authorize {
    background-color: #9e00ff !important;
    border-color: #9e00ff !important;
    color: #ffffff !important;
    border-radius: 6px !important;
  }
  .swagger-ui .btn.authorize svg {
    fill: #ffffff !important;
  }
  .swagger-ui section.models {
    background: #13151f !important;
    border: 1px solid #212534 !important;
    border-radius: 8px !important;
  }
  .swagger-ui section.models h4 {
    color: #ffffff !important;
  }
  .swagger-ui .model-box {
    background: #0f1017 !important;
  }
`;

const swaggerOptions = {
  customCss,
  customSiteTitle: 'CoCo Cloud API Documentation | Hibarri',
  customfavIcon: 'https://coco.hibarri.com/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
    tagsSorter: 'alpha',
  },
};

// Raw OpenAPI endpoints for external consumption (Postman, code generators, CI)
swaggerRouter.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(openApiJsonPath);
});

swaggerRouter.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(openApiYamlPath);
});

// Middleware to strip CSP headers on swagger-ui route so inline styles and scripts render cleanly
swaggerRouter.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  next();
});

if (swaggerDoc) {
  swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc, swaggerOptions));
} else {
  swaggerRouter.get('/', (req, res) => {
    res.status(500).json({ error: 'swagger_not_loaded', message: 'OpenAPI specification could not be loaded.' });
  });
}

export default swaggerRouter;
