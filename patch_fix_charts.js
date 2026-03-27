const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/AnalyticsDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const blockRegex = /<h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Gender Indexing<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)$/;

const replacement = `<h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Gender Indexing</h3>
          <div className="h-64 w-full">
            {Object.keys(genderData).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Pie data={Object.entries(genderData).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {Object.entries(genderData).map(([gender], index) => {
                      const colors = { Male: '#3b82f6', Female: '#ec4899', Other: '#8b5cf6' };
                      return <Cell key={\`cell-\${index}\`} fill={colors[gender] || '#94a3b8'} />;
                    })}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Booth Localization Depth</h3>
          <div className="h-64">
            {boothData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mappedBooths} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28}>
                    {mappedBooths.map((entry, index) => {
                      const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0 flex flex-col items-center">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Segment Distribution</h3>
          <div className="h-64 w-full">
            {groupSummary.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    itemStyle={{ fontWeight: 600, color: '#334155' }}
                  />
                  <Pie data={mappedGroups} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none" cornerRadius={6}>
                    {mappedGroups.map((entry, index) => {
                      const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                      return <Cell key={\`cell-\${index}\`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
`;

content = content.replace(blockRegex, replacement);
fs.writeFileSync(file, content);
console.log('Restored and Fixed Charts');
