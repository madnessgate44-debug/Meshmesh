{
  "project": "Meshmesh",
  "files": [
    {
      "path": "sw.js",
      "content": "// FIX: Updated cache paths to match root directory (no /Meshmesh/ prefix)\nconst CACHE_NAME = 'meshmesh-v2';\nconst CACHE_FILES = [\n  '/',\n  '/index.html',\n  '/App.html',\n  '/manifest.json'\n];\n\nself.addEventListener('install', e => {\n  e.waitUntil(\n    caches.open(CACHE_NAME)\n      .then(c => c.addAll(CACHE_FILES))\n      .then(() => self.skipWaiting())\n  );\n});\n\nself.addEventListener('activate', e => {\n  e.waitUntil(\n    caches.keys()\n      .then(names => Promise.all(\n        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))\n      ))\n      .then(() => self.clients.claim())\n  );\n});\n\nself.addEventListener('fetch', e => {\n  if (e.request.method !== 'GET') return;\n  const u = new URL(e.request.url);\n  // Don't cache API calls\n  if (\n    u.hostname.includes('googleapis.com') ||\n    u.hostname === 'api.anthropic.com' ||\n    u.hostname === 'api.github.com'\n  ) return;\n  e.respondWith(\n    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {\n      if (resp.ok) {\n        const clone = resp.clone();\n        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));\n      }\n      return resp;\n    }))\n  );\n});\n"
    }
  ]
}