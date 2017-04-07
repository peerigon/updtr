import renderCmds from "../../../src/tasks/util/renderCmds";
import FakeUpdtr from "../../helpers/FakeUpdtr";

describe("renderCmds", () => {
    test("should return an object with pre-rendered commands", () => {
        const updtr = new FakeUpdtr({
            registry: "http://example.com",
        });
        const updateTasks = [
            {
                name: "module-1",
                updateTo: "2.0.0",
                rollbackTo: "1.0.0",
            },
            {
                name: "module-2",
                updateTo: "2.0.0",
                rollbackTo: "1.0.0",
            },
        ];

        expect(renderCmds(updtr, updateTasks)).toMatchSnapshot();
    });
});
