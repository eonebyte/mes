import Resource from '../../models/resource.mjs';

export default async function Machines(fastify, opts) {
    fastify.get('/api/machine-downtime/machines', async (request, reply) => {
      const dbClient = await fastify.pg.connect();
      try {
  
        const resources = await Resource.getAll(dbClient);
        return reply.send(resources);
      } catch (error) {
        fastify.log.error('Error fetch data machine: ', error)
        return reply.status(500).send({ error: 'Internal server error' });
      } finally {
        dbClient.release();
      }
    });
  }