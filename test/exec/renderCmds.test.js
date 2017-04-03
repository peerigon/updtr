"use strict";

const renderCmds = require("../../lib/exec/renderCmds");
const cmds = require("../../lib/exec/cmds");

const baseInstanceMock = {
    cmds: {
        install: cmds.npm.install,
        test: cmds.npm.test,
    },
};

describe("renderCmds", () => {
    test("should return an object with pre-rendered commands", () => {
        const instance = Object.assign({}, baseInstanceMock);
        const updateTask = {
            name: "my-module",
            updateTo: "2.0.0",
            rollbackTo: "1.0.0",
            type: 0,
        };

        expect(renderCmds(instance, updateTask)).toEqual({
            update: "npm install my-module@2.0.0",
            test: "npm test",
            rollback: "npm install my-module@1.0.0",
        });
    });
    describe("custom registry", () => {
        test("should return an object with pre-rendered commands", () => {
            const instance = Object.assign({
                registry: "http://example.com",
            }, baseInstanceMock);
            const updateTask = {
                name: "my-module",
                updateTo: "2.0.0",
                rollbackTo: "1.0.0",
                type: 0,
            };

            expect(renderCmds(instance, updateTask)).toEqual({
                update: "npm install --registry http://example.com my-module@2.0.0",
                test: "npm test",
                rollback: "npm install --registry http://example.com my-module@1.0.0",
            });
        });
    });
});
