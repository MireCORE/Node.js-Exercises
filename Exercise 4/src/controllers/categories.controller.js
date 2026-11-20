import categories from '../constants/categories.js';

export const getCategories = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: { categories }
  });
};
