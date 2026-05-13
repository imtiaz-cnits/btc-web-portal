// cPanel server.js entry point
const path = require('path');

// Next.js এর standalone সার্ভার ফাইলটি রিকোয়ার করা হচ্ছে
const dir = path.join(__dirname, '.next', 'standalone', 'server.js');

try {
  require(dir);
} catch (err) {
  console.error("Next.js standalone build not found. Did you run 'npm run build'?", err);
}
