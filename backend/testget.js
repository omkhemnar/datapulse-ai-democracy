fetch('http://localhost:5001/api/schemes')
  .then(r => r.json())
  .then(d => {
    console.log(`\nVerification Test: Loaded ${d.length} schemes from DB.`);
    if(d.length > 0) console.log('Sample scheme:', d[0].name, '| Cluster:', d[0].cluster);
  })
  .catch(console.error);
