import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, FileText, PieChart, Settings } from 'lucide-react';

const TimeTracker = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('timeTrackerDarkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else {
	      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('timeTrackerDarkMode', newMode.toString());
  };

  return (
    <div className={`max-w-6xl mx-auto rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${darkMode ? 'bg-slate-800 text-gray-100' : 'bg-white text-gray-800'}`}>
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-semibold">Time Tracker</h1>
        <button 
          onClick={toggleDarkMode}
          className="bg-transparent border-none text-white p-2 rounded-full"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <div className={`flex sticky top-0 z-10 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'} border-b`}>
        <TabButton 
          icon={<Clock size={20} />}
          label="Čas"
          active={activeTab === 'timer'}
          onClick={() => setActiveTab('timer')}
          darkMode={darkMode}
        />
        <TabButton 
          icon={<DollarSign size={20} />}
          label="Finance"
          active={activeTab === 'finances'}
          onClick={() => setActiveTab('finances')}
          darkMode={darkMode}
        />
        <TabButton 
          icon={<FileText size={20} />}
          label="Dluhy"
          active={activeTab === 'debts'}
          onClick={() => setActiveTab('debts')}
          darkMode={darkMode}
        />
        <TabButton 
          icon={<PieChart size={20} />}
          label="Přehled"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
          darkMode={darkMode}
        />
        <TabButton 
          icon={<Settings size={20} />}
          label="Nastavení"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          darkMode={darkMode}
        />
      </div>
      
      <div className="p-6">
        {activeTab === 'timer' && <TimerTab darkMode={darkMode} />}
        {activeTab === 'finances' && <FinancesTab darkMode={darkMode} />}
        {activeTab === 'debts' && <DebtsTab darkMode={darkMode} />}
        {activeTab === 'dashboard' && <DashboardTab darkMode={darkMode} />}
        {activeTab === 'settings' && <SettingsTab darkMode={darkMode} />}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ icon, label, active, onClick, darkMode }) => {
  return (
    <button 
      className={`flex-1 py-4 px-2 flex flex-col items-center gap-2 relative transition-all ${
        active 
          ? `${darkMode ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-600'}` 
          : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {active && (
        <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-blue-600 rounded-t"></div>
      )}
    </button>
  );
};

// Timer Tab Component
const TimerTab = ({ darkMode }) => {
  const [records, setRecords] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [worker, setWorker] = useState('maruska');
  const [category, setCategory] = useState('wellness');
  const [subcategory, setSubcategory] = useState('');
  const [earnings, setEarnings] = useState({ total: 0, deduction: 0, net: 0 });
  
  const animationRef = React.useRef();
  const startTimeRef = React.useRef(0);
  
  useEffect(() => {
    const savedRecords = localStorage.getItem('timeTrackerRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    localStorage.setItem('timeTrackerRecords', JSON.stringify(records));
  }, [records]);
  
  const startAnimation = () => {
    const animate = () => {
      const newCurrentTime = Date.now() - startTimeRef.current;
      setCurrentTime(newCurrentTime);
      
      // Calculate earnings
      const hours = newCurrentTime / (1000 * 60 * 60);
      if (worker === 'maruska') {
        setEarnings({
          total: Math.round(hours * 275),
          deduction: Math.round(hours * 275 / 3),
          net: Math.round(hours * 275 * 2/3)
        });
      } else {
        setEarnings({
          total: Math.round(hours * 400),
          deduction: Math.round(hours * 400 / 2),
          net: Math.round(hours * 400 / 2)
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const startTimer = () => {
    if (isPaused) {
      // Continue from pause
      startTimeRef.current = Date.now() - pausedTime;
      setIsPaused(false);
    } else {
      // Start new timer
      setIsRunning(true);
      startTimeRef.current = Date.now() - currentTime;
    }
    startAnimation();
  };
  
  const pauseTimer = () => {
    cancelAnimationFrame(animationRef.current);
    setIsPaused(true);
    setPausedTime(currentTime);
  };
  
  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    cancelAnimationFrame(animationRef.current);
    
    // Add new record
    const newRecord = {
      id: Date.now(),
      worker,
      category,
      subcategory,
      duration: currentTime,
      date: new Date().toISOString(),
      amount: earnings
    };
    
    setRecords([newRecord, ...records]);
    setCurrentTime(0);
    setEarnings({ total: 0, deduction: 0, net: 0 });
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    cancelAnimationFrame(animationRef.current);
    setCurrentTime(0);
    setEarnings({ total: 0, deduction: 0, net: 0 });
  };
  
  const formatTime = (time) => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };
  
  const timerPercentage = Math.min(100, (currentTime / (60 * 60 * 1000)) * 100);
  
  const categories = [
    { id: 'wellness', name: 'Wellness' },
    { id: 'villa-prep', name: 'Příprava vily' },
    { id: 'calls', name: 'Pracovní hovory' },
    { id: 'cleaning', name: 'Úklid' },
    { id: 'admin', name: 'Administrativa' },
    { id: 'other', name: 'Ostatní' }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Timer Controls */}
      <div className={`p-6 rounded-xl shadow-xl ${darkMode ? 'bg-slate-900/95 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} border ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="mb-4">
          <div className="mb-2 font-medium">Pracovník:</div>
          <div className="flex gap-4">
            <label className={`flex-1 p-3 border rounded-md cursor-pointer transition-all ${
              worker === 'maruska' 
                ? `border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` 
                : `${darkMode ? 'border-slate-700' : 'border-gray-200'}`
            }`}>
              <input
                type="radio"
                name="worker"
                value="maruska"
                checked={worker === 'maruska'}
                onChange={() => setWorker('maruska')}
                disabled={isRunning}
                className="hidden"
              />
              <span>Maruška (275 Kč/h)</span>
            </label>
            <label className={`flex-1 p-3 border rounded-md cursor-pointer transition-all ${
              worker === 'marty' 
                ? `border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}` 
                : `${darkMode ? 'border-slate-700' : 'border-gray-200'}`
            }`}>
              <input
                type="radio"
                name="worker"
                value="marty"
                checked={worker === 'marty'}
                onChange={() => setWorker('marty')}
                disabled={isRunning}
                className="hidden"
              />
              <span>Márty (400 Kč/h)</span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="mb-2 font-medium">Kategorie:</div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isRunning}
            className={`w-full p-3 rounded-md border ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'
            }`}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <div className="mt-2">
            <input
              type="text"
              placeholder="Podkategorie (volitelné)"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={isRunning}
              className={`w-full p-3 rounded-md border ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'
              }`}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          {/* Timer Circle */}
          <div className="w-64 h-64 relative">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: `conic-gradient(#4a6fa5 ${timerPercentage}%, transparent 0)`,
                boxShadow: isRunning && !isPaused ? '0 0 30px rgba(74, 111, 165, 0.7)' : 'none',
                filter: isRunning && !isPaused ? 'drop-shadow(0 0 15px rgba(74, 111, 165, 0.5))' : 'none'
              }}
            >
              <div className={`w-4/5 h-4/5 rounded-full flex flex-col items-center justify-center transition-all ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              } ${isRunning && !isPaused ? 'shadow-inner' : 'shadow-md'}`}>
                <div className={`text-3xl font-bold ${isPaused ? 'text-yellow-500' : ''}`}>
                  {formatTime(currentTime)}
                </div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {worker === 'maruska' ? '275 Kč/h' : '400 Kč/h'}
                </div>
                
                <div className="w-full px-4 mt-1">
                  <div className="flex justify-between text-sm">
                    <span>Celkem:</span>
                    <span className={`font-semibold text-green-500 ${isRunning && !isPaused ? 'animate-pulse' : ''}`}>
                      {earnings.total} Kč
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Srážka:</span>
                    <span className={`font-semibold text-red-500 ${isRunning && !isPaused ? 'animate-pulse' : ''}`}>
                      {earnings.deduction} Kč
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t border-gray-300">
                    <span>Čistá mzda:</span>
                    <span className={`font-bold text-blue-500 ${isRunning && !isPaused ? 'animate-pulse' : ''}`}>
                      {earnings.net} Kč
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500 bg-opacity-70 flex items-center justify-center animate-pulse shadow-xl">
                  <span className="text-2xl">⏸️</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Timer Controls */}
          <div className="flex gap-4">
            {!isRunning ? (
              <button 
                className="px-6 py-3 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white font-medium flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg hover:shadow-green-500/30"
                onClick={startTimer}
              >
                <span className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                Start
              </button>
            ) : isPaused ? (
              <>
                <button 
                  className="px-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg hover:shadow-blue-500/30"
                  onClick={startTimer}
                >
                  <span className="relative flex h-3 w-3 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  Pokračovat
                </button>
                <button 
                  className="px-6 py-3 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-medium flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg hover:shadow-red-500/30"
                  onClick={stopTimer}
                >
                  <span className="flex items-center justify-center h-3 w-3 mr-1">■</span>
                  Ukončit
                </button>
              </>
            ) : (
              <>
                <button 
                  className="px-6 py-3 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-medium flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg hover:shadow-yellow-500/30"
                  onClick={pauseTimer}
                >
                  <span className="flex items-center justify-center h-3 w-3 mr-1">❚❚</span>
                  Pauza
                </button>
                <button 
                  className="px-6 py-3 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-medium flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg hover:shadow-red-500/30"
                  onClick={stopTimer}
                >
                  <span className="flex items-center justify-center h-3 w-3 mr-1">■</span>
                  Stop
                </button>
              </>
            )}
            {!isRunning && (
              <button 
                className={`px-6 py-3 rounded-md font-medium flex items-center gap-2 transform hover:scale-105 transition-all ${
                  darkMode 
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-gray-300 hover:shadow-slate-700/30' 
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:shadow-gray-200/30'
                } shadow-lg`}
                onClick={resetTimer} 
              >
                <span className="flex items-center justify-center h-3 w-3 mr-1">↻</span>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Records List */}
      <div className={`rounded-lg ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Záznamy</h2>
        </div>
        
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Žádné záznamy k zobrazení
            </div>
          ) : (
            records.map(record => (
              <div 
                key={record.id} 
                className={`p-4 rounded-md flex items-center ${
                  darkMode ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                <div className="w-20 text-sm">
                  {formatDate(record.date)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium">
                    {categories.find(cat => cat.id === record.category)?.name || record.category}
                    {record.subcategory && ` - ${record.subcategory}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {record.worker === 'maruska' ? 'Maruška' : 'Márty'}
                  </div>
                </div>
                
                <div className="mx-4 font-semibold">
                  {formatTime(record.duration)}
                </div>
                
                <div className="mr-4 text-right">
                  <div className="font-semibold">{record.amount.total} Kč</div>
                  <div className="text-sm text-red-500">- {record.amount.deduction} Kč</div>
                  <div className="font-medium">{record.amount.net} Kč</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Finance Tab Component
const FinancesTab = ({ darkMode }) => {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl mb-4">Finance</h2>
      <p>Zde budou zobrazeny finanční přehledy</p>
    </div>
  );
};

// Debts Tab Component
const DebtsTab = ({ darkMode }) => {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl mb-4">Dluhy</h2>
      <p>Zde bude přehled a správa dluhů</p>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ darkMode }) => {
  const records = JSON.parse(localStorage.getItem('timeTrackerRecords') || '[]');
  
  // Calculate total hours by worker
  const hoursByWorker = records.reduce((acc, record) => {
    const worker = record.worker;
    const hours = record.duration / (1000 * 60 * 60);
    
    if (!acc[worker]) acc[worker] = 0;
    acc[worker] += hours;
    
    return acc;
  }, {});
  
  // Calculate total earnings
  const totalEarnings = records.reduce((total, record) => {
    return total + record.amount.total;
  }, 0);
  
  // Calculate total net earnings
  const totalNetEarnings = records.reduce((total, record) => {
    return total + record.amount.net;
  }, 0);
  
  // Calculate total hours
  const totalHours = Object.values(hoursByWorker).reduce((total, hours) => total + hours, 0);
  
  // Calculate hours by category
  const hoursByCategory = records.reduce((acc, record) => {
    const category = record.category;
    const hours = record.duration / (1000 * 60 * 60);
    
    if (!acc[category]) acc[category] = 0;
    acc[category] += hours;
    
    return acc;
  }, {});
  
  // Group records by day for time series
  const recordsByDay = records.reduce((acc, record) => {
    const day = new Date(record.date).toLocaleDateString('cs-CZ');
    
    if (!acc[day]) {
      acc[day] = {
        hours: 0,
        earnings: 0
      };
    }
    
    acc[day].hours += record.duration / (1000 * 60 * 60);
    acc[day].earnings += record.amount.net;
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  const timeSeriesData = Object.entries(recordsByDay)
    .map(([day, data]) => ({
      day,
      ...data
    }))
    .sort((a, b) => {
      const dateA = new Date(a.day.split('.').reverse().join('-'));
      const dateB = new Date(b.day.split('.').reverse().join('-'));
      return dateA - dateB;
    });
  
  // Last 7 days for weekly chart
  const last7Days = timeSeriesData.slice(-7);
  
  // Calculate max values for scaling
  const maxHours = Math.max(...last7Days.map(d => d.hours), 0.1);
  const maxEarnings = Math.max(...last7Days.map(d => d.earnings), 1);
  
  // Category colors map
  const categoryColors = {
    'wellness': 'bg-blue-500',
    'villa-prep': 'bg-green-500',
    'calls': 'bg-yellow-500', 
    'cleaning': 'bg-pink-500',
    'admin': 'bg-purple-500',
    'other': 'bg-gray-500'
  };
  
  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const categories = {
      'wellness': 'Wellness',
      'villa-prep': 'Příprava vily',
      'calls': 'Pracovní hovory',
      'cleaning': 'Úklid',
      'admin': 'Administrativa',
      'other': 'Ostatní'
    };
    
    return categories[categoryId] || categoryId;
  };
  
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-xl shadow-xl bg-gradient-to-br ${
          darkMode ? 'from-slate-800 to-slate-900/90' : 'from-white to-gray-50'
        } border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Clock size={18} className="mr-2 text-blue-500" />
            Celkem odpracováno
          </h3>
          <div className="text-3xl font-bold mb-2 flex items-end">
            {totalHours.toFixed(1)} 
            <span className="text-sm ml-1 mb-1 text-gray-500">hodin</span>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Maruška:</span>
              <span className="font-medium">{(hoursByWorker.maruska || 0).toFixed(1)} h</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-pink-400"
                style={{
                  width: `${totalHours ? Math.min(100, ((hoursByWorker.maruska || 0) / totalHours) * 100) : 0}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Márty:</span>
              <span className="font-medium">{(hoursByWorker.marty || 0).toFixed(1)} h</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-400"
                style={{
                  width: `${totalHours ? Math.min(100, ((hoursByWorker.marty || 0) / totalHours) * 100) : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl shadow-xl bg-gradient-to-br ${
          darkMode ? 'from-slate-800 to-slate-900/90' : 'from-white to-gray-50'
        } border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <DollarSign size={18} className="mr-2 text-green-500" />
            Celkový výdělek
          </h3>
          <div className="text-3xl font-bold mb-2 text-green-500 flex items-end">
            {totalEarnings} 
            <span className="text-sm ml-1 mb-1 text-gray-500">Kč</span>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Čistá mzda:</span>
              <span className="font-medium">{totalNetEarnings} Kč</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-green-400"
                style={{
                  width: `${totalEarnings ? Math.min(100, (totalNetEarnings / totalEarnings) * 100) : 0}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Srážky:</span>
              <span className="font-medium text-red-500">{totalEarnings - totalNetEarnings} Kč</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-red-400"
                style={{
                  width: `${totalEarnings ? Math.min(100, ((totalEarnings - totalNetEarnings) / totalEarnings) * 100) : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl shadow-xl bg-gradient-to-br ${
          darkMode ? 'from-slate-800 to-slate-900/90' : 'from-white to-gray-50'
        } border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <PieChart size={18} className="mr-2 text-indigo-500" />
            Statistika
          </h3>
          <div className="text-3xl font-bold mb-2 flex items-end">
            {records.length}
            <span className="text-sm ml-1 mb-1 text-gray-500">záznamů</span>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between">
              <span className="text-sm">Počet pracovních dnů:</span>
              <span className="font-medium">{Object.keys(recordsByDay).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Průměr na den:</span>
              <span className="font-medium">
                {Object.keys(recordsByDay).length ? (totalHours / Object.keys(recordsByDay).length).toFixed(1) : 0} h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Průměrný výdělek na den:</span>
              <span className="font-medium text-green-500">
                {Object.keys(recordsByDay).length ? Math.round(totalNetEarnings / Object.keys(recordsByDay).length) : 0} Kč
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weekly Activity Chart */}
      <div className={`p-6 rounded-xl shadow-xl ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
        <h3 className="text-lg font-medium mb-6 flex items-center">
          <Clock size={18} className="mr-2 text-blue-500" />
          <span className="mr-2">Týdenní aktivita</span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Posledních 7 dnů
          </span>
        </h3>
        
        <div className="flex items-end space-x-2 md:space-x-4 h-64 mb-8 mt-12 pb-2">
          {last7Days.length === 0 ? (
            <div className="w-full text-center py-16 text-gray-500">
              Žádná aktivita k zobrazení v posledních 7 dnech
            </div>
          ) : (
            last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex justify-center">
                  {/* Hours Bar */}
                  <div className="relative w-10 flex flex-col justify-end items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg relative group-hover:bg-blue-600 transition-all duration-300"
                      style={{ 
                        height: `${Math.min(100, (day.hours / maxHours) * 100)}%`,
                        minHeight: day.hours > 0 ? '8px' : '0'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap transition-opacity z-10">
                        {day.hours.toFixed(1)} h
                      </div>
                    </div>
                  </div>
                  
                  {/* Earnings Bar */}
                  <div className="relative w-10 flex flex-col justify-end items-center -ml-3">
                    <div 
                      className="w-full bg-green-500 rounded-t-lg relative group-hover:bg-green-600 transition-all duration-300"
                      style={{ 
                        height: `${Math.min(100, (day.earnings / maxEarnings) * 100)}%`,
                        minHeight: day.earnings > 0 ? '8px' : '0'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap transition-opacity z-10">
                        {day.earnings} Kč
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs mt-2 text-center w-full">
                  {day.day.split('.').slice(0, 2).join('.')}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-center gap-6 mt-8">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Hodiny</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Výdělek (Kč)</span>
          </div>
        </div>
      </div>
      
      {/* Category Distribution Chart */}
      <div className={`p-6 rounded-xl shadow-xl ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
        <h3 className="text-lg font-medium mb-6 flex items-center">
          <PieChart size={18} className="mr-2 text-indigo-500" />
          Rozdělení práce podle kategorií
        </h3>
        
        {Object.keys(hoursByCategory).length === 0 ? (
          <div className="w-full text-center py-16 text-gray-500">
            Žádná data k zobrazení
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(hoursByCategory).map(([category, hours], index) => {
              const totalHours = Object.values(hoursByCategory).reduce((a, b) => a + b, 0);
              const percentage = (hours / totalHours) * 100;
              const colorClass = categoryColors[category] || 'bg-gray-500';
              
              return (
                <div key={category} className="group">
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${colorClass}`}></div>
                      <span>{getCategoryName(category)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 font-medium">{hours.toFixed(1)} h</span>
                      <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} group-hover:opacity-90 transition-opacity`}>
                    <div
                      className={`h-full rounded-full ${colorClass} relative group-hover:opacity-90 transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute right-0 -top-1 -bottom-1 w-2 rounded-full bg-white opacity-40 group-hover:opacity-0 transition-opacity"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Donut Chart */}
        <div className="mt-8 flex justify-center">
          <div className="w-48 h-48 relative">
            {Object.entries(hoursByCategory).length > 0 && (
              <>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke={darkMode ? '#1e293b' : '#f1f5f9'} strokeWidth="10" />
                  
                  {Object.entries(hoursByCategory).map(([category, hours], index) => {
                    const totalHours = Object.values(hoursByCategory).reduce((a, b) => a + b, 0);
                    const percentage = (hours / totalHours) * 100;
                    
                    // Calculate the stroke dash array and offset
                    const circumference = 2 * Math.PI * 45;
                    const dashArray = circumference;
                    const dashOffset = circumference - (percentage / 100) * circumference;
                    
                    // Calculate the starting position based on previous segments
                    const previousPercentage = Object.entries(hoursByCategory)
                      .slice(0, index)
                      .reduce((acc, [_, h]) => acc + (h / totalHours) * 100, 0);
                    const previousOffset = circumference - (previousPercentage / 100) * circumference;
                    
                    // Map category to color
                    const colors = {
                      'wellness': '#3b82f6', // blue
                      'villa-prep': '#22c55e', // green
                      'calls': '#eab308', // yellow
                      'cleaning': '#ec4899', // pink
                      'admin': '#8b5cf6', // purple
                      'other': '#6b7280' // gray
                    };
                    const color = colors[category] || '#6b7280';
                    
                    return (
                      <circle 
                        key={category}
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke={color}
                        strokeWidth="10" 
                        strokeDasharray={dashArray} 
                        strokeDashoffset={previousOffset}
                        transform="rotate(-90 50 50)"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    );
                  })}
                  
                  <circle cx="50" cy="50" r="35" fill={darkMode ? '#1e293b' : 'white'} />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                  <div className="text-sm">hodin celkem</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className={`p-6 rounded-xl shadow-xl ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Clock size={18} className="mr-2 text-blue-500" />
          Nedávná aktivita
        </h3>
        
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-500">
              Žádné záznamy k zobrazení
            </div>
          ) : (
            records.slice(0, 5).map((record, index) => (
              <div 
                key={record.id}
                className={`p-4 rounded-lg flex justify-between ${
                  darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}
              >
                <div>
                  <div className="font-medium flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${categoryColors[record.category] || 'bg-gray-500'}`}></div>
                    {getCategoryName(record.category)} {record.subcategory && `- ${record.subcategory}`}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <span className="mr-2">{new Date(record.date).toLocaleDateString('cs-CZ')}</span>
                    <span className="mx-2">•</span>
                    <span className="mr-2">{(record.duration / (1000 * 60 * 60)).toFixed(1)} h</span>
                    <span className="mx-2">•</span>
                    <span className={`${record.worker === 'maruska' ? 'text-pink-500' : 'text-blue-500'}`}>
                      {record.worker === 'maruska' ? 'Maruška' : 'Márty'}
                    </span>
                  </div>
                </div>
                <div className="font-medium text-green-500 flex items-center">
                  {record.amount.net} Kč
                </div>
              </div>
            ))
          )}
          
          {records.length > 5 && (
            <div className="text-center mt-4">
              <button className={`px-4 py-2 rounded-md text-sm ${
                darkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } transition-colors border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                Zobrazit více
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ darkMode }) => {
  const exportData = () => {
    const records = JSON.parse(localStorage.getItem('timeTrackerRecords') || '[]');
    const jsonString = JSON.stringify({ records, exportDate: new Date().toISOString() }, null, 2);
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "time-tracker-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Nastavení</h2>
      
      <div className={`p-6 rounded-lg mb-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-xl font-medium mb-4">Data</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Export dat</h4>
            <p className="text-sm mb-3">Exportujte všechna data pro zálohování nebo přenos</p>
            <button 
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Exportovat JSON
            </button>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Import dat</h4>
            <p className="text-sm mb-3">Importujte data ze zálohy</p>
            <label className={`inline-block px-4 py-2 rounded-md cursor-pointer ${
              darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-200 text-gray-800'
            }`}>
              Nahrát JSON soubor
              <input 
                type="file" 
                accept=".json"
                className="hidden" 
              />
            </label>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Import z Apple Numbers</h4>
            <p className="text-sm mb-3">Importujte data z tabulky v Apple Numbers</p>
            <label className={`inline-block px-4 py-2 rounded-md cursor-pointer ${
              darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-200 text-gray-800'
            }`}>
              Nahrát CSV soubor
              <input 
                type="file" 
                accept=".csv,.xlsx,.numbers"
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>
      
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-xl font-medium mb-4">O aplikaci</h3>
        <p className="mb-2">Time Tracker v1.0</p>
        <p className="text-sm text-gray-500">© 2025 Všechna práva vyhrazena</p>
      </div>
    </div>
  );
};

export default TimeTracker;