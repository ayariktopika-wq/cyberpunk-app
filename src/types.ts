export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  screenshot?: string; // Optional attached picture base64
}

export interface GameChat {
  id: string;
  name: string; // Название игры
  aiName: string; // Имя ИИ-ассистента
  prompt: string; // Кастомный промт / инструкции для персонажа ИИ
  model: string; // Выбранная модель (например, gemini-3.5-flash)
  messages: ChatMessage[];
  createdAt: string;
}

export type DiscoveryCategory = "gig" | "quest" | "relationship" | "character" | "cyberware" | "clue";

export interface Discovery {
  id: string;
  gameId: string;
  category: DiscoveryCategory;
  title: string;
  description: string;
  importance: "normal" | "major" | "critical";
  createdAt: string;
  isAIGenerated?: boolean;
  accepted?: boolean; // If AI suggested it, user must accept or decline
}

export interface SkillNode {
  id: string;
  gameId: string;
  name: string;
  description: string;
  branch: string; // Branch / Attribute category (e.g., "Сила", "Реакция", "Техника", "Интеллект", "Хладнокровие")
  purchased: boolean; // Куплено ли умение
  dependsOn: string[]; // Массив ID родительских умений (зависимости от 1 или 2 умений выше)
  requiredAttributeId?: string; // ID характеристики, необходимой для открытия
  requiredAttributeValue?: number; // Минимальный уровень характеристики (например, 9, 15)
  cost: number; // Стоимость в очках навыков
}

export interface SkillAttribute {
  id: string;
  gameId: string;
  name: string; // "Сила" | "Реакция" | "Техника" | "Интеллект" | "Хладнокровие" или другие
  value: number; // От 3 до 20 по умолчанию
}

export interface DiaryEntry {
  id: string;
  gameId: string;
  title: string;
  summary: string;
  dateString: string; // e.g. "День 1", "День 2"
  createdAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "request" | "response" | "error";
  message: string;
  details?: any;
}

export interface InventoryItem {
  id: string;
  gameId: string;
  name: string;
  description: string;
  category: "weapon" | "cyberware" | "clothing" | "quest" | "other";
  location: "inventory" | "stash";
  quantity: number;
  equipped?: boolean;
  createdAt: string;
}
