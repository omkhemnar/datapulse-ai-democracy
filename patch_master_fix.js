const fs = require('fs');
const file = 'c:/Users/SAINATH/datapulse-ai-democracy/frontend/src/pages/AnalyticsDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const blockRegex = /<h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Gender Indexing<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)$/;

const replacement = '<h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Gender Indexing</h3>\\n' +
'          <div className="h-64 w-full">\\n' +
'            {Object.keys(genderData).length ? (\\n' +
'              <ResponsiveContainer width="100%" height="100%">\\n' +
'                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={18} data={Object.entries(genderData).map(([name, value], i) => { const colors=["#f59e0b", "#ec4899", "#8b5cf6"]; return {name, value, fill: colors[i%colors.length]}; })}>\\n' +
'                  <RadialBar minAngle={15} background={{ fill: "#f1f5f9" }} clockWise dataKey="value" cornerRadius={10} />\\n' +
'                  <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />\\n' +
'                  <Tooltip cursor={{fill: "transparent"}} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />\\n' +
'                </RadialBarChart>\\n' +
'              </ResponsiveContainer>\\n' +
'            ) : (\\n' +
'              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>\\n' +
'            )}\\n' +
'          </div>\\n' +
'        </div>\\n' +
'      </div>\\n' +
'      <div className="grid md:grid-cols-2 gap-6 mb-12">\\n' +
'        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0">\\n' +
'          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Booth Localization Depth</h3>\\n' +
'          <div className="h-64">\\n' +
'            {boothData.length ? (\\n' +
'              <ResponsiveContainer width="100%" height="100%">\\n' +
'                <BarChart data={mappedBooths} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>\\n' +
'                  <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />\\n' +
'                  <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />\\n' +
'                  <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", backgroundColor: "rgba(255, 255, 255, 0.98)" }} itemStyle={{ fontWeight: 600, color: "#334155" }} />\\n' +
'                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28}>\\n' +
'                    {mappedBooths.map((entry, index) => {\\n' +
'                      const colors = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];\\n' +
'                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;\\n' +
'                    })}\\n' +
'                  </Bar>\\n' +
'                </BarChart>\\n' +
'              </ResponsiveContainer>\\n' +
'            ) : (\\n' +
'              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>\\n' +
'            )}\\n' +
'          </div>\\n' +
'        </div>\\n' +
'        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0 flex flex-col items-center">\\n' +
'          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Segment Distribution</h3>\\n' +
'          <div className="h-64 w-full">\\n' +
'            {groupSummary.length ? (\\n' +
'              <ResponsiveContainer width="100%" height="100%">\\n' +
'                <PieChart>\\n' +
'                  <Tooltip cursor={{fill: "transparent"}} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", backgroundColor: "rgba(255, 255, 255, 0.95)" }} itemStyle={{ fontWeight: 600, color: "#334155" }} />\\n' +
'                  <Pie data={mappedGroups} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none" cornerRadius={6}>\\n' +
'                    {mappedGroups.map((entry, index) => {\\n' +
'                      const colors = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];\\n' +
'                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;\\n' +
'                    })}\\n' +
'                  </Pie>\\n' +
'                </PieChart>\\n' +
'              </ResponsiveContainer>\\n' +
'            ) : (\\n' +
'              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>\\n' +
'            )}\\n' +
'          </div>\\n' +
'        </div>\\n' +
'      </div>\\n' +
'    </div>\\n' +
'  )\\n';

content = content.replace(blockRegex, replacement);
fs.writeFileSync(file, content);
console.log('Restored all graph components exactly!');
