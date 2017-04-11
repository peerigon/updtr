import createUpdateTask from "../../../src/tasks/util/createUpdateTask";

const baseOutdated = {
    name: "some-module",
    current: "1.0.0",
    latest: "2.0.0",
    wanted: "1.8.0",
};
const baseUpdtrConfig = {
    updateTo: "latest",
};

describe("createUpdateTask()", () => {
    test("should return a valid update task", () => {
        expect(
            createUpdateTask(baseOutdated, baseUpdtrConfig)
        ).toMatchSnapshot();
    });
    describe("if the nonBreaking flag is set", () => {
        test("should return a valid update task", () => {
            const updtrConfig = { ...baseUpdtrConfig };

            updtrConfig.nonBreaking = true;

            expect(
                createUpdateTask(baseOutdated, updtrConfig)
            ).toMatchSnapshot();
        });
    });
});
