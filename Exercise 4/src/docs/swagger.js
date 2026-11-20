const host = (process.env.API_BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Personal Finance Tracker API',
    version: '1.0.0',
    description: 'API lagu maamulo income, expenses, categories, profile pictures iyo monthly financial summaries.'
  },
  servers: [
    {
      url: `${host}/api`,
      description: process.env.NODE_ENV === 'production' ? 'Deployed API' : 'Local development API'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Register, login iyo profile.' },
    { name: 'Transactions', description: 'Income iyo expense transactions.' },
    { name: 'Categories', description: 'Predefined transaction categories.' },
    { name: 'Upload', description: 'Profile picture upload.' },
    { name: 'Admin', description: 'Admin-only overview.' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Request validation failed.' },
          details: { type: 'array', items: { type: 'object' } }
        }
      },
      TransactionInput: {
        type: 'object',
        required: ['title', 'amount', 'type', 'category'],
        properties: {
          title: { type: 'string', example: 'Groceries' },
          amount: { type: 'number', example: -50, description: 'Income waa positive; expense waa negative.' },
          type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          category: { type: 'string', example: 'Food' },
          date: { type: 'string', format: 'date', example: '2025-05-27' }
        }
      },
      Transaction: {
        allOf: [
          { $ref: '#/components/schemas/TransactionInput' },
          {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '6654abc12345678901234567' },
              user: { type: 'string', example: '6654abc12345678901234568' }
            }
          }
        ]
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Ayaan' },
          email: { type: 'string', format: 'email', example: 'ayaan@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          profilePictureUrl: { type: 'string', nullable: true }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Ayaan' },
                  email: { type: 'string', format: 'email', example: 'ayaan@example.com' },
                  password: { type: 'string', format: 'password', minLength: 8, example: 'StrongPass123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Account created and JWT returned.' },
          400: { description: 'Validation error.' },
          409: { description: 'Email already exists.' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'ayaan@example.com' },
                  password: { type: 'string', format: 'password', example: 'StrongPass123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful.' },
          401: { description: 'Invalid credentials.' }
        }
      }
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get the authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile.' },
          401: { description: 'Missing or invalid token.' }
        }
      }
    },
    '/transactions': {
      post: {
        tags: ['Transactions'],
        summary: 'Create an income or expense transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionInput' } } }
        },
        responses: {
          201: { description: 'Transaction created.' },
          400: { description: 'Validation error.' },
          401: { description: 'Authentication required.' }
        }
      },
      get: {
        tags: ['Transactions'],
        summary: 'List the authenticated user transactions (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['income', 'expense'] } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
        ],
        responses: {
          200: { description: 'Transactions and pagination metadata.' },
          401: { description: 'Authentication required.' }
        }
      }
    },
    '/transactions/monthly-summary': {
      get: {
        tags: ['Transactions'],
        summary: 'Get monthly income and expense totals by category',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'month', description: 'Month in YYYY-MM format. Defaults to the current UTC month.', schema: { type: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$', example: '2025-05' } }
        ],
        responses: {
          200: { description: 'Monthly summary.' },
          401: { description: 'Authentication required.' }
        }
      }
    },
    '/transactions/{id}': {
      put: {
        tags: ['Transactions'],
        summary: 'Replace a transaction owned by the authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionInput' } } }
        },
        responses: {
          200: { description: 'Transaction updated.' },
          400: { description: 'Invalid ID or transaction data.' },
          404: { description: 'Transaction not found for this user.' }
        }
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Delete a transaction owned by the authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Transaction deleted.' },
          404: { description: 'Transaction not found for this user.' }
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List predefined income and expense categories',
        responses: { 200: { description: 'Available categories.' } }
      }
    },
    '/upload/profile-picture': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a profile picture to Cloudinary',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object', required: ['profilePicture'],
                properties: { profilePicture: { type: 'string', format: 'binary' } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile picture uploaded.' },
          400: { description: 'Missing file or unsupported file type.' },
          413: { description: 'File exceeds 5 MB.' },
          503: { description: 'Cloudinary is not configured.' }
        }
      }
    },
    '/admin/overview': {
      get: {
        tags: ['Admin'],
        summary: 'Get platform-wide statistics (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User, transaction and top spending statistics.' },
          401: { description: 'Authentication required.' },
          403: { description: 'Admin role required.' }
        }
      }
    }
  }
};

export default swaggerSpec;
