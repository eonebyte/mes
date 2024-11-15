export const injectEventSchema = {
  body: {
    type: 'array',
    items: {
      type: 'object',
      required: ['machineId'],
      properties: {
        machineId: { type: 'integer', minimum: 1 }
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'string' },
      },
    }
  }
};
