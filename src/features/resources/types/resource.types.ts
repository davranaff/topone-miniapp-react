export type ResourceCategory = {
  id: string;
  name: string;
  count: number;
  orderIndex?: number;
};

export type ResourceItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  type?: string;
  url?: string;
  author?: string;
  tags: string[];
  language?: string;
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  rating?: number;
  isLocked: boolean;
};
