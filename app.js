const path = require('path');
const dir = path.join(__dirname, '.next', 'standalone', 'server.js');

try {
    require(dir);
} catch (err) {
    console.error("Next.js standalone build not found. Please run 'npm run build'", err);
}