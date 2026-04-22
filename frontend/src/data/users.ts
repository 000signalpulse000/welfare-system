export type UserStatus = "利用中" | "体験利用" | "一時休止";
export type UserService = "就労継続支援B型" | "自立訓練（生活訓練）";

export type User = {
  id: string;
  name: string;
  kana: string;
  service: UserService;
  status: UserStatus;
  recipientCertExpiry: string;
  staff: string;
};

export const users: User[] = [
  {
    id: "U-0001",
    name: "佐藤 健一",
    kana: "サトウ ケンイチ",
    service: "就労継続支援B型",
    status: "利用中",
    recipientCertExpiry: "2027-03-31",
    staff: "田中 美咲",
  },
  {
    id: "U-0002",
    name: "鈴木 花子",
    kana: "スズキ ハナコ",
    service: "自立訓練（生活訓練）",
    status: "利用中",
    recipientCertExpiry: "2026-09-30",
    staff: "高橋 誠",
  },
  {
    id: "U-0003",
    name: "山田 太郎",
    kana: "ヤマダ タロウ",
    service: "就労継続支援B型",
    status: "体験利用",
    recipientCertExpiry: "2026-07-15",
    staff: "田中 美咲",
  },
  {
    id: "U-0004",
    name: "伊藤 由美",
    kana: "イトウ ユミ",
    service: "自立訓練（生活訓練）",
    status: "一時休止",
    recipientCertExpiry: "2026-12-31",
    staff: "中村 大輔",
  },
  {
    id: "U-0005",
    name: "渡辺 翔",
    kana: "ワタナベ ショウ",
    service: "就労継続支援B型",
    status: "利用中",
    recipientCertExpiry: "2027-01-31",
    staff: "高橋 誠",
  },
];

export const statusBadge: Record<UserStatus, string> = {
  利用中: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  体験利用: "bg-sky-50 text-sky-700 border border-sky-200",
  一時休止: "bg-amber-50 text-amber-700 border border-amber-200",
};

export function findUserById(id: string): User | undefined {
  const normalized = id.toUpperCase();
  return users.find((u) => u.id.toUpperCase() === normalized);
}
