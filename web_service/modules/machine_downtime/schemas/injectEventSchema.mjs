export const injectEventSchema = {
    body: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          machineId: { type: 'integer', minimum: 1 }
        },
        required: ['machineId']
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        additionalProperties: false
      },
      500: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  };
  