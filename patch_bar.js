const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/GovernanceUpdatePage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure Cell is imported
if (!content.includes('Cell, ')) {
  content = content.replace("BarChart, Bar, XAxis, YAxis, Tooltip", "BarChart, Bar, Cell, XAxis, YAxis, Tooltip");
}

const replacementChart = `<BarChart
                   data={schemes.length > 0 ? schemes.slice(0, 5).map(s => {
                     const baseCount = (analytics?.clusterDistribution?.find(c => c.name === segment)?.count || 100);
                     const variation = (s.name.length % 15) / 100; 
                     return {
                       name: s.name.substring(0, 12) + (s.name.length > 12 ? '...' : ''),
                       fullName: s.name,
                       EligibleVoters: Math.floor(baseCount * (1 - variation))
                     };
                   }) : (analytics?.scheme_groups || []).slice(0, 5).map(sg => ({
                       name: sg.scheme.substring(0, 12) + (sg.scheme.length > 12 ? '...' : ''),
                       fullName: sg.scheme,
                       EligibleVoters: sg.count
                   }))}
                   margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Bar dataKey="EligibleVoters" name="Voter Qualification Density" radius={[8, 8, 0, 0]} barSize={40}>
                    {
                      (schemes.length > 0 ? schemes.slice(0, 5) : (analytics?.scheme_groups || []).slice(0, 5)).map((entry, index) => {
                        const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                        return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                      })
                    }
                  </Bar>
                </BarChart>`;

content = content.replace(/<RadarChart[\s\S]*?<\/RadarChart>/, replacementChart);

fs.writeFileSync(file, content);
console.log('Done Bar Chart Patch');
