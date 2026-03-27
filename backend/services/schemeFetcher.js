const fs = require('fs');
const path = require('path');
const Scheme = require('../models/Scheme');

async function fetchSchemes() {
  console.log('Loading statically compiled internal MyScheme dataset...');
  
  let hardcodedSchemes = [];
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '..', 'data', 'master_schemes.json'), 'utf8');
    hardcodedSchemes = JSON.parse(rawData);
    console.log(`Successfully mapped ${hardcodedSchemes.length} core datasets.`);
  } catch (err) {
    console.error('Critical Failure: Could not load master_schemes.json payload. Verify path allocation.', err.message);
    return 0;
  }

  let updatedCount = 0;
  for (const s of hardcodedSchemes) {
    try {
      // Deleting _id dynamically so mongoose natively assigns/interferes beautifully to the upsert
      const schemePayload = { ...s };
      delete schemePayload._id; 
      
      await Scheme.findOneAndUpdate(
        { name: s.name },
        { ...schemePayload, lastUpdated: Date.now() },
        { upsert: true, new: true }
      );
      updatedCount++;
    } catch(err) {
      console.error(`Error mapping statically integrated Scheme ${s.name}:`, err.message);
    }
  }
  
  console.log(`Successfully integrated ${updatedCount} native hardcoded endpoints securely.`);
  return updatedCount;
}

module.exports = { fetchSchemes };
