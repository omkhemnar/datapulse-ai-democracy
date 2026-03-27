const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-700': 'text-slate-700 dark:text-slate-200',
  'bg-white': 'bg-white dark:bg-slate-800',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'bg-primary-50': 'bg-primary-50 dark:bg-primary-900/30',
  'text-primary-700': 'text-primary-700 dark:text-primary-300',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/20',
  'border-amber-200': 'border-amber-200 dark:border-amber-800/30',
  'text-amber-800': 'text-amber-800 dark:text-amber-400'
};

for (const [key, val] of Object.entries(replacements)) {
  content = content.split(key).join(val);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated AdminDashboard.jsx colors for dark mode.');
