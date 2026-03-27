fetch('http://localhost:5001/api/send-notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cluster: 'Farmers' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
