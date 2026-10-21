const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Health check endpoint for Render proxy and monitoring
app.get(['/health', '/healthz'], (req, res) => {
  res.status(200).send('OK');
});

// Enable JSON request body parsing (up to 20MB for photo uploads)
app.use(express.json({ limit: '20mb' }));

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');

// Ensure required directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Helper to read JSON
function readJson(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON safely
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Universal CORS middleware to allow cross-origin requests from VS Code Live Server (port 5500), Vite (port 5173), etc.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Disable caching on all API endpoints so updates reflect immediately
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 0. Server Status Endpoint (used for real-time heartbeat sync)
app.get('/api/status', (req, res) => {
  const services = readJson(SERVICES_FILE, []);
  const profile = readJson(PROFILE_FILE, {});
  const serviceIds = services.map(s => s.id).join(',');
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    servicesCount: services.length,
    servicesHash: `${services.length}_${serviceIds.slice(0, 50)}`,
    profileName: profile.name || 'શાસ્ત્રીજી જીતેન્દ્ર જોષી'
  });
});

// ================= API ENDPOINTS ================= //

// 1. Get all Pooja services
app.get('/api/services', (req, res) => {
  const services = readJson(SERVICES_FILE, []);
  res.json(services);
});

// Server-side deity image resolver
const DEITY_MAP = [
  { keywords: ['સરસ્વતી', 'શારદા', 'વીણા', 'saraswati', 'sharada'], url: 'assets/images/card-saraswati.png' },
  { keywords: ['વિષ્ણુ', 'નારાયણ', 'લક્ષ્મીનારાયણ', 'vishnu', 'narayan'], url: 'assets/images/card-vishnu.png' },
  { keywords: ['ગણેશ', 'ગણપતિ', 'વિનાયક', 'ganesh', 'ganpati'], url: 'assets/images/card-ganesh.png' },
  { keywords: ['લક્ષ્મી', 'મહાલક્ષ્મી', 'ધનતેરસ', 'lakshmi', 'laxmi'], url: 'assets/images/card-lakshmi.png' },
  { keywords: ['શિવ', 'મહાદેવ', 'રુદ્ર', 'રુદ્રાભિષેક', 'shiva', 'mahadev', 'rudra'], url: 'assets/images/card-shiva.png' },
  { keywords: ['સત્યનારાયણ', 'satyanarayan'], url: 'assets/images/card-satyanarayan.png' },
  { keywords: ['હનુમાન', 'મારુતિ', 'બજરંગબલી', 'hanuman'], url: 'assets/images/card-hanuman.png' },
  { keywords: ['દુર્ગા', 'અંબા', 'નવચંડી', 'ચંડી', 'durga', 'amba'], url: 'assets/images/card-durga.png' },
  { keywords: ['કૃષ્ણ', 'કાનહા', 'જન્માષ્ટમી', 'krishna'], url: 'assets/images/card-krishna.png' },
  { keywords: ['રામ', 'રામચંદ્ર', 'રામદરબાર', 'ram'], url: 'assets/images/card-ram.png' },
  { keywords: ['નવગ્રહ', 'સૂર્ય', 'navgrah', 'surya'], url: 'assets/images/card-navgrah.png' },
  { keywords: ['વાસ્તુ', 'ગૃહપ્રવેશ', 'vastu', 'gruhpravesh'], url: 'assets/images/card-gruhpravesh.png' },
  { keywords: ['હવન', 'યજ્ઞ', 'havan', 'yajna'], url: 'assets/images/card-havan.png' },
  { keywords: ['વિવાહ', 'લગ્ન', 'vivah', 'wedding'], url: 'assets/images/card-vivah.png' }
];

function resolveServerDeityImage(title = '', category = '') {
  const query = `${title || ''} ${category || ''}`.toLowerCase();
  for (const item of DEITY_MAP) {
    if (item.keywords.some(k => query.includes(k.toLowerCase()))) {
      return item.url;
    }
  }
  return 'assets/images/card-anyapooja.png';
}

// 2. Add new Pooja service
app.post('/api/services', (req, res) => {
  const services = readJson(SERVICES_FILE, []);
  const resolvedThumbnail = req.body.thumbnailUrl || resolveServerDeityImage(req.body.title, req.body.category);
  const newService = {
    id: req.body.id || `service_${Date.now()}`,
    ...req.body,
    thumbnailUrl: resolvedThumbnail,
    createdAt: new Date().toISOString()
  };
  services.unshift(newService);
  if (writeJson(SERVICES_FILE, services)) {
    res.status(201).json(newService);
  } else {
    res.status(500).json({ error: 'ડેટા સેવ કરવામાં ભૂલ આવી' });
  }
});

// 3. Update existing Pooja service
app.put('/api/services/:id', (req, res) => {
  const services = readJson(SERVICES_FILE, []);
  const index = services.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'પૂજા મળી નથી' });
  }
  const resolvedThumbnail = req.body.thumbnailUrl || services[index].thumbnailUrl || resolveServerDeityImage(req.body.title || services[index].title, req.body.category || services[index].category);
  const updated = {
    ...services[index],
    ...req.body,
    thumbnailUrl: resolvedThumbnail,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  services[index] = updated;
  if (writeJson(SERVICES_FILE, services)) {
    res.json(updated);
  } else {
    res.status(500).json({ error: 'ડેટા અપડેટ કરવામાં ભૂલ આવી' });
  }
});

// 4. Delete Pooja service
app.delete('/api/services/:id', (req, res) => {
  let services = readJson(SERVICES_FILE, []);
  const initialLength = services.length;
  services = services.filter(s => s.id !== req.params.id);
  if (services.length === initialLength) {
    return res.status(404).json({ error: 'પૂજા મળી નથી' });
  }
  if (writeJson(SERVICES_FILE, services)) {
    res.json({ success: true, message: 'પૂજા સફળતાપૂર્વક ડિલીટ થઈ' });
  } else {
    res.status(500).json({ error: 'ડેટા ડિલીટ કરવામાં ભૂલ આવી' });
  }
});

// 5. Get Shastriji Profile & Settings
app.get('/api/profile', (req, res) => {
  const profile = readJson(PROFILE_FILE, {});
  res.json(profile);
});

// 6. Update Shastriji Profile & Settings
app.put('/api/profile', (req, res) => {
  const current = readJson(PROFILE_FILE, {});
  const updated = { ...current, ...req.body };
  if (writeJson(PROFILE_FILE, updated)) {
    res.json(updated);
  } else {
    res.status(500).json({ error: 'પ્રોફાઈલ અપડેટ કરવામાં ભૂલ આવી' });
  }
});

// 7. Base64 Image Upload API
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) return res.status(400).json({ error: 'ઈમેજ ડેટા મળ્યો નથી' });

    // Extract base64 data
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'અમાન્ય ઈમેજ ફોર્મેટ' });
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const safeName = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : `upload_${Date.now()}.${cleanExt}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
    const relativeUrl = `assets/uploads/${safeName}`;

    res.json({ url: relativeUrl, success: true });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'ઈમેજ અપલોડ નિષ્ફળ થઈ' });
  }
});

// 8. PaddleOCR (Python VENV) Image Scanning API
app.post('/api/ocr/scan', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'ઈમેજ ડેટા મળ્યો નથી' });

    // Step A: Attempt fast proxy to Python PaddleOCR daemon on port 5001 if active
    const http = require('http');
    const tryProxyToPython = () => new Promise((resolve, reject) => {
      const payload = JSON.stringify({ image });
      const reqPy = http.request({
        hostname: '127.0.0.1',
        port: 5001,
        path: '/api/ocr/scan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 4000
      }, (resPy) => {
        let data = '';
        resPy.on('data', chunk => data += chunk);
        resPy.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      reqPy.on('error', reject);
      reqPy.on('timeout', () => {
        reqPy.destroy();
        reject(new Error('Python daemon timeout'));
      });
      reqPy.write(payload);
      reqPy.end();
    });

    try {
      const pyResult = await tryProxyToPython();
      if (pyResult && pyResult.success) {
        return res.json(pyResult);
      }
    } catch (daemonErr) {
      // Daemon not running on port 5001, proceed to on-demand CLI execution
    }

    // Step B: On-demand CLI execution using venv/Scripts/python.exe
    const { execFile } = require('child_process');
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(image, 'base64');

    const tempScanFile = path.join(__dirname, `temp_scan_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
    fs.writeFileSync(tempScanFile, buffer);

    // Locate Python inside venv
    const venvPythonWin = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
    const venvPythonNix = path.join(__dirname, 'venv', 'bin', 'python');
    const pythonExe = fs.existsSync(venvPythonWin) ? venvPythonWin : (fs.existsSync(venvPythonNix) ? venvPythonNix : 'python');
    const scriptPath = path.join(__dirname, 'ocr_service.py');

    execFile(pythonExe, [scriptPath, '--file', tempScanFile], { maxBuffer: 10 * 1024 * 1024, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }, (err, stdout, stderr) => {
      // Always cleanup temp scan file
      if (fs.existsSync(tempScanFile)) {
        try { fs.unlinkSync(tempScanFile); } catch (e) {}
      }

      if (err) {
        console.error('Python OCR execution error:', err, stderr);
        return res.status(500).json({ error: 'OCR પ્રોસેસિંગ નિષ્ફળ થઈ', details: stderr || err.message });
      }

      try {
        // Find JSON block in stdout
        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
          const parsedRes = JSON.parse(jsonStr);
          return res.json(parsedRes);
        }
        res.status(500).json({ error: 'OCR આઉટપુટ ફોર્મેટ અમાન્ય છે' });
      } catch (parseErr) {
        console.error('OCR output parse error:', parseErr, stdout);
        res.status(500).json({ error: 'OCR ડેટા પારસિંગ નિષ્ફળ' });
      }
    });

  } catch (err) {
    console.error('Scan endpoint error:', err);
    res.status(500).json({ error: 'સર્વર એરર' });
  }
});

// ================= STATIC FILES & ROUTING ================= //

// Serve static assets from project root
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm']
}));

// Direct route for /admin and /admin/
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback all other GET requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`શાસ્ત્રીજી પોર્ટલ સર્વર લાઈવ છે: http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => console.log('HTTP server closed'));
});

