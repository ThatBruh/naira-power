import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import DashboardStats from './components/DashboardStats';
import HistoryTable from './components/HistoryTable';
import type { User, UtilityLog, AnalysisResult, Family } from './types';
import * as storageService from './services/storageService';
import { analyzeUtilityUsage } from './services/geminiService';
import { LogOut, Plus, Sparkles, X, Lightbulb, Copy, Users, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [logs, setLogs] = useState<UtilityLog[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersListOpen, setIsMembersListOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Data State
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    units: '',
    amount: '',
    previousReading: ''
  });

  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Check for existing session
    const user = storageService.getCurrentUserSession();
    if (user) {
      setCurrentUser(user);
      if (user.familyId) {
        const family = storageService.getFamily(user.familyId);
        setCurrentFamily(family);
        if (family) {
          setLogs(storageService.getLogs(family.id));
        }
      }
    }
  }, []);

  // Effect to load family members when family changes
  useEffect(() => {
    if (currentFamily) {
        const members = storageService.getUsers(currentFamily.memberIds);
        setFamilyMembers(members);
    }
  }, [currentFamily]);

  const handleLogin = (user: User) => {
    storageService.saveUserSession(user);
    setCurrentUser(user);
    
    if (user.familyId) {
      const family = storageService.getFamily(user.familyId);
      setCurrentFamily(family);
      if (family) {
        setLogs(storageService.getLogs(family.id));
      }
    }
  };

  const handleOnboardingComplete = (user: User, family: Family) => {
    storageService.saveUserSession(user);
    setCurrentUser(user);
    setCurrentFamily(family);
    setLogs(storageService.getLogs(family.id));
  };

  const handleLogout = () => {
    storageService.clearUserSession();
    setCurrentUser(null);
    setCurrentFamily(null);
    setLogs([]);
    setAnalysis(null);
    setShowAnalysis(false);
    setFamilyMembers([]);
  };

  const handleCopyCode = () => {
    if (currentFamily) {
        navigator.clipboard.writeText(currentFamily.inviteCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDeleteLog = (id: string) => {
    if (!currentUser || !currentFamily) return;
    
    if (window.confirm("Are you sure you want to delete this record?")) {
      const updatedLogs = storageService.deleteLog(id, currentFamily.id);
      setLogs(updatedLogs);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentFamily) return;

    const newLog: UtilityLog = {
      id: Date.now().toString(),
      familyId: currentFamily.id,
      userId: currentUser.id,
      userName: currentUser.name,
      date: formData.date,
      units: parseFloat(formData.units),
      amount: parseFloat(formData.amount),
      previousReading: parseFloat(formData.previousReading),
      createdAt: Date.now()
    };

    const updatedLogs = storageService.addLog(newLog);
    setLogs(updatedLogs);
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      units: '',
      amount: '',
      previousReading: ''
    });
    setIsFormOpen(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    // Add small delay for UX if api is too fast
    const result = await analyzeUtilityUsage(logs);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Show onboarding if logged in but no family
  if (!currentFamily || !currentUser.familyId) {
    return <Onboarding user={currentUser} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 p-1.5 rounded-lg text-white">
                <Sparkles size={20} fill="currentColor" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">NairaPower</span>
            </div>
            
            {/* Family Invite Code Badge */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 mr-2 uppercase tracking-wider">Family Code</span>
                <span className="font-mono font-bold text-gray-800 mr-2">{currentFamily.inviteCode}</span>
                <button 
                    onClick={handleCopyCode}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy Code"
                >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                <span className="text-xs text-gray-500">{currentFamily.name}</span>
              </div>
              <button 
                onClick={() => setIsMembersListOpen(true)}
                className="relative group transition-transform hover:scale-105"
                title="View Family Members"
              >
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="h-9 w-9 rounded-full border border-gray-200 group-hover:border-blue-300"
                />
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Mobile Family Code Display */}
        <div className="md:hidden flex justify-center">
             <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 mr-2 uppercase">Code:</span>
                <span className="font-mono font-bold text-gray-800 mr-3">{currentFamily.inviteCode}</span>
                <button 
                    onClick={handleCopyCode}
                    className="text-gray-400 hover:text-blue-600"
                >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {currentFamily.name} Dashboard
                <button 
                    onClick={() => setIsMembersListOpen(true)}
                    className="text-xs font-normal text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                    title="View Members"
                >
                    <Users size={12} /> {currentFamily.memberIds.length} members
                </button>
            </h1>
            <p className="text-gray-500">Track and manage your household energy consumption together.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleAnalyze}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Sparkles size={18} />
              AI Insights
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95"
            >
              <Plus size={18} />
              New Recharge
            </button>
          </div>
        </div>

        {/* AI Analysis Section */}
        {showAnalysis && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
            <button 
              onClick={() => setShowAnalysis(false)} 
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles size={24} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Gemini Energy Insights</h3>
                {isAnalyzing ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                ) : (
                  analysis && (
                    <div className="space-y-4">
                      <p className="text-indigo-50 leading-relaxed font-light">{analysis.summary}</p>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-white/80">
                          <Lightbulb size={16} /> Savings Tips
                        </h4>
                        <ul className="space-y-2">
                          {analysis.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-indigo-50">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
          </div>
        )}

        {/* Stats */}
        <DashboardStats logs={logs} />

        {/* History */}
        <HistoryTable logs={logs} onDelete={handleDeleteLog} />
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">New Recharge Entry</h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Recharge</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 [color-scheme:light]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 5000"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units (kWh)</label>
                  <input
                    type="number"
                    name="units"
                    placeholder="e.g. 120.5"
                    required
                    step="0.1"
                    min="0"
                    value={formData.units}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Meter Reading</label>
                <input
                  type="number"
                  name="previousReading"
                  placeholder="e.g. 14500.50"
                  required
                  min="0"
                  step="0.01"
                  value={formData.previousReading}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">The value on the meter before loading credit.</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors shadow-lg active:scale-[0.98]"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List Modal */}
      {isMembersListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={18} />
                Family Members
              </h3>
              <button 
                onClick={() => setIsMembersListOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-2 max-h-96 overflow-y-auto">
              {familyMembers.length > 0 ? (
                <div className="space-y-1">
                  {familyMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-10 h-10 rounded-full border border-gray-200" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {member.name} 
                          {member.id === currentUser?.id && <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">You</span>}
                          {currentFamily?.creatorId === member.id && <span className="ml-2 text-xs font-normal text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Admin</span>}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                    Loading members...
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500">Share invite code <span className="font-mono font-bold text-gray-700">{currentFamily?.inviteCode}</span> to add more</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
