// Simple test for categories endpoint
const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:SGvG01BZ';

async function testCategoriesEndpoint() {
  try {
    console.log('Testing categories endpoint...');
    
    const response = await fetch(`${API_BASE}/categoria_producto`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (!response.ok) {
      console.error('❌ Error:', response.status, text);
      return;
    }
    
    try {
      const data = JSON.parse(text);
      console.log('✅ Categories data:', data);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testCategoriesEndpoint();