"use strict";

var chai = require("chai");

var util = require("../../lib/reporters/util");

var expect = chai.expect;

describe("util", function () {
    describe("modulesMissingMessage", function () {
        var modulesMissingMessage = util.modulesMissingMessage;

        it("should contain the list of missing modules", function () {
            var event = {
                infos: [{
                    name: "requests"
                }, {
                    name: "leftpad"
                }]
            };

            expect(modulesMissingMessage(event)).to.contain("requests, leftpad");
        });
    });
});
