const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const url = require('url');
const cors = require('cors');
const extractData = require('./module/extractor');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON with increased payload limit
app.use(bodyParser.json({ limit: '10mb' }));

// Enable CORS
app.use(cors());

app.post('/save-html', async (req, res) => {
  console.log('Received request to save HTML');
  const { html, pageUrl, timestamp } = req.body;

  if (!html || !pageUrl || !timestamp) {
    console.error('Invalid request: HTML, pageUrl or timestamp is missing');
    return res.status(400).send('HTML content, page URL and timestamp are required');
  }

  // Extract structured data from HTML
  const structuredData = extractData(html);
  console.log('Extracted structured data:', structuredData);

  // Use the same docId for both careerPages and savedUrls
  let docId;
  try {
    // Extract the last segment of the path as the career name
    const parsedUrl = url.parse(pageUrl);
    let pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    let careerName = pathParts[pathParts.length - 1] || 'untitled';
    // Clean the career name for Firestore document ID
    docId = careerName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    console.log('Document ID (career name):', docId);
    // Save structuredData to Firestore with career name as document ID
    await db.collection('careerPages').doc(docId).set({
      ...structuredData,
      pageUrl,
      timestamp
    });
    console.log('Structured data saved to Firestore');
  } catch (e) {
    console.error('Error saving to Firestore:', e);
    return res.status(500).send('Failed to save structured data to Firestore');
  }

  // Save URL and timestamp to a separate Firestore collection (savedUrls) using the same docId
  try {
    await db.collection('savedUrls').doc(docId).set({
      pageUrl,
      timestamp
    });
    console.log('URL saved to Firestore collection savedUrls with docId:', docId);
  } catch (e) {
    console.error('Error saving URL to Firestore:', e);
    // Not a critical error, so don't return 500
  }

  res.send('HTML extracted, structured JSON and URL saved to Firestore successfully');
});

// Endpoint to save HTML
// app.post('/save-html', (req, res) => {
//   console.log('Received request to save HTML');
//   console.log('Request body:', req.body);
//   const { html, pageUrl , timestamp } = req.body;

//   if (!html || !pageUrl || !timestamp) {
//     console.error('Invalid request: HTML, pageUrl or timestamp is missing');
//     return res.status(400).send('HTML content, page URL and timestamp are required');
//   }

//   const parsedUrl = url.parse(pageUrl);
//   const outputDir = path.join(__dirname, 'output', parsedUrl.pathname);

//   fs.mkdir(outputDir, { recursive: true }, (err) => {
//     if (err) {
//       console.error('Error creating directory:', err);
//       return res.status(500).send('Failed to create directory');
//     }

//     const filePath = path.join(outputDir, 'page.html');

//     fs.writeFile(filePath, html, (err) => {
//       if (err) {
//         console.error('Error saving HTML:', err);
//         return res.status(500).send('Failed to save HTML');
//       }

//       // Save the pageUrl in a JSON file
//       const urlsFile = path.join(__dirname, 'saved_urls.json');
//       let urls = [];
//       if (fs.existsSync(urlsFile)) {
//         try {
//           const data = fs.readFileSync(urlsFile, 'utf8');
//           urls = JSON.parse(data);
//         } catch (e) {
//           console.error('Error reading saved_urls.json:', e);
//         }
//       }
//       // Avoid duplicates by checking pageUrl
//       if (!urls.some(entry => entry.pageUrl === pageUrl)) {
//         urls.push({ pageUrl, timestamp });
//         try {
//           fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
//         } catch (e) {
//           console.error('Error writing saved_urls.json:', e);
//         }
//       }

//       res.send('HTML saved successfully');
//     });
//   });
// });

// app.post('/edu-save', (req, res) => {
//   console.log('Received request to save HTML');
//   console.log('Request body:', req.body);
//   const { html, pageUrl, parentDirectory } = req.body;

//   if (!html || !pageUrl || !parentDirectory) {
//     console.error('Invalid request: HTML, pageUrl, or parentDirectory is missing');
//     return res.status(400).send('HTML content, page URL, and parent directory are required');
//   }

//   const parsedUrl = url.parse(pageUrl);
//   const lastSegment = parsedUrl.pathname.split('/').filter(Boolean).pop();
//   const outputDir = path.join(__dirname, 'output', 'career-library', parentDirectory, lastSegment);

//   fs.mkdir(outputDir, { recursive: true }, (err) => {
//     if (err) {
//       console.error('Error creating directory:', err);
//       return res.status(500).send('Failed to create directory');
//     }

//     const fileName = parsedUrl.pathname.split('/').pop();
//     const filePath = path.join(outputDir, `${fileName}.html`);

//     fs.writeFile(filePath, html, (err) => {
//       if (err) {
//         console.error('Error saving HTML:', err);
//         return res.status(500).send('Failed to save HTML');
//       }

//       res.send('HTML saved successfully');
//     });
//    });
// });


// Serve saved_urls.json statically for frontend
app.get('/saved_urls.json', (req, res) => {
  const urlsFile = path.join(__dirname, 'saved_urls.json');
  if (fs.existsSync(urlsFile)) {
    res.sendFile(urlsFile);
  } else {
    res.status(404).json([]);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
