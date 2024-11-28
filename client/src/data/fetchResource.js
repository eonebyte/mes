class Resource {
    constructor(id, name, line, lineno, status, plan_qty, progress, uuid) {
        this.id = id;
        this.name = name;
        this.line = line;
        this.lineno = lineno;
        this.status = status;
        this.image = "/src/assets/images/machine.png";
        this.plan_qty = plan_qty;
        this.progress = progress;
        this.uuid = uuid;
    }
}

class Plan {
    constructor(id, title, planNo, startDate, status, planQty, progress, resourceId) {
        this.id = id;
        this.title = title;
        this.planNo = planNo;
        this.startDate = startDate;
        this.status = status;
        this.planQty = planQty;
        this.progress = progress;
        this.resourceId = resourceId;
    }
}

const plans = [
    new Plan(
        108,
        "Plan to start at 2024-11-26",
        '1234HJKDS',
        "2024-11-26T00:00:00Z",
        "Ready",
        1000,
        350,
        1
    ),
    new Plan(
        109,
        "Plan to start at 2024-11-26",
        '1234HJKDS',
        "2024-11-26T00:00:00Z",
        "On Hold",
        1000,
        350,
        1
    ),
    new Plan(
        111,
        "Plan to start at 2024-11-27",
        '343423DSDS',
        "2024-11-27T00:07:00Z",
        "Released",
        2000,
        0,
        1
    ),
    new Plan(
        112 ,
        "Plan to start at 2024-11-26",
        '5455GGGH',
        "2024-11-26T00:00:00Z",
        "Released",
        500,
        50,
        2
    ),

];

const resources = [
    new Resource(1, 'MC001', 'Line 1', 101, 'Running', 1000, 350, 'c6a7a20e-d2d4-4b49-9bb5-1e2bc6625f8e'),
    new Resource(2, 'MC002', 'Line 2', 102, 'Running', 500, 50, '8bff4e3a-7db5-4c27-9a5f-b5193d6c96c4'),
    new Resource(3, 'MC003', 'Line 3', 103, 'Running', 300, 100, '2c6f6d78-d493-45c1-b1b7-cb482f2288a7'),
    new Resource(4, 'MC004', 'Line 4', 104, 'Fault', 400, 150, 'e8e58f17-cb8c-45cc-9a87-41c03b187ab4'),
    new Resource(5, 'MC005', 'Line 5', 105, 'Running', 600, 350, 'e234bc93-1267-4e0a-a9e4-3c1f83f24877'),
    new Resource(6, 'MC006', 'Line 6', 106, 'Running', 550, 50, '5e3f8bc9-94d2-4a56-8306-f1c2448dc6db'),
    new Resource(7, 'MC007', 'Line 7', 107, 'Running', 700, 300, 'd3c5c8db-d945-4306-b86a-df4e4d8e2b89'),
    new Resource(8, 'MC008', 'Line 8', 108, 'Running', 450, 200, 'f1a4e3ed-870e-42eb-8ff4-8a1834d832cb'),
    new Resource(9, 'MC009', 'Line 9', 109, 'Running', 800, 650, '7b21a506-e60e-46b6-931e-917c908c10bc'),
    new Resource(10, 'MC010', 'Line 10', 110, 'Running', 900, 100, '96e21e68-880b-4e0e-933d-43160a6c74c8'),
    new Resource(11, 'MC011', 'Line 11', 111, 'Idle', 1000, 700, '14b352a1-4f7f-4956-99b6-8a21eaf6305e'),
    new Resource(12, 'MC012', 'Line 12', 112, 'Fault', 1200, 550, '4783f8b1-37e1-4663-9c6c-5d02c8e4a49d'),
];

export { Resource, Plan, plans, resources };
