const axios = require('axios');

(async () => {
  try {
    const url = 'https://api.myscheme.gov.in/search/v6/schemes?lang=en&size=3&from=0&sort=multiple_sort&q=%5B%7B%22identifier%22%3A%22level%22%2C%22value%22%3A%22State%22%7D%2C%7B%22identifier%22%3A%22beneficiaryState%22%2C%22value%22%3A%22Maharashtra%22%7D%5D';
    console.log('Fetching:', url);
    const { data } = await axios.get(url, {
      headers: {
        'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
        'origin': 'https://www.myscheme.gov.in',
        'accept': 'application/json'
      }
    });
    
    console.log('\n--- SUCCESS ---');
    console.log(`Total Schemes matching Maharashtra:`, data?.data?.totalElements || data?.total);
    console.log(`Hits length:`, data?.data?.hits?.length);
    
    const hit = data?.data?.hits?.[0] || data?.data?.[0];
    if (hit) {
      console.log('Sample Data Structure:\n', JSON.stringify(hit, null, 2).substring(0, 800));
    }
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
})();
