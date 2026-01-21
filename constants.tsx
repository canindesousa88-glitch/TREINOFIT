
import { MuscleGroup, Workout, DayOfWeek } from './types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export const DAY_COLORS: Record<DayOfWeek, string> = {
  'Segunda': 'bg-blue-500',
  'Terça': 'bg-purple-500',
  'Quarta': 'bg-pink-500',
  'Quinta': 'bg-orange-500',
  'Sexta': 'bg-green-500',
  'Sábado': 'bg-yellow-500'
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito & Tríceps',
  'Costas & Bíceps',
  'Ombros & Abs',
  'Pernas & Glúteos',
  'Personalizado'
];

// URLs de vídeos curtos de exemplo para demonstração
const DEMO_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

export const WORKOUT_DATABASE: Workout[] = [
  {
    id: 'chest-tri',
    name: 'Peito & Tríceps Pro',
    muscleGroup: 'Peito & Tríceps',
    description: 'Foco total em hipertrofia do peitoral e força de tríceps.',
    duration: '50 min',
    mediaUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
    exercises: [
      { 
        name: 'Supino Reto Barra', 
        sets: '4x10', 
        mediaUrl: DEMO_VIDEO, 
        explanation: 'Desça a barra até o meio do peito. Mantenha os cotovelos a 45 graus e suba explodindo.' 
      },
      { 
        name: 'Supino Inclinado Halter', 
        sets: '3x12',
        mediaUrl: DEMO_VIDEO,
        explanation: 'Foco na parte superior do peito. Mantenha o controle na descida.'
      },
      { name: 'Crucifixo Máquina', sets: '3x15' },
      { 
        name: 'Tríceps Corda', 
        sets: '4x12',
        mediaUrl: DEMO_VIDEO,
        explanation: 'Mantenha os cotovelos colados ao corpo e abra a corda no final do movimento.'
      },
      { name: 'Tríceps Testa', sets: '3x10' }
    ]
  },
  {
    id: 'back-bi',
    name: 'Dorsal & Bíceps V-Shape',
    muscleGroup: 'Costas & Bíceps',
    description: 'Largura de costas e pico de bíceps para estética clássica.',
    duration: '55 min',
    mediaUrl: 'https://images.unsplash.com/photo-1603287611837-f59f3f4d9c75?q=80&w=800&auto=format&fit=crop',
    exercises: [
      { 
        name: 'Puxada Aberta', 
        sets: '4x10',
        mediaUrl: DEMO_VIDEO,
        explanation: 'Puxe a barra em direção ao peito, não ao pescoço. Sinta as escápulas fecharem.'
      },
      { name: 'Remada Curvada', sets: '4x12' },
      { 
        name: 'Rosca Direta Barra W', 
        sets: '4x10',
        mediaUrl: DEMO_VIDEO,
        explanation: 'Evite balançar o corpo. Foque totalmente no bíceps.'
      },
      { name: 'Rosca Martelo', sets: '3x12' }
    ]
  },
  {
    id: 'legs-glute',
    name: 'Pernas de Aço',
    muscleGroup: 'Pernas & Glúteos',
    description: 'O treino mais difícil da semana. Foco em força bruta.',
    duration: '65 min',
    mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    exercises: [
      { 
        name: 'Agachamento Livre', 
        sets: '4x8',
        mediaUrl: DEMO_VIDEO,
        explanation: 'Mantenha as costas retas e desça até os joelhos formarem 90 graus.'
      },
      { 
        name: 'Leg Press 45', 
        sets: '3x12',
        mediaUrl: DEMO_VIDEO
      },
      { name: 'Cadeira Extensora', sets: '4x15' },
      { name: 'Stiff', sets: '4x10' }
    ]
  }
];
