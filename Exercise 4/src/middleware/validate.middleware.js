import AppError from '../utils/AppError.js';

const validate = (schemas) => (req, _res, next) => {
  const validated = {};

  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return next(new AppError('Request validation failed.', 400, details));
    }

    validated[part] = result.data;
  }

  req.validated = { ...req.validated, ...validated };
  next();
};

export default validate;
