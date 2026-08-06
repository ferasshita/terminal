import { toNumber } from './http';

export const getPagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, toNumber(query.page, 1));
  const pageSize = Math.min(100, Math.max(1, toNumber(query.pageSize, 20)));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
};
