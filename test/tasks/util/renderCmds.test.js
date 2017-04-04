import { REGULAR } from "../../../src/constants/dependencyTypes";
import renderCmds from "../../../src/tasks/util/renderCmds";
import cmds from "../../../src/exec/cmds";

const baseUpdtrMock = {
    cmds: {
        install: cmds.npm.install,
        test: cmds.npm.test,
    },
};

describe.skip("renderCmds", () => {
    test("should return an object with pre-rendered commands", () => {
        const updtr = { ...baseUpdtrMock };
        const updateTask = {
            name: "my-module",
            updateTo: "2.0.0",
            rollbackTo: "1.0.0",
            type: REGULAR,
        };

        expect(renderCmds(updtr, updateTask)).toEqual({
            update: "npm install my-module@2.0.0",
            test: "npm test",
            rollback: "npm install my-module@1.0.0",
        });
    });
    describe("custom registry", () => {
        test("should return an object with pre-rendered commands", () => {
            const updtr = { ...baseUpdtrMock };
            const updateTask = {
                name: "my-module",
                updateTo: "2.0.0",
                rollbackTo: "1.0.0",
                type: REGULAR,
            };

            updtr.registry = "http://example.com";

            expect(renderCmds(updtr, updateTask)).toEqual({
                update: "npm install --registry http://example.com my-module@2.0.0",
                test: "npm test",
                rollback: "npm install --registry http://example.com my-module@1.0.0",
            });
        });
    });
});
