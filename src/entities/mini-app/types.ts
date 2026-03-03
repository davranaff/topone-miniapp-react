export type MiniApp = {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  appUrl: string;
  category: string;
  permissions: string[];
  isActive: boolean;
  sortOrder: number;
};
