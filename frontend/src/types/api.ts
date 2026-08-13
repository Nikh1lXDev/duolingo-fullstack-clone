export interface UserStats {
  id: number;
  user_id: number;
  xp: number;
  gems: number;
  hearts: number;
  streak: number;
  longest_streak: number;
  daily_xp_goal: number;
  daily_xp_progress: number;
  lessons_completed: number;
  last_activity_date: string | null;
  last_heart_refill_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar: string | null;
  created_at: string;
  stats?: UserStats;
}

export interface Course {
  id: number;
  name: string;
  language: string;
  source_language?: string;
  target_language?: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  type: "multiple_choice" | "translate" | "word_bank" | "match_pairs" | "fill_blank" | "type_answer";
  prompt: string;
  correct_answer: string;
  options: string | null;
  translation: string | null;
  direction?: string;
  order_index: number;
  xp_reward: number;
}

export interface Lesson {
  id: number;
  skill_id: number;
  title: string;
  description: string | null;
  order_index: number;
  xp_reward: number;
  difficulty: string;
  exercises?: Exercise[];
}

export interface Skill {
  id: number;
  unit_id: number;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_locked: boolean;
  xp_reward: number;
  lessons?: Lesson[];
}

export interface Unit {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  is_locked: boolean;
  skills?: Skill[];
}

export interface UserSkillProgress {
  id: number;
  user_id: number;
  skill_id: number;
  completed: boolean;
  progress: number;
  crowns: number;
  lessons_completed: number;
  updated_at: string;
}

export interface UserLessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  progress: number;
  attempts: number;
  score: number;
  completed_at: string | null;
  updated_at: string;
}

export interface LearningPathSkill extends Skill {
  progress: number;
  crowns: number;
  locked: boolean;
}

export interface LearningPathUnit extends Unit {
  skills: LearningPathSkill[];
}

export interface LearningPath {
  course: Course;
  units: LearningPathUnit[];
}

export interface UserProgressStats {
  skills_completed: number;
  total_skills: number;
  lessons_completed: number;
  total_lessons: number;
  course_progress: number;
}

export interface ProfileResponse {
  user: {
    id: number;
    username: string;
    display_name: string | null;
    avatar: string | null;
  };
  stats: Omit<UserStats, "user_id" | "id" | "last_activity_date" | "last_heart_refill_at" | "created_at" | "updated_at">;
  progress: UserProgressStats;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward_xp: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  display_name: string | null;
  avatar: string | null;
  xp: number;
  streak: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  current_user_rank?: number;
}

export interface UserSettings {
  sound_enabled: boolean;
  notifications_enabled: boolean;
  course_language: string;
  course_id?: number;
}

export interface UserSettingsUpdate {
  sound_enabled: boolean;
  notifications_enabled: boolean;
  course_language: string;
  course_id?: number;
}
