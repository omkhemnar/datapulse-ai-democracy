const fs = require('fs');
const file = fs.readFileSync('c:/Users/SAINATH/datapulse-ai-democracy/original_analytics.jsx');;
let lines = file.toString('utf16le').split('\\n');
console.log(lines.slice(225, 335).join('\\n'));
