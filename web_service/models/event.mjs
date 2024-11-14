import { v4 as uuidv4 } from 'uuid';

class Event {
    constructor(machineId, eventStartTime, eventEndTime, status) {
        this.machineId = machineId;
        this.eventStartTime = eventStartTime;
        this.eventEndTime = eventEndTime;
        this.status = status;
        this.duration = Math.floor((eventEndTime - eventStartTime) / 1000);
        this.eventID = uuidv4();
        this.startTime = Math.floor(eventStartTime.getTime() / 1000);
        this.endTime = Math.floor(eventEndTime.getTime() / 1000);
      }

      static async create(dbClient, machineId, eventStartTime, eventEndTime, status) {
        const event = new Event(machineId, eventStartTime, eventEndTime, status);

        try {
          const query = `
            INSERT INTO mes.machine_events 
            (machine_id, event_id, status, start_time, end_time, duration) 
            VALUES 
            ($1, $2, $3, $4, $5, $6) 
            RETURNING id
        `;

        const res = await dbClient.query(query, [
            event.machineId,
            event.eventID,
            event.status,
            event.startTime,
            event.endTime,
            event.duration,
        ]);

        if (res.rows.length > 0) {
            const eventIdInserted = res.rows[0].id;
            return eventIdInserted;
          } else {
            throw new Error('Failed to insert event: No ID returned');
          }
        } catch (error) {
            console.error('Terjadi kesalahan saat menyimpan event:', error);
            throw error;
        }
      }
}

export default Event;