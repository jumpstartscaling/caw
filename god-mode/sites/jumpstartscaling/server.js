import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8100;
const DIST_DIR = join(__dirname, 'dist');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = createServer((req, res) => {
    let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

    // Try to serve the file
    try {
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            filePath = join(filePath, 'index.html');
        }

        const ext = extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        const content = readFileSync(filePath);

        // Set aggressive caching for static assets, shorter for HTML
        const isStatic = ['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot'].includes(ext);
        const cacheControl = isStatic ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': cacheControl
        });
        res.end(content);
    } catch (error) {
        // If file not found, try serving index.html (for client-side routing)
        try {
            const content = readFileSync(join(DIST_DIR, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on http://0.0.0.0:${PORT}`);
});
