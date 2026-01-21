
import React from 'react';
import { Workout, MuscleGroup, Exercise } from '../types';

interface WorkoutCardProps {
  workout: Workout;
  onAdd: (workout: Workout) => void;
  onExerciseClick?: (exercise: Exercise) => void;
}

const getMuscleGroupIcon = (group: MuscleGroup) => {
  switch (group) {
    case 'Peito & Tríceps':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-500">
          <path d="M6.5 6.5 3 10l3.5 3.5" /><path d="m17.5 6.5 3.5 3.5-3.5 3.5" /><path d="m2 21 21-21" /><path d="m7.7 12 4.3 4.3" /><path d="m12 7.7 4.3 4.3" />
        </svg>
      );
    case 'Costas & Bíceps':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-500">
          <rect width="2" height="12" x="2" y="6" rx="1" /><rect width="2" height="12" x="20" y="6" rx="1" /><rect width="2" height="8" x="6" y="8" rx="1" /><rect width="2" height="16" x="8" y="4" rx="1" /><line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'Ombros & Abs':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-500">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
      );
    case 'Pernas & Glúteos':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-500">
          <path d="M5 22h14" /><path d="m5 2-1 6h2c0 5 2 7 3 10" /><path d="m19 2 1 6h-2c0 5-2 7-3 10" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-500">
          <path d="M18 20a6 6 0 0 0-12 0" /><circle cx="12" cy="10" r="4" /><circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onAdd, onExerciseClick }) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('video') || lower.match(/\.(mp4|webm|ogg)$/i) || lower.includes('mov_bbb') || getYouTubeId(url) || getVimeoId(url);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 mb-5 shadow-2xl hover:border-lime-500/40 transition-all group overflow-hidden">
      {workout.mediaUrl && (
        <div className="mb-4 -mx-5 -mt-5 aspect-video bg-slate-900 overflow-hidden relative border-b border-slate-700">
          {isVideo(workout.mediaUrl) ? (
            <div className="w-full h-full relative">
              {getYouTubeId(workout.mediaUrl) ? (
                <img 
                  src={`https://img.youtube.com/vi/${getYouTubeId(workout.mediaUrl)}/0.jpg`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={workout.name}
                />
              ) : (
                <video src={workout.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-lime-500"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          ) : (
            <img src={workout.mediaUrl} alt={workout.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getMuscleGroupIcon(workout.muscleGroup)}
            <h3 className="text-xl font-black text-white leading-tight italic tracking-tighter">{workout.name}</h3>
          </div>
          
          {/* Nova linha de resumo estatístico */}
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-7">
            <span>{workout.exercises.length} {workout.exercises.length === 1 ? 'exercício' : 'exercícios'}</span>
            <span className="opacity-30">•</span>
            <span>{workout.duration}</span>
          </div>

          <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{workout.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-slate-900/50 text-lime-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-lime-500/20 shrink-0">
            {workout.duration}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {workout.exercises.slice(0, 3).map((ex, i) => (
          <button 
            key={i} 
            onClick={() => onExerciseClick?.(ex)}
            className="w-full flex justify-between items-center text-[11px] font-medium text-slate-300 bg-slate-900/30 p-2 rounded-xl hover:bg-slate-900/60 hover:text-lime-400 active:scale-[0.98] transition-all group/ex"
          >
            <div className="flex items-center gap-2 truncate flex-1 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0"></span>
              <span className="truncate">{ex.name}</span>
              {ex.mediaUrl && (
                <div className="bg-lime-500/10 p-0.5 rounded border border-lime-500/20 group-hover/ex:bg-lime-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-lime-500 shrink-0"><path d="M8 5v14l11-7z"/></svg>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 font-bold group-hover/ex:text-slate-400">{ex.sets}</span>
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={() => onAdd(workout)}
        className="w-full mt-6 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] text-[10px] uppercase tracking-widest shadow-lg shadow-lime-500/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Adicionar Treino Ao Dia Da Semana
      </button>
    </div>
  );
};

export default WorkoutCard;
