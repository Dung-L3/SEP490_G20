// DEBUG: Test API endpoints
console.log('🔍 Testing API endpoints...');

// Test dishApi
fetch('/api/dishes/active')
  .then(res => {
    console.log('✅ Dishes API status:', res.status);
    return res.json();
  })
  .then(data => console.log('✅ Dishes data:', data))
  .catch(err => console.error('❌ Dishes API error:', err));

// Test categories API  
fetch('/api/v1/categories/getAll')
  .then(res => {
    console.log('✅ Categories API status:', res.status);
    return res.json();
  })
  .then(data => console.log('✅ Categories data:', data))
  .catch(err => console.error('❌ Categories API error:', err));

// Test order API
fetch('/api/v1/orders/getAll')
  .then(res => {
    console.log('✅ Orders API status:', res.status);
    return res.json();
  })
  .then(data => console.log('✅ Orders data:', data))
  .catch(err => console.error('❌ Orders API error:', err));