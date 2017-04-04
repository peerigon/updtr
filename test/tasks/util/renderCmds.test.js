import { REGULAR } from "../../../src/constants/dependencyTypes";
import renderCmds from "../../../src/tasks/util/renderCmds";
import cmds from "../../../src/exec/cmds";

const baseInstanceMock = {
    cmds: {
        install: cmds.npm.install,
        test: cmds.npm.test,
    },
};

describe.skip("renderCmds", () => {
    test("should return an object with pre-rendered commands", () => {
        const instance = { ...baseInstanceMock };
        const updateTask = {
            name: "my-module",
            updateTo: "2.0.0",
            rollbackTo: "1.0.0",
            type: REGULAR,
        };

        expect(renderCmds(instance, updateTask)).toEqual({
            update: "npm install my-module@2.0.0",
            test: "npm test",
            rollback: "npm install my-module@1.0.0",
        });
    });
    describe("custom registry", () => {
        test("should return an object with pre-rendered commands", () => {
            const instance = { ...baseInstanceMock };
            const updateTask = {
                name: "my-module",
                updateTo: "2.0.0",
                rollbackTo: "1.0.0",
                type: REGULAR,
            };

            instance.registry = "http://example.com";

            expect(renderCmds(instance, updateTask)).toEqual({
                update: "npm install --registry http://example.com my-module@2.0.0",
                test: "npm test",
                rollback: "npm install --registry http://example.com my-module@1.0.0",
            });
        });
    });
});
