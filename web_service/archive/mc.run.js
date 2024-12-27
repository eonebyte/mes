import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to load data from JSON file
function loadLogData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.resolve(__dirname, '../../data/logData24H.json');

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

// Map data to the nearest bucket (5 minutes) and count machine occurrences
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

        // Find the nearest bucket (5 minutes)
        const bucket = buckets.find((b) => b <= entryDate && entryDate < new Date(b.getTime() + 5 * 60000));
        if (bucket) {
            bucketMap[bucket.toISOString()].add(entry.MCNO);
        }
    });

    // Count how many machines are running (appear multiple times within 5 minutes)
    const countedBucketMap = {};
    Object.keys(bucketMap).forEach((key) => {
        countedBucketMap[key] = bucketMap[key].size;
    });

    return countedBucketMap;
}

// Format response for both small and large intervals
function formatResponse(bucketMap, intervalMinutes) {
    const sortedKeys = Object.keys(bucketMap).sort((a, b) => new Date(a) - new Date(b));

    // Group sorted keys by date
    const groupedByDate = sortedKeys.reduce((acc, key) => {
        const date = new Date(key);
        const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

        if (!acc[dateString]) {
            acc[dateString] = [];
        }
        acc[dateString].push(key);

        return acc;
    }, {});

    // Format categories
    const categories = Object.keys(groupedByDate).map((date) => {
        const dateBuckets = groupedByDate[date];

        return {
            categories: dateBuckets.map((key) => {
                const date = new Date(key);
                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }),
            name: date,  // The date itself (e.g., 2024-12-15 or 2024-12-16)
        };
    });

    // Combine all data into one array
    const combinedData = sortedKeys.map((key) => bucketMap[key]);

    return {
        categories,
        data: combinedData,  // All data combined into a single array
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

        // Generate time buckets for the smallest interval (5 minutes)
        const smallBuckets = generateBuckets(start, end, parseInt(smallInterval, 10));
        const smallBucketMap = mapDataToBuckets(logData, smallBuckets);

        // Generate time buckets for the larger interval (15 minutes) - no aggregation, just matching
        const largeBuckets = generateBuckets(start, end, parseInt(largeInterval, 10));
        const largeBucketMap = mapDataToBuckets(logData, largeBuckets);

        // Generate time buckets for the 2-hour small interval
        const smallIntervalTwoHoursAgoStart = new Date(end.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
        const smallIntervalTwoHoursAgoBuckets = generateBuckets(smallIntervalTwoHoursAgoStart, end, 5); // 5-minute intervals
        const smallIntervalTwoHoursAgoMap = mapDataToBuckets(logData, smallIntervalTwoHoursAgoBuckets);

        // Format response
        const response = {
            smallInterval: {
                ...formatResponse(smallBucketMap, 5),
            },
            largeInterval: {
                ...formatResponse(largeBucketMap, 15),
            },
            smallIntervalTwoHoursAgo: {
                ...formatResponse(smallIntervalTwoHoursAgoMap, 5),
            }
        };

        return response;
    });
}
