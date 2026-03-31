const express = require('express');
const https   = require('https');
const router  = express.Router();

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    const get = (targetUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    };
    get(url);
  });
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { columns: [], rows: [] };

  const parseRow = (line) => {
    const fields = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        let field = '';
        i++;
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
          else if (line[i] === '"') { i++; break; }
          else { field += line[i++]; }
        }
        fields.push(field);
        if (line[i] === ',') i++;
      } else {
        let field = '';
        while (i < line.length && line[i] !== ',') field += line[i++];
        fields.push(field);
        if (line[i] === ',') i++;
      }
    }
    return fields;
  };

  const columns = parseRow(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseRow(line);
    const obj = {};
    columns.forEach((col, idx) => { obj[col] = values[idx] ?? ''; });
    return obj;
  });

  return { columns, rows };
}

router.get('/registrations', async (req, res) => {
  const url = process.env.SHEETS_CSV_URL;
  if (!url) {
    return res.status(500).json({ error: 'SHEETS_CSV_URL is not configured' });
  }
  try {
    const csv = await fetchCsv(url);
    const { columns, rows } = parseCsv(csv);
    console.log('Sheet columns:', columns);
    res.json({ columns, rows });
  } catch (err) {
    console.error('Error fetching registrations:', err.message);
    res.status(502).json({ error: `Failed to fetch sheet: ${err.message}` });
  }
});

module.exports = router;
