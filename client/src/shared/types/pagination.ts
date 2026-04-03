export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type SortOrder = 'asc' | 'desc';

export type SortParams<T extends string = string> = {
  sortBy: T;
  sortOrder: SortOrder;
};
