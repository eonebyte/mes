class Resource {
    constructor(id, line, code, status) {
        this.id = id;
        this.line = line;
        this.code = code
        this.status = status;
        this.image = "/src/assets/images/machine.png";
    }
}

class Plan {
    constructor(id, resource_id, title, plan_no, order_no, part_no, seq_desc,
        part_drawing, start_date, status, plan_qty, togo_qty,
        output_qty, good_qty, defect_qty, lost_qty, cycletime,
        part_model, cust_order, part_desc, spec, cavity, mold,
        cycles, revision, project, batch, output_per_cycle) {
        this.id = id;
        this.resource_id = resource_id;
        this.title = title;
        this.plan_no = plan_no;
        this.order_no = order_no;
        this.part_no = part_no;
        this.seq_desc = seq_desc;
        this.part_drawing = part_drawing;
        this.start_date = start_date;
        this.status = status;
        this.plan_qty = plan_qty;
        this.togo_qty = togo_qty;
        this.output_qty = output_qty;
        this.good_qty = good_qty;
        this.defect_qty = defect_qty;
        this.lost_qty = lost_qty;
        this.cycletime = cycletime;
        this.part_model = part_model;
        this.cust_order = cust_order;
        this.part_desc = part_desc;
        this.spec = spec;
        this.cavity = cavity;
        this.mold = mold;
        this.cycles = cycles;
        this.revision = revision;
        this.project = project;
        this.batch = batch;
        this.output_per_cycle = output_per_cycle;
    }
}

const plans = [
    new Plan(
        108, // id
        1000066, //resource id
        '-', //title
        'JO123', //plan_no
        'MO23110001', //order no
        'ZP-S323-05714', //part no
        '10-ABC',
        '-', //part drawing
        '2024-11-26T00:00:00Z', // start date
        'Running', //status
        10000, //plan_qty
        9057, //togo_qty
        943, //output_qty
        943, //good_qty
        0, //defect qty
        0, //lost qty
        10, //cycletime
        '-', //part model
        '-', //cust order
        'this part description', //part desc
        '-', //spec
        1, //cavity
        '-', //mold
        916, //cycles
        0, //revision
        '-', //project
        '-', //batch
        '2/2' //output per cycle
    ),
];

const resources = [
    new Resource(1000000, 'A101', 64, 'Inspect'),
];

export { Resource, Plan, plans, resources };
