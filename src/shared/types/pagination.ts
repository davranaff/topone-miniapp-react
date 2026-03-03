export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type ListFilters = {
  page?: number;
  size?: number;
};
