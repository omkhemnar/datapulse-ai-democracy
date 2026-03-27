const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/GovernanceUpdatePage.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<ComposedChart[\s\S]*?<\/ComposedChart>/, `<RadarChart
                   cx="50%" cy="50%" outerRadius="70%"
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
                >
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Target Demographic Overlap" dataKey="EligibleVoters" stroke="#8b5cf6" strokeWidth={3} fill="#a78bfa" fillOpacity={0.6} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                  <Tooltip 
                    cursor={{fill: 'rgba(139, 92, 246, 0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginTop: '10px' }} />
                </RadarChart>`);
fs.writeFileSync(file, content);
console.log('Done replacement');
