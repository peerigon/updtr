"use strict";

const chai = require("chai");

const util = require("../../lib/reporters/util");

const expect = chai.expect;

describe("util", () => {
    describe("modulesMissingMessage", () => {
        const modulesMissingMessage = util.modulesMissingMessage;

        it("should contain the list of missing modules", () => {
            const event = {
                infos: [{
                    name: "requests",
                }, {
                    name: "leftpad",
                }],
            };

            expect(modulesMissingMessage(event)).to.contain("requests, leftpad");
        });
    });
});
