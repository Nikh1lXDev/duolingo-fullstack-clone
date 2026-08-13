import { API_URL } from "./constants";
import type { Course, Unit, Skill, Lesson, User, LearningPath, UserSkillProgress, UserLessonProgress, ProfileResponse, Quest, LeaderboardResponse, UserSettings, UserSettingsUpdate, UserStats } from "../types/api";

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Add support for cookies
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getCourse: (id: number) => fetcher<Course>(`/courses/${id}`),
  getCourses: () => fetcher<Course[]>(`/courses`),
  getUnit: (id: number) => fetcher<Unit>(`/units/${id}`),
  getSkill: (id: number) => fetcher<Skill>(`/skills/${id}`),
  getLesson: (id: number) => fetcher<Lesson>(`/lessons/${id}`),
  
  // Auth methods
  login: (data: Record<string, string>) => 
    fetcher<User>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: Record<string, string>) => 
    fetcher<User>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => 
    fetcher<{ message: string }>(`/auth/logout`, {
      method: "POST",
    }),
  getCurrentUser: () => fetcher<User>(`/auth/me`),
  
  // Authenticated /me endpoints
  getUserProgress: () => fetcher<{ skill_progress: UserSkillProgress[], lesson_progress: UserLessonProgress[] }>(`/users/me/progress`),
  getLearningPath: () => fetcher<LearningPath>(`/users/me/learning-path`),
  getNextLesson: (skillId: number) => fetcher<Lesson>(`/users/me/skills/${skillId}/next-lesson`),
  updateLessonProgress: (lessonId: number, data: { completed: boolean; score: number, time_spent_seconds?: number }) => 
    fetcher<UserLessonProgress>(`/users/me/lessons/${lessonId}/progress`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deductHeart: (deductionId: string) => 
    fetcher<UserStats>(`/users/me/hearts/deduct`, {
      method: "POST",
      body: JSON.stringify({ deduction_id: deductionId }),
    }),
  refillHearts: () => 
    fetcher<UserStats>(`/users/me/hearts/refill`, {
      method: "POST",
    }),
  getProfile: () => fetcher<ProfileResponse>(`/users/me/profile`),
  getQuests: () => fetcher<Quest[]>(`/users/me/quests`),
  getSettings: () => fetcher<UserSettings>(`/users/me/settings`),
  updateSettings: (data: UserSettingsUpdate) => 
    fetcher<UserSettings>(`/users/me/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    
  // Leaderboard is global but we still include credentials for it if we want.
  getLeaderboard: () => fetcher<LeaderboardResponse>(`/leaderboard`),
};
