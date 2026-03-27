const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/AnalyticsDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Cell, ')) {
  content = content.replace("BarChart, Bar, XAxis, YAxis, Tooltip", "BarChart, Bar, Cell, XAxis, YAxis, Tooltip");
}

const barReplacement = `<BarChart data={mappedBooths} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={34}>
                    {mappedBooths.map((entry, index) => {
                      const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>`;

const pieReplacement = `<PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Pie data={mappedGroups} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                    {mappedGroups.map((entry, index) => {
                      const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                </PieChart>`;

content = content.replace(/<BarChart data=\{mappedBooths\}[\s\S]*?<\/BarChart>/, barReplacement);
content = content.replace(/<PieChart>[\s\S]*?<\/PieChart>/, pieReplacement);

fs.writeFileSync(file, content);
console.log('Done fixing graphs');
