export type Customer = {
  id: number;
  name: string;
  kana: string;
  phone: string;
  visitCount: number;
  memo: string;

  // 仮登録状態
  isProvisional?: boolean;

  // アーカイブ状態
  isArchived?: boolean;
  archivedAt?: string | null;
};