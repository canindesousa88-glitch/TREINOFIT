
export type Gender = 'Masculino' | 'Feminino';

export enum TrainingLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado',
  HARDCORE = 'Hardcore'
}

export type MuscleGroup = 'Peito & Tríceps' | 'Costas & Bíceps' | 'Ombros & Abs' | 'Pernas & Glúteos' | 'Personalizado';

export interface Exercise {
  name: string;
  sets: string;
  mediaUrl?: string;
  explanation?: string;
}

export interface Workout {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  duration: string;
  exercises: Exercise[];
  mediaUrl?: string;
}

export type DayOfWeek = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';

export interface PlannedWorkout extends Workout {
  plannedId: string;
}

export interface WeeklyPlan {
  [key: string]: PlannedWorkout[];
}

export type ViewState = 'LOGIN' | 'HOME' | 'GENDER_SELECT' | 'LEVEL_SELECT' | 'WORKOUT_LIST' | 'WEEKLY_PLAN' | 'ADMIN_PANEL' | 'WORKOUT_DETAIL';

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}
