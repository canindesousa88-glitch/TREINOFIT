
import React from 'react';
import { DayOfWeek, Workout } from '../types';
import { DAYS_OF_WEEK, DAY_COLORS } from '../constants';

interface DaySelectorModalProps {
  workout: Workout | null;
  onSelect: (day: DayOfWeek) => void;
  onClose: () => void;
}

const DaySelectorModal: React.FC<DaySelectorModalProps> = ({ workout, onSelect, onClose }) => {
  if (!workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b border-slate-800">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Agendar Treino</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <p className="text-slate-400 mt-2">Escolha o dia para <span className="text-lime-400 font-semibold">{workout.name}</span></p>
        </div>
        
        <div className="p-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700/50 text-left transition-all active:scale-[0.98]"
            >
              <div className={`w-3 h-3 rounded-full ${DAY_COLORS[day]}`} />
              <span className="text-lg font-medium text-white flex-1">{day}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          ))}
        </div>
        
        <div className="p-4 bg-slate-800/50">
          <button 
            onClick={onClose}
            className="w-full py-3 text-slate-400 font-medium hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DaySelectorModal;
