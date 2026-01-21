
import React, { useState, useRef } from 'react';
import { Workout, Exercise, MuscleGroup } from '../types';
import { MUSCLE_GROUPS } from '../constants';

interface AdminWorkoutFormProps {
  initialWorkout?: Workout;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

const AdminWorkoutForm: React.FC<AdminWorkoutFormProps> = ({ initialWorkout, onSave, onCancel }) => {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(initialWorkout?.muscleGroup || 'Peito & Tríceps');
  const [description, setDescription] = useState(initialWorkout?.description || '');
  const [duration, setDuration] = useState(initialWorkout?.duration || '');
  const [mediaUrl, setMediaUrl] = useState(initialWorkout?.mediaUrl || '');
  const [exercises, setExercises] = useState<Exercise[]>(initialWorkout?.exercises || [{ name: '', sets: '', mediaUrl: '', explanation: '' }]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exerciseFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingToIndex, setUploadingToIndex] = useState<number | null>(null);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', mediaUrl: '', explanation: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    (newExercises[index] as any)[field] = value;
    setExercises(newExercises);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerExerciseFileUpload = (index: number) => {
    setUploadingToIndex(index);
    exerciseFileInputRef.current?.click();
  };

  const handleExerciseVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingToIndex === null) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleExerciseChange(uploadingToIndex, 'mediaUrl', reader.result as string);
        setUploadingToIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialWorkout?.id || `custom-${Date.now()}`,
      name,
      muscleGroup,
      description,
      duration,
      mediaUrl,
      exercises: exercises.filter(ex => ex.name.trim() !== '')
    });
  };

  const checkIsVideo = (url?: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('video') || 
           lowerUrl.includes('.mp4') || 
           lowerUrl.includes('.webm') || 
           lowerUrl.includes('.ogg') || 
           lowerUrl.startsWith('data:video') ||
           lowerUrl.includes('mov_bbb');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 rounded-[2.5rem] border border-slate-700 shadow-2xl">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight italic">
            {initialWorkout ? 'EDITAR TREINO' : 'NOVO TREINO'}
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Gestão de Mídia & Exercícios</p>
        </div>
        <div className="bg-lime-500/10 border border-lime-500/20 p-2 rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase ml-1">Nome do Treino</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-lime-500 outline-none transition-all font-bold text-sm"
              placeholder="Ex: Supino Explosivo"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase ml-1">Grupo Muscular</label>
            <select 
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-lime-500 outline-none font-bold cursor-pointer text-sm appearance-none"
              required
            >
              {MUSCLE_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase ml-1">Duração Estimada</label>
            <input 
              type="text" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-lime-500 outline-none font-bold text-sm"
              placeholder="Ex: 50 min"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-500 uppercase ml-1">Capa do Treino</label>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-2 rounded-xl border-2 border-dashed transition-all font-black text-[9px] flex items-center justify-center gap-2 ${mediaUrl ? 'bg-lime-500/20 text-lime-400 border-lime-500/40' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-lime-500'}`}
            >
              {mediaUrl ? 'MÍDIA CARREGADA' : 'UPLOAD CAPA'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Exercícios & Detalhes</label>
        </div>
        
        <div className="space-y-6">
          {exercises.map((ex, index) => {
            const hasMedia = !!ex.mediaUrl;
            const isExVideo = checkIsVideo(ex.mediaUrl);
            
            return (
              <div key={index} className="bg-slate-900/50 rounded-3xl border border-slate-700/50 p-4 space-y-3 relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                    {index + 1}
                  </div>
                  <input 
                    type="text" 
                    value={ex.name} 
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    className="flex-1 bg-transparent border-none px-1 text-white font-bold outline-none text-sm"
                    placeholder="Nome do Exercício"
                  />
                  <input 
                    type="text" 
                    value={ex.sets} 
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    className="w-16 bg-slate-800 rounded-lg px-2 py-1 text-lime-400 text-[10px] font-black text-center outline-none border border-slate-700"
                    placeholder="Séries"
                  />
                  {exercises.length > 1 && (
                    <button type="button" onClick={() => handleRemoveExercise(index)} className="p-1.5 text-slate-600 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>

                {/* CAMPO DE EXPLICAÇÃO */}
                <div className="px-1">
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">Explicação / Dicas de Execução</label>
                  <textarea 
                    value={ex.explanation || ''} 
                    onChange={(e) => handleExerciseChange(index, 'explanation', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/30 rounded-xl px-3 py-2 text-slate-300 text-[11px] outline-none focus:border-lime-500/50 transition-all resize-none h-16"
                    placeholder="Diga como o atleta deve se posicionar, respirar e focar no músculo..."
                  />
                </div>
                
                {/* ÁREA DE CONFIGURAÇÃO DE VÍDEO DO EXERCÍCIO */}
                <div className="bg-slate-800/50 p-3 rounded-2xl space-y-2 border border-slate-700/30">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={ex.mediaUrl || ''} 
                      onChange={(e) => handleExerciseChange(index, 'mediaUrl', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-[10px] outline-none font-mono"
                      placeholder="URL do vídeo (YouTube/MP4)..."
                    />
                    <button 
                      type="button"
                      onClick={() => triggerExerciseFileUpload(index)}
                      className="px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-[9px] font-black flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      ARQUIVO
                    </button>
                  </div>

                  {hasMedia && (
                    <div className="mt-2 h-24 aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-600/50 group mx-auto">
                      {isExVideo ? (
                        <video src={ex.mediaUrl} className="w-full h-full object-contain" muted playsInline />
                      ) : (
                        <img src={ex.mediaUrl} className="w-full h-full object-contain" alt="Preview" />
                      )}
                      <button 
                        type="button" 
                        onClick={() => handleExerciseChange(index, 'mediaUrl', '')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <input 
          ref={exerciseFileInputRef} 
          type="file" 
          accept="video/*,image/*" 
          className="hidden" 
          onChange={handleExerciseVideoUpload} 
        />
        
        <button 
          type="button" 
          onClick={handleAddExercise}
          className="w-full py-2.5 border border-dashed border-slate-600 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-lime-500 hover:text-lime-500 transition-all bg-slate-900/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Novo Exercício
        </button>
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-700">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-2 text-slate-500 font-bold text-[10px] uppercase hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="flex-[2] bg-lime-500 text-slate-950 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-lime-500/10 active:scale-95 transition-all"
        >
          Salvar Treino Completo
        </button>
      </div>
    </form>
  );
};

export default AdminWorkoutForm;
