import { faker } from '@faker-js/faker'  // Make sure to import the correct version of Faker
import { formatTime, getRandomVariant } from './utils'

// Define the start, end, and current date
const START_DATE = new Date('2019-12-17T12:00:00')
const END_DATE = new Date('2019-12-17T15:00:00')
const CURRENT_DATE = new Date('2019-12-17T13:00:00')

// Calculate duration and the column duration (intervals of 5 minutes)
const DURATION = END_DATE.getTime() - START_DATE.getTime()
const COL_DURATION = 1000 * 60 * 5  // 5 minutes in milliseconds
const COLS_COUNT = Math.ceil(DURATION / COL_DURATION)

// Generate column data for the timeline (each column represents a time slot)
const COLS = [...Array(COLS_COUNT).keys()].map(i => {
    const start = new Date(START_DATE.getTime() + i * COL_DURATION)
    const end = new Date(START_DATE.getTime() + (i + 1) * COL_DURATION)

    return {
        key: `col-${i}`,
        title: formatTime(start),
        start,
        end
    }
})

// Generate row data for the timeline, each row has elements with tasks
const ROWS = [
    {
        title: faker.person.jobType(),  // Using updated faker.person method
        key: `row-1`,
        elements: [
            {
                key: 'element-1',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T12:03:00'),
                end: new Date('2019-12-17T12:25:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-2',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T12:30:00'),
                end: new Date('2019-12-17T12:45:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-3',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T13:30:00'),
                end: new Date('2019-12-17T14:59:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            }
        ]
    },
    {
        title: faker.person.jobType(),  // Updated method
        key: `row-2`,
        elements: [
            {
                key: 'element-1',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T12:15:00'),
                end: new Date('2019-12-17T12:30:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-2',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T12:42:00'),
                end: new Date('2019-12-17T13:00:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-3',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T13:03:00'),
                end: new Date('2019-12-17T13:40:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            }
        ]
    },
    {
        title: faker.person.jobType(),  // Updated method
        key: `row-3`,
        elements: [
            {
                key: 'element-1',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T12:00:00'),
                end: new Date('2019-12-17T12:45:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-2',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T12:52:00'),
                end: new Date('2019-12-17T13:05:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-3',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T13:09:00'),
                end: new Date('2019-12-17T13:45:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            },
            {
                key: 'element-4',
                title: faker.person.jobTitle(),  // Updated method
                content: faker.lorem.paragraph(),
                start: new Date('2019-12-17T13:50:00'),
                end: new Date('2019-12-17T15:00:00'),
                color: getRandomVariant(['red', 'grey', 'blue'])
            }
        ]
    }
]

export { START_DATE, END_DATE, CURRENT_DATE, COLS, ROWS }
