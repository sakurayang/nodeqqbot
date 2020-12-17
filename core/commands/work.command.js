const db = require("../libs/db");
const knex = db.getCore();

(async () => {
    let isTableExist = knex.schema.hasTable("work");
    if (!isTableExist) {
        knex.schema.createTable("work", table => {
            table.bigIncrements("id");
            table.timestamp("create_date").notNullable();
            table.timestamp("update_date").notNullable();
            table.string("type").notNullable();
            table.string("title").notNullable();
            table.bigInteger("group").notNullable();
            table.string("detail").notNullable();
            table.index("id");
            table.index("create_date");
            table.index("group");
        });
    }
})();

function setWork(params, sender) {}

function getWork(params) {}

function listWork(params, sender) {}

function name(params) {}

module.exports = {
    work: {
        desc: "building",
        docs: "building",
        work: () => {
            return "building";
        },
        format: /w[\w]*/
    }
};
