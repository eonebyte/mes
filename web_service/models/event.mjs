import { v4 as uuidv4 } from 'uuid';

class Event {
  constructor(machineId, eventStartTime, eventEndTime, status) {
    if (!machineId || !eventStartTime || !eventEndTime || !status) {
      throw new Error("Invalid parameters: machineId, eventStartTime, eventEndTime, and status are required.");
    }
    this.machineId = machineId;
    this.eventStartTime = eventStartTime;
    this.eventEndTime = eventEndTime;
    this.status = status;
    this.duration = Math.floor((eventEndTime - eventStartTime) / 1000);
    this.eventID = uuidv4();
    this.startTime = Math.floor(eventStartTime.getTime() / 1000);
    this.endTime = Math.floor(eventEndTime.getTime() / 1000);
  }

  static async getAll(dbClient) {
    try {
      const query = `
        SELECT
          event_id,
          machine_id,
          status,
          start_time,  -- epoch timestamp
          end_time,    -- epoch timestamp
          duration
        FROM
          mes.machine_events
        WHERE
          start_time >= extract(epoch from current_date)  -- Mulai dari 00:00 hari kemarin
          AND end_time <= extract(epoch from current_date + interval '1 day')  -- Sampai 23:59 hari ini
        ORDER BY
          start_time;
      `;
      const { rows } = await dbClient.query(query);
      return rows.map(row => new Event(

      ));
    } catch (error) {
      throw new Error(`Error fetching resources: ${error.message}`);
    }
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