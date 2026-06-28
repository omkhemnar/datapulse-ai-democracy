import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  LayoutDashboard, Star, List, Shield, MessageSquare, 
  User, Bookmark, ExternalLink, Moon, Sun, Search, 
  Languages, Menu, CheckCircle2, ChevronRight, X, AlertCircle, ArrowRight,
  Users, Plus, Trash2, Edit3, MapPin
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { 
  submitFeedback, getAllSchemes, getSchemesByCluster,
  addFamilyMember, getFamilyMembers, updateFamilyMember, deleteFamilyMember, getFamilyMemberSchemes 
} from '../api';

import { useTranslation } from 'react-i18next';

// Reusable Document Checklist and Local Helpdesk Locator Sub-Component
function DocumentChecklist({ scheme, boothId }) {
  const docs = scheme.documents && scheme.documents.length > 0 && scheme.documents[0] !== 'N/A'
    ? scheme.documents
    : ['Aadhaar Card', 'Ration Card', 'Government Issued Photo ID'];

  const [checkedDocs, setCheckedDocs] = useState({});

  const handleToggle = (doc) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((checkedCount / docs.length) * 100);

  return (
    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-left">
      <div className="flex justify-between items-center">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Document Checklist</h5>
        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{checkedCount} of {docs.length} Ready ({progressPercent}%)</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
        <div className="bg-primary-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="space-y-1.5 pt-1">
        {docs.map((doc, idx) => (
          <label key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={!!checkedDocs[doc]} 
              onChange={() => handleToggle(doc)}
              className="w-3.5 h-3.5 rounded text-primary-600 focus:ring-primary-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
            />
            <span className={checkedDocs[doc] ? 'line-through text-slate-450 dark:text-slate-500 font-medium' : 'font-medium'}>{doc}</span>
          </label>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
          <MapPin className="w-3 h-3 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h6 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Assigned Local Helpdesk</h6>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Community Hall, Booth Center #{boothId || '101'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Email: officer_{boothId || '101'}@boothintelligence.gov.in</p>
        </div>
      </div>
    </div>
  );
}

export default function CitizenMobilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();

  // Authentication State
  const voterData = location.state?.voterData || null;
  const rawName = location.state?.name || localStorage.getItem('voterName') || null;
  const voterId = location.state?.voterId || 'UNREGISTERED';
  const displayTitle = rawName ? rawName : (voterData?.Name || 'Citizen');

  // Language Framework
  const { t, i18n } = useTranslation();

  const cycleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : i18n.language === 'hi' ? 'mr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Data State
  const [allSchemes, setAllSchemes] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [savedSchemes, setSavedSchemes] = useState([]);
  
  // Feedback State
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Family Welfare State
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form fields
  const [memberName, setMemberName] = useState('');
  const [memberRelationship, setMemberRelationship] = useState('Son');
  const [memberAge, setMemberAge] = useState('');
  const [memberGender, setMemberGender] = useState('Male');
  const [memberEducation, setMemberEducation] = useState('High School');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberState, setMemberState] = useState(voterData?.state || 'Maharashtra');
  const [memberIncomeCategory, setMemberIncomeCategory] = useState('General');
  const [memberDisability, setMemberDisability] = useState('No');
  const [memberExistingBeneficiary, setMemberExistingBeneficiary] = useState('');

  // Selected member schemes view
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberEligibleSchemes, setMemberEligibleSchemes] = useState([]);
  const [memberUpcomingSchemes, setMemberUpcomingSchemes] = useState([]);
  const [loadingMemberSchemes, setLoadingMemberSchemes] = useState(false);

  useEffect(() => {
    if (voterId && voterId !== 'UNREGISTERED' && activeTab === 'family') {
      getFamilyMembers(voterId)
        .then(data => setFamilyMembers(data || []))
        .catch(console.error);
    }
  }, [voterId, activeTab]);

  const handleOpenAddForm = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberRelationship('Son');
    setMemberAge('');
    setMemberGender('Male');
    setMemberEducation('High School');
    setMemberOccupation('');
    setMemberState(voterData?.state || 'Maharashtra');
    setMemberIncomeCategory('General');
    setMemberDisability('No');
    setMemberExistingBeneficiary('');
    setShowMemberForm(true);
  };

  const handleOpenEditForm = (member) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberRelationship(member.relationship);
    setMemberAge(member.age);
    setMemberGender(member.gender);
    setMemberEducation(member.education);
    setMemberOccupation(member.occupation || '');
    setMemberState(member.state);
    setMemberIncomeCategory(member.incomeCategory);
    setMemberDisability(member.disability);
    setMemberExistingBeneficiary(member.existingSchemeBeneficiary || '');
    setShowMemberForm(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberAge || !memberEducation) {
      alert('Please fill in Name, Age, and Education.');
      return;
    }

    const payload = {
      voterId,
      name: memberName,
      relationship: memberRelationship,
      age: parseInt(memberAge),
      gender: memberGender,
      education: memberEducation,
      occupation: memberOccupation,
      state: memberState,
      incomeCategory: memberIncomeCategory,
      disability: memberDisability,
      existingSchemeBeneficiary: memberExistingBeneficiary
    };

    try {
      if (editingMember) {
        await updateFamilyMember(editingMember._id, payload);
      } else {
        await addFamilyMember(payload);
      }
      // Refresh list
      const updatedList = await getFamilyMembers(voterId);
      setFamilyMembers(updatedList || []);
      setShowMemberForm(false);
      setEditingMember(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save family member.');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this family member?')) return;
    try {
      await deleteFamilyMember(id);
      setFamilyMembers(prev => prev.filter(m => m._id !== id));
      if (selectedMember?._id === id) {
        setSelectedMember(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete family member.');
    }
  };

  const handleViewSchemes = async (member) => {
    setSelectedMember(member);
    setLoadingMemberSchemes(true);
    try {
      const res = await getFamilyMemberSchemes(member._id);
      setMemberEligibleSchemes(res.eligible || []);
      setMemberUpcomingSchemes(res.upcoming || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch schemes for family member.');
    } finally {
      setLoadingMemberSchemes(false);
    }
  };

  useEffect(() => {
    // Fetch all schemes
    getAllSchemes().then(data => setAllSchemes(data || [])).catch(console.error);
    
    // Case 1 logic: If Voter is mapped, fetch tailored recommended schemes
    if (voterData && voterData.name) {
      getSchemesByCluster(voterData.name).then(data => {
        setRecommended(data || []);
      }).catch(console.error);
    }
  }, [voterData]);

  const handleToggleSave = (schemeId) => {
    if (savedSchemes.includes(schemeId)) {
      setSavedSchemes(prev => prev.filter(id => id !== schemeId));
    } else {
      setSavedSchemes(prev => [...prev, schemeId]);
    }
  };

  const submitLocalFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      await submitFeedback({ msg: feedback, rating: 5, booth: voterData?.BoothID || 'Voter App' });
      setFeedback('');
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('voterName');
    navigate('/voter-login', { replace: true });
  };

  // ------------------------------------------------------------------
  // UI Sub-Components
  // ------------------------------------------------------------------
  const SchemeCard = ({ scheme, isRecommended }) => {
    const [showChecklist, setShowChecklist] = useState(false);
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        <div className={`h-2 flex-none w-full ${isRecommended ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} />
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight pr-4">{t(scheme.name)}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm ${scheme.type === 'Central' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300'}`}>
                  {t(scheme.type)} {scheme.state !== 'All' ? `(${t(scheme.state)})` : ''}
                </span>
              </div>
            </div>
            {isRecommended && (
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> {t('match98')}
              </span>
            )}
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-none">{t(scheme.description)}</p>
          
          <div className="space-y-4 mb-6 flex-1">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 mb-1">{t('benefits')}</h4>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{t(scheme.benefits)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-550 mb-1">{t('timeline')}</h4>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{scheme.startDate || 'N/A'} - {scheme.endDate === 'Ongoing' ? t('Ongoing', 'Ongoing') : (scheme.endDate || t('Ongoing', 'Ongoing'))}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-550 mb-1">{t('reqDocs')}</h4>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2" title={scheme.documents?.join(', ')}>
                  {scheme.documents?.length ? scheme.documents.join(', ') : t('notSpecified')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-555 mb-1">{t('requirements')}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{t(scheme.eligibility || 'Refer to official portal for detailed inclusion limits.')}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {scheme.tags?.slice(0, 4).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {showChecklist && <DocumentChecklist scheme={scheme} boothId={voterData?.BoothID} />}

          <div className="flex flex-none flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button 
              variant="outline" 
              className="w-full text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-500/10 hover:bg-primary-50 dark:hover:bg-primary-950/20 py-2 rounded-xl"
              onClick={() => setShowChecklist(prev => !prev)}
            >
              {showChecklist ? 'Hide Checklist & Helpdesk' : 'View Checklist & Helpdesk'}
            </Button>
            <div className="flex gap-3">
              <Button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20" onClick={() => window.open(scheme.link || 'https://myscheme.gov.in', '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" /> {t('apply')}
              </Button>
              <Button variant="outline" className="shrink-0 p-3 border-slate-200 dark:border-slate-600" onClick={() => handleToggleSave(scheme._id)}>
                <Bookmark className={`w-5 h-5 ${savedSchemes.includes(scheme._id) ? 'fill-primary-500 text-primary-500' : 'text-slate-500'}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FamilySchemeCard = ({ scheme, boothId }) => {
    const [showChecklist, setShowChecklist] = useState(false);
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
        <div>
          <h5 className="font-bold text-slate-950 dark:text-white text-base leading-tight">{scheme.name}</h5>
          <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-sm mt-1.5 inline-block bg-primary-100 text-primary-750 dark:bg-primary-900/40 dark:text-primary-300">
            {scheme.category}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">{scheme.description}</p>
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60 mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Benefits</p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{scheme.benefits}</p>
          </div>
        </div>

        {showChecklist && <DocumentChecklist scheme={scheme} boothId={boothId} />}

        <div className="mt-4 space-y-2">
          <Button 
            variant="outline" 
            className="w-full text-xs font-bold text-primary-600 dark:text-primary-400 border border-primary-500/10 hover:bg-primary-50 dark:hover:bg-primary-950/20 py-2 rounded-xl"
            onClick={() => setShowChecklist(prev => !prev)}
          >
            {showChecklist ? 'Hide Checklist & Helpdesk' : 'View Checklist & Helpdesk'}
          </Button>
          <Button className="w-full bg-primary-600 text-white hover:bg-primary-700 py-2 text-sm" onClick={() => window.open(scheme.link || 'https://myscheme.gov.in', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" /> Apply Now
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:relative z-40 inset-y-0 left-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 w-72 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {(sidebarOpen || window.innerWidth < 1024) && <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 truncate">{t('projectTitle')}</span>}
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard', 'Dashboard') },
            { id: 'all', icon: List, label: t('allSchemes', 'All Schemes') },
            { id: 'eligibility', icon: CheckCircle2, label: t('eligibility', 'Eligibility Core') },
            { id: 'family', icon: Users, label: t('familyWelfare', 'Family Welfare') },
            { id: 'feedback', icon: MessageSquare, label: t('feedback', 'Feedback') },
            { id: 'profile', icon: User, label: t('profile', 'Profile') }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${(sidebarOpen || window.innerWidth < 1024) ? 'justify-start' : 'justify-center'} ${
                activeTab === item.id 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold shadow-sm ring-1 ring-primary-500/20' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(sidebarOpen || window.innerWidth < 1024) && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden sm:block text-lg font-medium">
              <span className="text-slate-400 dark:text-slate-500 mr-2">{t('welcome')},</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">{displayTitle}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={cycleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium">
              <Languages className="w-4 h-4 text-slate-600 dark:text-slate-300" /> <span className="text-slate-700 dark:text-slate-300">{i18n.language.toUpperCase()}</span>
            </button>
            <button onClick={toggle} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {dark ? <Sun className="w-5 h-5 text-slate-300" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <Button variant="ghost" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={handleLogout}>
              {t('logout')}
            </Button>
          </div>
        </header>

        {/* Dynamic Route Rendering */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/50 dark:bg-[#0b1120]">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {activeTab === 'dashboard' && (
              <>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-xl shadow-primary-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">{t('welcome')}, {displayTitle}!</h2>
                    <p className="text-primary-100 text-lg mb-8">{t('accessPersonalized')}</p>
                    <div className="flex gap-4">
                      <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 !text-white font-bold transition-all shadow-lg px-8 py-4 text-lg inline-flex items-center" onClick={() => setActiveTab('all')}>
                        {t('viewAllSchemesBtn')} <ChevronRight className="w-5 h-5 ml-2 stroke-[3]" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('eligibility')}>
                    <CardContent className="p-6">
                      <Star className="w-8 h-8 text-amber-500 mb-4" />
                       <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{t('eligibility', 'Eligibility Core')}</h3>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">{voterData ? `${recommended.length} ${t('matchesFoundText')}` : t('offlineModeActive')}</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('family')}>
                    <CardContent className="p-6">
                      <Users className="w-8 h-8 text-emerald-500 mb-4" />
                       <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{t('familyWelfare', 'Family Welfare')}</h3>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">{t('manageFamilyDesc', 'Manage family members and tailored welfare schemes')}</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:border-primary-500 transition-colors cursor-pointer" onClick={() => setActiveTab('all')}>
                    <CardContent className="p-6">
                      <List className="w-8 h-8 text-blue-500 mb-4" />
                       <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">{t('allSchemes')}</h3>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">{t('browseLive')} ({allSchemes.length})</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === 'all' && (
              <div className="space-y-6 animate-in fly-in-bottom-2 fade-in duration-300">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <h2 className="text-2xl font-bold">{t('allSchemes')}</h2>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="search" 
                      placeholder={t('search')} 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/60">
                  {['All', 'Central', 'State', 'Farmers', 'Women', 'Students', 'Senior', 'Health', 'Workers'].map(filter => (
                     <button 
                       key={filter}
                       onClick={() => setActiveFilter(filter)}
                       className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                         activeFilter === filter 
                           ? 'bg-primary-600 text-white shadow-md transform scale-105' 
                           : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
                       }`}
                     >
                       {filter}
                     </button>
                  ))}
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6 pt-2">
                  {allSchemes.filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                    const matchesFilter = activeFilter === 'All' || 
                                          s.type?.toLowerCase() === activeFilter.toLowerCase() ||
                                          s.tags?.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase()) || (activeFilter === 'Farmers' && tag.toLowerCase().includes('agri'))) || 
                                          s.category?.toLowerCase().includes(activeFilter.toLowerCase());
                    return matchesSearch && matchesFilter;
                  }).map(s => (
                    <SchemeCard key={s._id} scheme={s} isRecommended={false} />
                  ))}
                  {allSchemes.length > 0 && allSchemes.filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                    const matchesFilter = activeFilter === 'All' || 
                                          s.type?.toLowerCase() === activeFilter.toLowerCase() ||
                                          s.tags?.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase()) || (activeFilter === 'Farmers' && tag.toLowerCase().includes('agri'))) || 
                                          s.category?.toLowerCase().includes(activeFilter.toLowerCase());
                    return matchesSearch && matchesFilter;
                  }).length === 0 && (
                     <p className="text-slate-500 italic py-8 text-center col-span-2">{t('noSchemesMatched')}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'eligibility' && (
              <div className="space-y-6 animate-in fly-in-bottom-2 fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{t('eligibility', 'Eligibility Core')}</h2>
                  {voterData && (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium px-3 py-1 rounded-full text-sm">
                      {recommended.length} {t('matches')}
                    </span>
                  )}
                </div>
                
                {voterData ? (
                  <div className="space-y-6">
                    <Card className="hidden">
                      <CardHeader title={t('howAIAssigned')} subtitle={t('understandingDemo')} />
                      <CardContent>
                        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                           <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-emerald-400 to-primary-500" />
                           <h3 className="text-lg font-bold mb-2">{t('computedCluster')}: <span className="text-primary-600 dark:text-primary-400">{voterData.name}</span></h3>
                           <p className="text-slate-600 dark:text-slate-400 text-sm">
                             {t('aiPipelineMatched')} <strong>"{voterData.name}"</strong> {t('segmentSpanning')} {voterData.count} {t('regionalVoters')} 
                             {t('clusterMapped')} <strong>{recommended.length}</strong> {t('officialDatasets')}
                           </p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                           {voterData.top_words?.slice(0, 4).map((word, i) => (
                             <div key={i} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center border-b-2 border-primary-500">
                               <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{t('vectorField')} {i+1}</p>
                               <p className="font-semibold">{word}</p>
                             </div>
                           ))}
                        </div>
                      </CardContent>
                    </Card>

                    <h3 className="text-xl font-bold mt-8 mb-4">{t('yourEligibleSchemes')}</h3>
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/60">
                      {['All', 'Central', 'State'].map(filter => (
                         <button 
                           key={filter}
                           onClick={() => setActiveFilter(filter)}
                           className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                             activeFilter === filter 
                               ? 'bg-primary-600 text-white shadow-md transform scale-105' 
                               : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
                           }`}
                         >
                           {filter}
                         </button>
                      ))}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                      {recommended.filter(s => {
                        return activeFilter === 'All' || s.type?.toLowerCase() === activeFilter.toLowerCase();
                      }).map(s => <SchemeCard key={s._id} scheme={s} isRecommended={true} />)}
                      {recommended.filter(s => {
                        return activeFilter === 'All' || s.type?.toLowerCase() === activeFilter.toLowerCase();
                      }).length === 0 && <p className="text-slate-500 italic py-8 text-center col-span-2">{t('noFiltersSchemes')}</p>}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardHeader title="How AI Assigned You" subtitle="Understanding your demographic pipeline" />
                    <CardContent>
                      <div className="p-10 rounded-3xl bg-slate-50/50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('schemesNotAvailable')}</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">{t('couldNotMap')}</p>
                        <Button onClick={() => setActiveTab('all')} className="bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold py-3 px-6 shadow-xl">
                          {t('goToAllSchemes')} <ArrowRight className="w-4 h-4 ml-2 inline" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto space-y-6 mt-4">
                <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">{t('profileMetadata')}</h2>
                <Card className="overflow-hidden border-0 shadow-2xl relative">
                  <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 absolute top-0 w-full" />
                  <div className="relative pt-16 px-8 pb-8 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 p-2 shadow-xl mb-4">
                       <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-primary-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl font-bold text-primary-700 dark:text-white">
                         {displayTitle.charAt(0).toUpperCase()}
                       </div>
                    </div>
                     <h3 className="text-2xl font-bold capitalize mb-1 text-slate-900 dark:text-white">{displayTitle}</h3>
                    <p className="text-slate-500 px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-sm tracking-widest">{voterId}</p>
                    
                    <div className="w-full mt-10 grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <p className="text-xs uppercase font-bold text-slate-400 mb-1">{t('computedCluster')}</p>
                         <p className="font-medium text-slate-900 dark:text-white">{voterData ? voterData.name : t('unassigned')}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                         <p className="text-xs uppercase font-bold text-slate-400 mb-1">{t('targetBooth')}</p>
                         <p className="font-medium text-slate-900 dark:text-white">{voterData ? `${t('booth')} ${voterData.BoothID}` : t('generalOffline')}</p>
                       </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="space-y-6 animate-in fly-in-bottom-2 fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('familyWelfare', 'Family Welfare')}</h2>
                  {!showMemberForm && (
                    <Button onClick={handleOpenAddForm} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 shadow-md">
                      <Plus className="w-4 h-4 mr-2" /> Add Family Member
                    </Button>
                  )}
                </div>

                {showMemberForm ? (
                  <Card>
                    <CardHeader 
                      title={editingMember ? "Edit Family Member" : "Add Family Member"} 
                      subtitle="Enter your family member details to compute scheme eligibility" 
                    />
                    <CardContent>
                      <form onSubmit={handleSaveMember} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                            <input 
                              type="text" 
                              value={memberName} 
                              onChange={(e) => setMemberName(e.target.value)} 
                              placeholder="Enter full name"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Relationship</label>
                            <select 
                              value={memberRelationship} 
                              onChange={(e) => setMemberRelationship(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                            >
                              {['Son', 'Daughter', 'Father', 'Mother', 'Spouse', 'Grandparent', 'Other'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
                            <input 
                              type="number" 
                              value={memberAge} 
                              onChange={(e) => setMemberAge(e.target.value)} 
                              placeholder="Age"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                            <select 
                              value={memberGender} 
                              onChange={(e) => setMemberGender(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                            >
                              {['Male', 'Female', 'Other'].map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">State</label>
                            <input 
                              type="text" 
                              value={memberState} 
                              onChange={(e) => setMemberState(e.target.value)} 
                              placeholder="e.g. Maharashtra"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Education</label>
                            <input 
                              type="text" 
                              value={memberEducation} 
                              onChange={(e) => setMemberEducation(e.target.value)} 
                              placeholder="e.g. High School, Graduate"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Occupation (optional)</label>
                            <input 
                              type="text" 
                              value={memberOccupation} 
                              onChange={(e) => setMemberOccupation(e.target.value)} 
                              placeholder="e.g. Student, Farmer"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Income Category</label>
                            <select 
                              value={memberIncomeCategory} 
                              onChange={(e) => setMemberIncomeCategory(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                            >
                              {['Low', 'Medium', 'High', 'EWS', 'LIG', 'MIG', 'General'].map(i => (
                                <option key={i} value={i}>{i}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Disability</label>
                            <select 
                              value={memberDisability} 
                              onChange={(e) => setMemberDisability(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                            >
                              {['Yes', 'No'].map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Existing Scheme Beneficiary (optional)</label>
                            <input 
                              type="text" 
                              value={memberExistingBeneficiary} 
                              onChange={(e) => setMemberExistingBeneficiary(e.target.value)} 
                              placeholder="e.g. PM-KISAN"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                          <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 text-base shadow-md">
                            {editingMember ? 'Update Profile' : 'Save Profile'}
                          </Button>
                          <Button type="button" variant="outline" className="flex-1 py-3 text-base border-slate-200 dark:border-slate-600" onClick={() => { setShowMemberForm(false); setEditingMember(null); }}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {familyMembers.length === 0 ? (
                      <div className="p-12 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center">
                        <Users className="w-16 h-16 text-slate-400 mb-4 stroke-[1.5]" />
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">No Family Members Added</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">Start managing your family's welfare benefits by adding your first family member profile.</p>
                        <Button onClick={handleOpenAddForm} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 shadow-md">
                          <Plus className="w-4 h-4 mr-2" /> Add Family Member
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {familyMembers.map(member => (
                          <Card key={member._id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-bold text-slate-950 dark:text-white capitalize">{member.name}</h4>
                                  <span className="px-2.5 py-0.5 bg-primary-100 text-primary-850 dark:bg-primary-900/40 dark:text-primary-300 text-xs font-bold rounded-full mt-1.5 inline-block">
                                    {member.relationship}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleOpenEditForm(member)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 transition">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteMember(member._id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 hover:text-rose-700 transition">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 pb-4 border-b border-slate-100 dark:border-slate-750">
                                <div><strong>Age:</strong> {member.age} yrs</div>
                                <div><strong>Gender:</strong> {member.gender}</div>
                                <div><strong>Education:</strong> {member.education}</div>
                                <div><strong>Occupation:</strong> {member.occupation || 'N/A'}</div>
                                <div><strong>State:</strong> {member.state}</div>
                                <div><strong>Disability:</strong> {member.disability}</div>
                              </div>
                              <Button onClick={() => handleViewSchemes(member)} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5">
                                View Eligible Schemes
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {selectedMember && (
                      <Card className="mt-8 border-primary-500/50 ring-1 ring-primary-500/20">
                        <CardHeader 
                          title={`Eligible Schemes for ${selectedMember.name}`} 
                          subtitle="Tailored recommendations based on profile metrics" 
                        />
                        <CardContent className="space-y-6">
                          {loadingMemberSchemes ? (
                            <div className="p-8 text-center animate-pulse text-slate-500">Evaluating eligibility criteria...</div>
                          ) : (
                            <>
                              <div>
                                <h4 className="text-base font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">Currently Eligible Schemes ({memberEligibleSchemes.length})</h4>
                                {memberEligibleSchemes.length === 0 ? (
                                  <p className="text-slate-500 italic p-4 text-center">No currently eligible schemes found based on active profile filters.</p>
                                ) : (
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {memberEligibleSchemes.map(scheme => (
                                      <FamilySchemeCard key={scheme._id} scheme={scheme} boothId={voterData?.BoothID} />
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-500">Upcoming Eligible Schemes</h4>
                                <p className="text-xs text-slate-400 mb-4">Milestones based on future age-progression criteria</p>
                                
                                {memberUpcomingSchemes.length === 0 ? (
                                  <p className="text-slate-550 italic p-4 text-center">No future age-based progression milestones determined.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {memberUpcomingSchemes.map((item, idx) => (
                                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <div>
                                          <p className="font-bold text-sm text-slate-900 dark:text-white">{item.scheme.name}</p>
                                          <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">{item.scheme.category}</p>
                                        </div>
                                        <span className="px-3.5 py-1 bg-amber-150 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-full text-xs shrink-0">
                                          {item.message}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="max-w-xl mx-auto space-y-6 mt-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t('haveConcern')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('submitSecure')}</p>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('yourMessage')}</label>
                        <textarea 
                          rows={5}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder={t('detailGovernance')}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                        />
                      </div>
                      <Button className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold text-lg" disabled={!feedback.trim()} onClick={submitLocalFeedback}>
                        {feedbackSent ? <><CheckCircle2 className="w-5 h-5 mr-2" /> {t('sentSuccessfully')}</> : t('submitFeedbackBtn')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
