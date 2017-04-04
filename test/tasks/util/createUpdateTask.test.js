"use strict";

const dependencyTypes = require("../../../lib/constants/dependencyTypes");
const createUpdateTask = require("../../../lib/tasks/util/createUpdateTask");

const baseOutdated = {
    name: "some-module",
    type: dependencyTypes.REGULAR,
    current: "1.0.0",
    latest: "2.0.0",
    wanted: "1.8.0",
};
const baseInstanceConfig = {
    updateTo: "latest",
};

describe("createUpdateTask()", () => {
    test("should return a valid update task", () => {
        expect(
            createUpdateTask(baseOutdated, baseInstanceConfig)
        ).toMatchSnapshot();
    });
    describe("if the 'wanted' flag is set", () => {
        test("should return a valid update task", () => {
            const instanceConfig = Object.assign({}, baseInstanceConfig);

            instanceConfig.updateTo = "wanted";

            expect(
                createUpdateTask(baseOutdated, instanceConfig)
            ).toMatchSnapshot();
        });
    });
});
