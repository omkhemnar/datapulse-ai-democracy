const fs = require('fs');
const filepath = './frontend/src/pages/CitizenMobilePage.jsx';
let pt = fs.readFileSync(filepath, 'utf8');

// Fix JSX syntax variables
pt = pt.replace(/\{t\.([a-zA-Z]+)\}/g, "{t('$1')}");
pt = pt.replace(/label:\s*t\.([a-zA-Z]+)/g, "label: t('$1')");

// Fix eligibleList array state correctly backwards to recommended
pt = pt.replace(/const \[eligibleList, setEligibleList\] = useState\(\[\]\);/g, "const [recommended, setRecommended] = useState([]);");
pt = pt.replace(/eligibleList/g, "recommended");

// Tab routing corrections
pt = pt.replace(/activeTab === 'eligible'/g, "activeTab === 'recommended'");

const oldNav = `        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
            { id: 'eligible', icon: Star, label: t('eligibleSchemes') },
            { id: 'all', icon: List, label: t('allSchemes') },
            { id: 'eligibility', icon: CheckCircle2, label: t('eligibility') },
            { id: 'feedback', icon: MessageSquare, label: t('feedback') },
            { id: 'profile', icon: User, label: t('profile') }
          ].map((item) => (`;

const newNav = `        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard', 'Dashboard') },
            ...(voterData 
              ? [{ id: 'recommended', icon: Star, label: t('recommendedSchemes', 'Recommended Schemes') }]
              : [{ id: 'all', icon: List, label: t('allSchemes', 'All Schemes') }]),
            { id: 'eligibility', icon: CheckCircle2, label: t('eligibility', 'Eligibility') },
            { id: 'feedback', icon: MessageSquare, label: t('feedback', 'Feedback') },
            { id: 'profile', icon: User, label: t('profile', 'Profile') }
          ].map((item) => (`;

pt = pt.replace(oldNav, newNav);

const oldCards = `                  <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('recommended')}>
                    <CardContent className="p-6">
                      <Star className="w-8 h-8 text-amber-500 mb-4" />
                      <h3 className="font-bold text-lg mb-1">{t('eligibleSchemes')}</h3>
                      <p className="text-slate-500 text-sm">{voterData ? \`\${recommended.length} \${t('matchesFoundText')}\` : 'Offline Mode Active'}</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('all')}>
                    <CardContent className="p-6">
                      <List className="w-8 h-8 text-blue-500 mb-4" />
                      <h3 className="font-bold text-lg mb-1">{t('allSchemes')}</h3>
                      <p className="text-slate-500 text-sm">Browse {allSchemes.length} live government integrations</p>
                    </CardContent>
                  </Card>`;

const newCards = `                  {voterData ? (
                    <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('recommended')}>
                      <CardContent className="p-6">
                        <Star className="w-8 h-8 text-amber-500 mb-4" />
                        <h3 className="font-bold text-lg mb-1">{t('recommendedSchemes', 'Recommended Schemes')}</h3>
                        <p className="text-slate-500 text-sm">{voterData ? \`\${recommended.length} Matches Found\` : 'Offline Mode Active'}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('all')}>
                      <CardContent className="p-6">
                        <List className="w-8 h-8 text-blue-500 mb-4" />
                        <h3 className="font-bold text-lg mb-1">{t('allSchemes', 'All Schemes')}</h3>
                        <p className="text-slate-500 text-sm">Browse {allSchemes.length} live government integrations</p>
                      </CardContent>
                    </Card>
                  )}`;

if(pt.includes(oldCards)) {
  pt = pt.replace(oldCards, newCards);
} else {
  // Try regex on cards
}

pt = pt.replace(/t\('eligibleSchemes'\)/g, "t('recommendedSchemes', 'Recommended Schemes')");

fs.writeFileSync(filepath, pt, 'utf8');
console.log('Script Success.');
