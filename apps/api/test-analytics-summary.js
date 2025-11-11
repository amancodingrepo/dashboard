/**
 * Test script for /api/analytics/summary endpoint
 * Run this after starting the API server with: npm run dev
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4001,
  path: '/api/analytics/summary',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing GET /api/analytics/summary...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response Headers:', res.headers);
    console.log('\nResponse Body:');
    
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      // Validate response structure
      console.log('\n--- Validation ---');
      const requiredFields = ['totalFiles', 'validatedFiles', 'unvalidatedFiles', 'totalSizeKB', 'avgConfidence'];
      const missingFields = requiredFields.filter(field => !(field in jsonData));
      
      if (missingFields.length === 0) {
        console.log('✓ All required fields present');
        console.log(`✓ Total Files: ${jsonData.totalFiles}`);
        console.log(`✓ Validated Files: ${jsonData.validatedFiles}`);
        console.log(`✓ Unvalidated Files: ${jsonData.unvalidatedFiles}`);
        console.log(`✓ Total Size (KB): ${jsonData.totalSizeKB}`);
        console.log(`✓ Average Confidence: ${jsonData.avgConfidence}`);
      } else {
        console.log('✗ Missing fields:', missingFields);
      }
    } catch (e) {
      console.log('Raw response:', data);
      console.error('Failed to parse JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\nMake sure the API server is running on port 4001');
  console.log('Start it with: cd apps/api && npm run dev');
});

req.end();
