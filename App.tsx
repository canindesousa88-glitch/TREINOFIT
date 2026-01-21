
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ViewState, 
  Gender, 
  TrainingLevel, 
  Workout, 
  WeeklyPlan, 
  DayOfWeek, 
  PlannedWorkout,
  User,
  MuscleGroup,
  Exercise
} from './types';
import { WORKOUT_DATABASE, DAYS_OF_WEEK, DAY_COLORS, MUSCLE_GROUPS } from './constants';
import Layout from './components/Layout';
import WorkoutCard from './components/WorkoutCard';
import DaySelectorModal from './components/DaySelectorModal';
import AdminWorkoutForm from './components/AdminWorkoutForm';

const App: React.FC = () => {
  // Navigation & Auth State
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<TrainingLevel | null>(null);
  const [prevView, setPrevView] = useState<ViewState>('HOME');
  
  // App Data State (Workouts - Global for the browser)
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('treinofit_workouts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((w: any) => ({
          ...w,
          muscleGroup: w.muscleGroup || 'Personalizado'
        }));
      } catch (e) {
        return WORKOUT_DATABASE;
      }
    }
    return WORKOUT_DATABASE;
  });

  // Individual Weekly Plan
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );

  // UI States
  const [pendingWorkout, setPendingWorkout] = useState<Workout | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [selectedWorkoutForDetail, setSelectedWorkoutForDetail] = useState<Workout | null>(null);
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [adminFilters, setAdminFilters] = useState<MuscleGroup[]>([]);
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });

  // 1. Persistence for Admin Workouts
  useEffect(() => {
    localStorage.setItem('treinofit_workouts', JSON.stringify(workouts));
  }, [workouts]);

  // 2. Load User-Specific Plan on Login
  useEffect(() => {
    if (user) {
      const userPlanKey = `treinofit_plan_${user.email}`;
      const savedPlan = localStorage.getItem(userPlanKey);
      if (savedPlan) {
        try {
          setWeeklyPlan(JSON.parse(savedPlan));
        } catch (e) {
          console.error("Failed to load user plan", e);
          setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
        }
      } else {
        setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
      }
    }
  }, [user]);

  // 3. Persist Weekly Plan on Changes
  useEffect(() => {
    if (user) {
      const userPlanKey = `treinofit_plan_${user.email}`;
      localStorage.setItem(userPlanKey, JSON.stringify(weeklyPlan));
    }
  }, [weeklyPlan, user]);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email === 'treinofit@gmail.com' && loginForm.password === 'admin') {
      const adminUser = { email: loginForm.email, name: 'Administrador', isAdmin: true };
      setUser(adminUser);
      setView('HOME');
      showToast("Acesso Admin liberado.");
    } else if (loginForm.email && loginForm.password) {
      const normalUser = { email: loginForm.email, name: loginForm.name || 'Atleta', isAdmin: false };
      setUser(normalUser);
      setView('HOME');
      showToast(`Bem-vindo, ${normalUser.name}!`);
    } else {
      showToast("Preencha todos os campos.");
    }
  };

  const handleGoogleLogin = () => {
    const googleUser = { email: 'google_user@gmail.com', name: 'Usuário Google', isAdmin: false };
    setUser(googleUser);
    setView('HOME');
    showToast("Logado com Google.");
  };

  const handleLogout = () => {
    setUser(null);
    setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
    setView('LOGIN');
    showToast("Sessão encerrada.");
  };

  const navigateTo = (newView: ViewState) => {
    setPrevView(view);
    setView(newView);
  };

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    navigateTo('LEVEL_SELECT');
  };

  const handleLevelSelect = (level: TrainingLevel) => {
    setSelectedLevel(level);
    navigateTo('WORKOUT_LIST');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addWorkoutToPlan = (day: DayOfWeek) => {
    if (!pendingWorkout) return;
    const newPlannedWorkout: PlannedWorkout = {
      ...pendingWorkout,
      plannedId: `${pendingWorkout.id}-${Date.now()}`
    };
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: [...prev[day], newPlannedWorkout]
    }));
    setPendingWorkout(null);
    showToast(`Adicionado à ${day}!`);
  };

  const removeWorkoutFromPlan = (day: DayOfWeek, plannedId: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: prev[day].filter(w => w.plannedId !== plannedId)
    }));
    showToast("Treino removido.");
  };

  const clearWeek = () => {
    if (confirm("Deseja apagar todo o cronograma?")) {
      setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
      showToast("Cronograma limpo.");
    }
  };

  const openWorkoutDetail = (workout: Workout) => {
    setSelectedWorkoutForDetail(workout);
    navigateTo('WORKOUT_DETAIL');
  };

  // VIDEO UTILS
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const checkIsVideo = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('video') || 
           lower.includes('.mp4') || 
           lower.includes('.webm') || 
           lower.includes('.ogg') || 
           lower.startsWith('data:video') ||
           lower.includes('mov_bbb') ||
           getYouTubeId(url) !== null ||
           getVimeoId(url) !== null;
  };

  const VideoPlayer: React.FC<{ url: string, autoPlay?: boolean }> = ({ url, autoPlay = true }) => {
    const ytId = getYouTubeId(url);
    const vimeoId = getVimeoId(url);

    if (ytId) {
      return (
        <iframe 
          className="w-full h-full border-none"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&mute=1&playsinline=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }

    if (vimeoId) {
      return (
        <iframe 
          className="w-full h-full border-none"
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&muted=1&playsinline=1`}
          allow="autoplay; fullscreen; picture-in-picture" 
          allowFullScreen
        ></iframe>
      );
    }

    return (
      <video 
        src={url} 
        controls 
        autoPlay={autoPlay} 
        muted={autoPlay}
        loop 
        playsInline
        className="w-full h-full object-contain" 
      />
    );
  };

  // Admin CRUD logic
  const saveWorkout = (workout: Workout) => {
    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === workout.id ? workout : w));
      showToast("Treino atualizado!");
    } else {
      setWorkouts([...workouts, workout]);
      showToast("Novo treino adicionado!");
    }
    setEditingWorkout(null);
    setIsAddingWorkout(false);
  };

  const confirmDeleteWorkout = () => {
    if (workoutToDelete) {
      setWorkouts(workouts.filter(w => w.id !== workoutToDelete.id));
      showToast("Treino excluído.");
      setWorkoutToDelete(null);
    }
  };

  const toggleAdminFilter = (group: MuscleGroup) => {
    setAdminFilters(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group) 
        : [...prev, group]
    );
  };

  const filteredWorkouts = adminFilters.length === 0 
    ? workouts 
    : workouts.filter(w => adminFilters.includes(w.muscleGroup));

  // Views
  const renderLogin = () => (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-lime-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-sm z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-lime-500 italic tracking-tighter">TREINOFIT</h1>
          <p className="text-slate-400 mt-2 font-medium">Sua evolução em foco</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome Completo"
            value={loginForm.name}
            onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-lime-500 outline-none transition-all"
          />
          <input 
            type="email" 
            placeholder="E-mail"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-lime-500 outline-none transition-all"
            required
          />
          <input 
            type="password" 
            placeholder="Senha"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-lime-500 outline-none transition-all"
            required
          />
          <button 
            type="submit"
            className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg shadow-lime-500/20 transition-all active:scale-95"
          >
            ENTRAR
          </button>
        </form>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white mt-6 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
          Google Login
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col gap-6 pt-8">
      <div className="flex justify-between items-start mb-4">
        <div className="text-left">
          <h1 className="text-4xl font-black text-lime-500 italic tracking-tighter">TREINOFIT</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Atleta: {user?.name}</p>
        </div>
        <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>

      <div className="space-y-4">
        <button onClick={() => handleGenderSelect('Masculino')} className="w-full bg-slate-800 h-28 rounded-3xl flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-500/50 transition-all shadow-xl">
          <span className="text-3xl mb-1">♂️</span>
          <span className="text-lg font-bold text-white uppercase tracking-wider">MASCULINO</span>
        </button>
        <button onClick={() => handleGenderSelect('Feminino')} className="w-full bg-slate-800 h-28 rounded-3xl flex flex-col items-center justify-center border-2 border-transparent hover:border-pink-500/50 transition-all shadow-xl">
          <span className="text-3xl mb-1">♀️</span>
          <span className="text-lg font-bold text-white uppercase tracking-wider">FEMININO</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <button 
          onClick={() => navigateTo('WEEKLY_PLAN')}
          className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 h-16 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-lg shadow-[0_10px_25px_rgba(132,204,22,0.3)] transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
          MEU CRONOGRAMA
        </button>

        {user?.isAdmin && (
          <button 
            onClick={() => navigateTo('ADMIN_PANEL')}
            className="w-full bg-slate-800 text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold border border-slate-700 transition-all"
          >
            PAINEL DO ADMINISTRADOR
          </button>
        )}
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <Layout title="Administração" onBack={() => navigateTo('HOME')}>
      <div className="mt-4 space-y-6">
        {isAddingWorkout || editingWorkout ? (
          <AdminWorkoutForm 
            initialWorkout={editingWorkout || undefined} 
            onSave={saveWorkout} 
            onCancel={() => { setIsAddingWorkout(false); setEditingWorkout(null); }} 
          />
        ) : (
          <>
            <button 
              onClick={() => setIsAddingWorkout(true)}
              className="w-full bg-lime-500 text-slate-950 py-4 rounded-2xl font-black text-center shadow-lg active:scale-95 transition-all"
            >
              + NOVO TREINO
            </button>
            <div className="space-y-3">
              {workouts.map(workout => (
                <div key={workout.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-md">
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{workout.name}</h4>
                    <p className="text-slate-500 text-xs">{workout.muscleGroup}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingWorkout(workout)} className="p-2 bg-slate-900 text-blue-400 rounded-lg border border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1-1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => setWorkoutToDelete(workout)} className="p-2 bg-slate-900 text-red-400 rounded-lg border border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );

  const renderLevelSelect = () => (
    <div className="relative min-h-screen">
      {/* Background Image Container - Usando uma imagem mais proeminente e moderna */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2000&auto=format&fit=crop" 
          alt="Modern Gym"
          className="w-full h-full object-cover blur-[2px] scale-105 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-slate-950/80"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>
      </div>

      <Layout 
        title="Sua Intensidade" 
        onBack={() => navigateTo('HOME')}
        className="bg-transparent" // Layout transparente para mostrar o fundo
      >
        <div className="flex flex-col gap-4 mt-8 relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl mb-6 text-center">
            <h2 className="text-white font-black italic text-2xl tracking-tighter uppercase mb-2">Supere seus limites</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Você selecionou <span className="text-lime-400 font-bold">{selectedGender}</span>. 
              Para uma experiência personalizada, qual o seu nível de treino hoje?
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {(Object.values(TrainingLevel)).map((level) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level)}
                className="group relative w-full bg-slate-800/40 backdrop-blur-md p-6 rounded-[2rem] flex items-center justify-between border border-white/10 hover:border-lime-500/50 hover:bg-slate-800/70 transition-all duration-300 shadow-xl overflow-hidden active:scale-[0.98]"
              >
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/0 via-lime-500/5 to-lime-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex flex-col items-start relative z-10">
                  <span className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-lime-400 transition-colors duration-300">{level}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-80">Plano de Treino {level}</span>
                </div>
                
                <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-slate-950 transition-all duration-300 border border-white/5 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    </div>
  );

  const renderWorkoutList = () => (
    <Layout title={selectedLevel || 'Treinos'} onBack={() => navigateTo('LEVEL_SELECT')}>
      <div className="mt-4">
        {workouts.map(workout => (
          <WorkoutCard 
            key={workout.id} 
            workout={workout} 
            onAdd={(w) => setPendingWorkout(w)} 
            onExerciseClick={(ex) => setSelectedExerciseForDetail(ex)}
          />
        ))}
      </div>
    </Layout>
  );

  const renderWeeklyPlan = () => (
    <Layout title="Meu Plano" onBack={() => navigateTo('HOME')}>
      <div className="flex flex-col gap-3 mt-4">
        {DAYS_OF_WEEK.map((day) => {
          const isOpen = expandedDay === day;
          const count = weeklyPlan[day].length;
          const dayColor = DAY_COLORS[day];
          
          return (
            <div key={day} className={`flex flex-col rounded-3xl overflow-hidden shadow-xl transition-all duration-300 border ${isOpen ? 'border-transparent ring-2 ring-slate-700/50 mb-4' : 'border-slate-800 mb-1'}`}>
              <button 
                onClick={() => setExpandedDay(isOpen ? null : day)}
                className={`w-full p-5 flex items-center justify-between text-left transition-all duration-300 ${isOpen ? `${dayColor} text-slate-950 scale-[1.02] shadow-lg` : 'bg-slate-800/60 text-white hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isOpen ? 'bg-slate-950 shadow-sm' : dayColor}`} />
                  <span className="font-black text-xl uppercase italic tracking-tighter">{day}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors duration-300 ${isOpen ? 'bg-black/20 text-slate-950' : 'bg-slate-900/50 text-slate-400'}`}>
                    {count} {count === 1 ? 'TREINO' : 'TREINOS'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-slate-950' : 'text-slate-600'}`}><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>
              
              {isOpen && (
                <div className="bg-slate-900/40 p-3 space-y-2 border-t border-black/10 animate-in slide-in-from-top-4 duration-500">
                  {count === 0 ? (
                    <div className="py-12 text-center text-slate-600 italic text-sm">Nenhum treino agendado.</div>
                  ) : (
                    weeklyPlan[day].map((workout) => (
                      <div key={workout.plannedId} className="bg-slate-800/90 rounded-2xl flex items-center justify-between p-4 shadow-md border border-slate-700/30">
                        <button onClick={() => openWorkoutDetail(workout)} className="flex-1 text-left truncate">
                          <h4 className="font-bold text-white italic truncate">{workout.name}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{workout.muscleGroup}</span>
                        </button>
                        <button onClick={() => removeWorkoutFromPlan(day, workout.plannedId)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button onClick={clearWeek} className="mt-8 mx-auto text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-red-300 transition-colors p-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
           REINICIAR SEMANA
        </button>
      </div>
    </Layout>
  );

  const renderWorkoutDetail = () => {
    if (!selectedWorkoutForDetail) return null;
    const w = selectedWorkoutForDetail;
    return (
      <Layout title="Execução" onBack={() => navigateTo(prevView)}>
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-400">
          {w.mediaUrl && (
            <div className="h-[12.5vh] -mx-4 -mt-4 bg-black overflow-hidden relative shadow-2xl rounded-b-[2.5rem] flex items-center justify-center">
              {checkIsVideo(w.mediaUrl) ? <VideoPlayer url={w.mediaUrl} autoPlay={false} /> : <img src={w.mediaUrl} className="w-full h-full object-cover" />}
              <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{w.duration}</div>
            </div>
          )}
          <div className="px-1">
            <h2 className="text-4xl font-black text-white italic tracking-tighter leading-tight">{w.name}</h2>
            <span className="bg-lime-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase mt-2 inline-block">{w.muscleGroup}</span>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50">
            <h4 className="text-[10px] font-black text-lime-500 uppercase tracking-widest mb-2">Descrição</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{w.description}</p>
          </div>
          <div className="space-y-3 pb-24">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Exercícios</h4>
            {w.exercises.map((ex, i) => (
              <button key={i} onClick={() => setSelectedExerciseForDetail(ex)} className="w-full bg-slate-800 border border-slate-700/30 p-5 rounded-[2.5rem] flex justify-between items-center text-left hover:border-lime-500/50 active:scale-95 transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black italic text-slate-400">{i + 1}</div>
                  <div className="flex-1">
                    <span className="text-white font-bold block uppercase italic tracking-tighter text-lg">{ex.name}</span>
                    <span className="text-[10px] text-lime-500 font-black">{ex.sets}</span>
                  </div>
                </div>
                {ex.mediaUrl && <div className="bg-lime-500/20 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-lime-500"><path d="M8 5v14l11-7z"/></svg></div>}
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-lime-500 selection:text-slate-950 antialiased overflow-x-hidden">
      {view === 'LOGIN' && renderLogin()}
      {view === 'HOME' && (
        <div className="w-full max-w-md p-4 flex flex-col min-h-screen relative">
          {renderHome()}
        </div>
      )}
      {view === 'LEVEL_SELECT' && renderLevelSelect()}
      {view === 'WORKOUT_LIST' && renderWorkoutList()}
      {view === 'WEEKLY_PLAN' && renderWeeklyPlan()}
      {view === 'ADMIN_PANEL' && renderAdminPanel()}
      {view === 'WORKOUT_DETAIL' && renderWorkoutDetail()}
      <DaySelectorModal workout={pendingWorkout} onSelect={addWorkoutToPlan} onClose={() => setPendingWorkout(null)} />
      
      {/* EXERCISE DETAIL MODAL */}
      {selectedExerciseForDetail && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedExerciseForDetail(null)}></div>
          <div className="w-full max-w-md bg-slate-900 rounded-t-[3rem] border-t border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-500 relative z-10">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-4 mb-2 shrink-0"></div>
            
            <div className="relative h-[15vh] bg-black flex items-center justify-center border-b border-slate-800 shrink-0 overflow-hidden">
              {selectedExerciseForDetail.mediaUrl ? (
                <VideoPlayer url={selectedExerciseForDetail.mediaUrl} />
              ) : (
                <div className="text-slate-700 flex flex-col items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                   <span className="text-[10px] font-black uppercase">Sem Vídeo</span>
                </div>
              )}
              <button 
                onClick={() => setSelectedExerciseForDetail(null)}
                className="absolute top-4 right-4 p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md border border-white/5 transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="p-8 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="bg-lime-500/15 text-lime-400 text-[10px] font-black px-3 py-1 rounded-full border border-lime-500/20">{selectedExerciseForDetail.sets}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter leading-tight uppercase">{selectedExerciseForDetail.name}</h3>
                </div>

                <div className="h-px bg-slate-800 w-full"></div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-lime-500 uppercase tracking-widest flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    COMO EXECUTAR
                  </h4>
                  <p className="text-slate-300 text-base leading-relaxed font-medium whitespace-pre-line">
                    {selectedExerciseForDetail.explanation || "Foque na técnica e controle a carga. Mantenha a respiração cadenciada durante todo o movimento."}
                  </p>
                </div>
              </div>

              <div className="mt-12 pb-6">
                <button 
                  onClick={() => setSelectedExerciseForDetail(null)}
                  className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em]"
                >
                  FECHAR DETALHES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {workoutToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-xl font-black text-white italic mb-2 uppercase">Apagar Treino?</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Você está prestes a remover <span className="text-white font-bold">"{workoutToDelete.name}"</span>. Esta ação é permanente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteWorkout} className="w-full py-4 bg-red-500 text-white font-black rounded-2xl active:scale-95 transition-all text-xs uppercase">CONFIRMAR EXCLUSÃO</button>
              <button onClick={() => setWorkoutToDelete(null)} className="w-full py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-lime-400 px-6 py-4 rounded-[2rem] shadow-2xl font-black animate-in fade-in slide-in-from-bottom-8 duration-500 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
