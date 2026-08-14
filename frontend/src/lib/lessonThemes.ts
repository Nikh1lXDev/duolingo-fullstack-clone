/**
 * Lesson Theme System
 * 
 * Each lesson gets a stable color theme based on its ID.
 * The same lesson always gets the same theme (deterministic).
 * 
 * Theme is used for:
 * - Progress bar accent color
 * - Lesson header background
 * - Exercise feedback background
 * - Lesson completion screen
 * - Skill node accent
 */

export interface LessonTheme {
  key: ThemeKey;
  accent: string;       // primary accent color (hex)
  accentDark: string;   // darker shade for borders
  bg: string;           // light background for feedback panels  
  bgDark: string;       // dark background for headers
  text: string;         // text color for use on light bg
  textOnAccent: string; // text color on accent bg (always white or very dark)
  headerGradient: string; // CSS gradient for unit headers
  name: string;
}

export type ThemeKey = "green" | "purple" | "blue" | "orange" | "pink" | "teal";

export const LESSON_THEMES: Record<ThemeKey, LessonTheme> = {
  green: {
    key: "green",
    accent: "#58cc02",
    accentDark: "#46a302",
    bg: "#ddf4c5",
    bgDark: "#1a3a0e",
    text: "#2d7a00",
    textOnAccent: "#ffffff",
    headerGradient: "linear-gradient(135deg, #58cc02 0%, #7de841 100%)",
    name: "Green",
  },
  purple: {
    key: "purple",
    accent: "#ce82ff",
    accentDark: "#9b59ff",
    bg: "#f0d9ff",
    bgDark: "#2a1a3e",
    text: "#6b21a8",
    textOnAccent: "#ffffff",
    headerGradient: "linear-gradient(135deg, #9b59ff 0%, #ce82ff 100%)",
    name: "Purple",
  },
  blue: {
    key: "blue",
    accent: "#1cb0f6",
    accentDark: "#1898d5",
    bg: "#d7f5ff",
    bgDark: "#0d2a3e",
    text: "#0369a1",
    textOnAccent: "#ffffff",
    headerGradient: "linear-gradient(135deg, #1898d5 0%, #1cb0f6 100%)",
    name: "Blue",
  },
  orange: {
    key: "orange",
    accent: "#ff9600",
    accentDark: "#e08600",
    bg: "#fff3d9",
    bgDark: "#3a2000",
    text: "#92400e",
    textOnAccent: "#ffffff",
    headerGradient: "linear-gradient(135deg, #e08600 0%, #ff9600 100%)",
    name: "Orange",
  },
  pink: {
    key: "pink",
    accent: "#ff4b4b",
    accentDark: "#e03232",
    bg: "#ffdfe0",
    bgDark: "#3a0d0d",
    text: "#991b1b",
    textOnAccent: "#ffffff",
    headerGradient: "linear-gradient(135deg, #e03232 0%, #ff4b4b 100%)",
    name: "Pink",
  },
  teal: {
    key: "teal",
    accent: "#00cd9c",
    accentDark: "#00b589",
    bg: "#d0fff3",
    bgDark: "#003d2e",
    text: "#065f46",
    textOnAccent: "#ffffff",
    headerGradient: "linear-gradient(135deg, #00b589 0%, #00cd9c 100%)",
    name: "Teal",
  },
};

const THEME_ORDER: ThemeKey[] = ["green", "purple", "blue", "orange", "pink", "teal"];

/**
 * Get a stable theme for a given lesson ID.
 * The same lesson ID always returns the same theme.
 */
export function getThemeForLesson(lessonId: number): LessonTheme {
  const key = THEME_ORDER[lessonId % THEME_ORDER.length];
  return LESSON_THEMES[key];
}

/**
 * Get a stable theme for a skill by index.
 */
export function getThemeForSkill(skillIndex: number): LessonTheme {
  const key = THEME_ORDER[skillIndex % THEME_ORDER.length];
  return LESSON_THEMES[key];
}
