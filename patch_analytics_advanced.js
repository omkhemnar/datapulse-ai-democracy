const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/AnalyticsDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure RadialBarChart and related imports exist
if (!content.includes('RadialBarChart, ')) {
  content = content.replace("AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell", "AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar");
  
  if (!content.includes('RadialBarChart')) {
    // Fallback if the exact import string differs
    content = content.replace("import { AreaChart", "import { RadialBarChart, RadialBar, AreaChart");
  }
}

const boothReplacement = `<AreaChart data={mappedBooths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBoothWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(14, 165, 233, 0.4)', strokeWidth: 2, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorBoothWave)" activeDot={{ r: 8, strokeWidth: 0, fill: '#0ea5e9' }} />
                </AreaChart>`;

const pieReplacement = `<RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="100%" barSize={18} data={mappedGroups}>
                  <RadialBar
                    minAngle={15}
                    background={{ fill: '#f1f5f9' }}
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  >
                    {mappedGroups.map((entry, index) => {
                      const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </RadialBar>
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                </RadialBarChart>`;

content = content.replace(/<BarChart data=\{mappedBooths\}[\s\S]*?<\/BarChart>/, boothReplacement);
content = content.replace(/<PieChart>[\s\S]*?<\/PieChart>/, pieReplacement);

fs.writeFileSync(file, content);
console.log('Done advanced graphs');
