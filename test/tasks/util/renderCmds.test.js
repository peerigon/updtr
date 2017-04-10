import {
    renderUpdate,
    renderTest,
    renderRollback,
} from "../../../src/tasks/util/renderCmds";
import FakeUpdtr from "../../helpers/FakeUpdtr";

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

describe("renderCmds", () => {
    describe(".renderUpdate()", () => {
        test("should return an object with pre-rendered commands", () => {
            const updtr = new FakeUpdtr({
                registry: "http://example.com",
            });

            expect(renderUpdate(updtr, updateTasks)).toMatchSnapshot();
        });
    });
    describe(".renderTest()", () => {
        test("should return an object with pre-rendered commands", () => {
            const updtr = new FakeUpdtr();

            expect(renderTest(updtr)).toMatchSnapshot();
        });
    });
    describe(".renderRollback()", () => {
        test("should return an object with pre-rendered commands", () => {
            const updtr = new FakeUpdtr({
                registry: "http://example.com",
            });

            expect(renderRollback(updtr, updateTasks)).toMatchSnapshot();
        });
    });
});
