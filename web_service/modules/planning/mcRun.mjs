import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to load data from JSON file
function loadLogData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.resolve(__dirname, '../../data/logData.json');

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading log data:', error.message);
        return [];
    }
}

// Helper to parse date string into JavaScript Date object
function parseDate(dateStr) {
    const [day, month, year, hour, minute, second] = dateStr.split(/[/\s:]/);
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

// Generate normalized time buckets with consistent intervals
function generateBuckets(start, end, intervalMinutes) {
    const buckets = [];
    let current = new Date(start);

    while (current <= end) {
        buckets.push(new Date(current));
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return buckets;
}

// Map data to the nearest bucket
function mapDataToBuckets(data, buckets) {
    const bucketMap = buckets.reduce((acc, bucket) => {
        acc[bucket.toISOString()] = new Set();
        return acc;
    }, {});

    data.forEach((entry) => {
        const entryDate = parseDate(entry.HH);
        if (isNaN(entryDate)) {
            console.error(`Invalid date format for entry: ${entry.HH}`);
            return;
        }

        // Find the nearest bucket
        const bucket = buckets.find((b) => b <= entryDate && entryDate < new Date(b.getTime() + 5 * 60000));
        if (bucket) {
            bucketMap[bucket.toISOString()].add(entry.MCNO);
        }
    });

    return bucketMap;
}

// Aggregate data to larger intervals
function aggregateBuckets(bucketMap, intervalMinutes) {
    const aggregatedMap = {};
    const intervalMillis = intervalMinutes * 60000;

    Object.keys(bucketMap).forEach((key) => {
        const date = new Date(key);
        const intervalStart = new Date(Math.floor(date.getTime() / intervalMillis) * intervalMillis);
        const intervalKey = intervalStart.toISOString();

        if (!aggregatedMap[intervalKey]) {
            aggregatedMap[intervalKey] = new Set();
        }

        bucketMap[key].forEach((mcno) => aggregatedMap[intervalKey].add(mcno));
    });

    return aggregatedMap;
}

// Convert bucket map to sorted response format
function formatResponse(bucketMap) {
    const sortedKeys = Object.keys(bucketMap).sort((a, b) => new Date(a) - new Date(b));

    return {
        categories: sortedKeys.map((key) => {
            const date = new Date(key);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }),
        data: sortedKeys.map((key) => bucketMap[key].size),
    };
}

export default async function McRun(fastify, opts) {
    fastify.get('/api/mc-run', async (request, reply) => {
        const { smallInterval = 5, largeInterval = 15 } = request.query;

        const logData = loadLogData();

        // Define the time range based on the data
        const timestamps = logData.map((entry) => parseDate(entry.HH)).filter((d) => !isNaN(d));
        if (timestamps.length === 0) {
            return reply.code(400).send({ error: 'No valid log data found' });
        }

        const start = new Date(Math.min(...timestamps));
        const end = new Date(Math.max(...timestamps));

        // Generate time buckets for the smallest interval
        const smallBuckets = generateBuckets(start, end, parseInt(smallInterval, 10));
        const smallBucketMap = mapDataToBuckets(logData, smallBuckets);

        // Aggregate small buckets to larger intervals
        const largeBucketMap = aggregateBuckets(smallBucketMap, parseInt(largeInterval, 10));

        // Format response
        const response = {
            smallInterval: {
                ...formatResponse(smallBucketMap),
                name: new Date().toISOString().split('T')[0],
            },
            largeInterval: {
                ...formatResponse(largeBucketMap),
                name: new Date().toISOString().split('T')[0],
            },
        };

        return response;
    });
}
