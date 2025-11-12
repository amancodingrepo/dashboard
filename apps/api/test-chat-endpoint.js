const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:4001';

async function testChatEndpoint() {
  console.log('Testing Chat Endpoint:', `${API_URL}/api/chat-with-data\n`);

  const testQueries = [
    'Show top 5 vendors',
    'Total spend',
    'Overdue invoices',
    'What is the total spend?',
    'List top vendors by spend'
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n📝 Testing query: "${query}"`);
      console.log('─'.repeat(50));
      
      const response = await axios.post(`${API_URL}/api/chat-with-data`, {
        query: query
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Status:', response.status);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      // Validate response structure
      if (!response.data.hasOwnProperty('answer')) {
        console.error('❌ Missing "answer" field');
      }
      if (!response.data.hasOwnProperty('success')) {
        console.error('❌ Missing "success" field');
      }
      if (!Array.isArray(response.data.results)) {
        console.error('❌ "results" is not an array');
      } else {
        console.log(`✅ Results count: ${response.data.results.length}`);
        if (response.data.results.length > 0) {
          console.log('📋 First result:', JSON.stringify(response.data.results[0], null, 2));
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing query "${query}":`);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('   No response received - Server may not be running');
        console.error('   Error message:', error.message);
        console.error('   Code:', error.code);
        if (error.code === 'ECONNREFUSED') {
          console.error('   💡 Make sure the API server is running on port 4001');
        }
      } else {
        console.error('   Error:', error.message);
        console.error('   Stack:', error.stack);
      }
    }
  }

  // Test error cases
  console.log('\n\n🔍 Testing Error Cases:');
  console.log('─'.repeat(50));
  
  // Test empty query
  try {
    console.log('\n📝 Testing empty query');
    const response = await axios.post(`${API_URL}/api/chat-with-data`, {
      query: ''
    });
    console.log('⚠️  Should have returned 400, but got:', response.status);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly returned 400 for empty query');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }

  // Test missing query
  try {
    console.log('\n📝 Testing missing query field');
    const response = await axios.post(`${API_URL}/api/chat-with-data`, {});
    console.log('⚠️  Should have returned 400, but got:', response.status);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly returned 400 for missing query');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

// Run tests
testChatEndpoint()
  .then(() => {
    console.log('\n\n✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n\n❌ Test suite failed:', error);
    process.exit(1);
  });

