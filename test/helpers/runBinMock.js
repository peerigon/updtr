/* eslint-disable import/unambiguous */

const path = require("path");

// babel-node would use the current process.cwd() for all the config resolving logic
// That's why we use @babel/register where we can set all the options
require("@babel/register")({
    cwd: path.resolve(__dirname, "..", ".."),
});

require("./binMocks"); // eslint-disable-line import/no-unassigned-import
