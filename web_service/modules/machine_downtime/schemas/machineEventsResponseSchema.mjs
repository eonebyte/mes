export const machineEventsResponseSchema = {
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    eventId: { type: 'string' },
                    machineId: { type: 'integer' },
                    status: { type: 'string' },
                    startTime: { type: 'string', format: 'date-time' },
                    endTime: { type: 'string', format: 'date-time' },
                    startTimeLocal: { type: 'string', format: 'date-time' },
                    endTimeLocal: { type: 'string', format: 'date-time' },
                    startTimeLocalString: { type: 'string' },
                    endTimeLocalString: { type: 'string' },
                    duration: { type: 'integer' },
                    durationText: { type: 'string' },
                    eventColor: { type: 'string' },
                },
                required: [
                    'eventId',
                    'machineId',
                    'status',
                    'startTime',
                    'endTime',
                    'startTimeLocal',
                    'endTimeLocal',
                    'startTimeLocalString',
                    'endTimeLocalString',
                    'duration',
                    'durationText',
                    'eventColor'
                ]
            }
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
