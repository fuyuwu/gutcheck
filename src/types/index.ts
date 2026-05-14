// 食物資料庫品項（用戶自建）
export interface FoodItem {
  id: string
  name: string
  brand?: string // 店家 / 品牌，例如：麥當勞、7-11
  calories: number // 每份熱量（kcal）
  unit: string // 份量單位，例如：份、個、g
  tags: string[] // 標籤，例如：['低醣', '可換地瓜', '素食']
  createdAt: string
}

// 飲食記錄（從資料庫選食物後產生）
export interface FoodEntry {
  id: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodItemId: string // 對應 FoodItem.id
  foodName: string // 冗餘存一份名稱，避免 FoodItem 被刪後找不到
  calories: number // 當下記錄的熱量（可能跟 FoodItem 不同，例如吃半份）
  quantity: number // 份數，例如 0.5 代表半份
  timestamp: string
  note?: string
}

// 每日身體數據
export interface BodyStats {
  date: string
  weight?: number
  water: number
  sleep?: number
  sleepQuality?: 1 | 2 | 3 | 4 | 5
}

// 每日完整記錄
export interface DayLog {
  date: string
  foodEntries: FoodEntry[]
  bodyStats: BodyStats
}

// 使用者設定
export interface UserSettings {
  waterGoal: number
  weightGoal?: number
  sleepGoal: number
  dailyCaloriesGoal?: number // 每日熱量目標
}

// Toast 通知
export interface Toast {
  id: string
  message: string
  type: 'success' | 'warning' | 'info'
  duration?: number
}
