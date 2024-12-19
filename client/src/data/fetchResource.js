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
        '12333DDS',
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
];

const resources = [
    new Resource(1, 'MC001', 'Line 1', 101, 'Inspect', 1000, 350),
];

export { Resource, Plan, plans, resources };
