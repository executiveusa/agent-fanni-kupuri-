# Deployment Specification — Agent Fanni

## Vercel Frontend Deployment
- **Target App**: Standalone Vite production build (`dist/`).
- **Configuration**: `VITE_FANNI_API_BASE_URL` pointing to Hostinger sidecar API URL.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Hostinger VPS Server Sidecar Deployment
- **Port**: 3001
- **Process Manager**: `pm2 start server/index.js --name fanni-sidecar`
- **Reverse Proxy**: Nginx SSL / TLS handling port 443 -> 3001
- **CORS Setup**: `FANNI_CORS_ORIGIN=https://<your-vercel-domain>.vercel.app`
