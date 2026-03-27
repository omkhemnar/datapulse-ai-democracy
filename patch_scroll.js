const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/VoterSegmentationPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('className="space-y-5 h-[580px] overflow-y-auto pr-3 custom-scrollbar"', 'className="space-y-5 h-[580px] overflow-y-scroll pr-3 custom-scrollbar"');

fs.writeFileSync(file, content);
console.log('Done scroll patch');
