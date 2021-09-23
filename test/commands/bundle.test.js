"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@oclif/test");
describe('bundle', () => {
    test_1.test
        .stdout()
        .command(['bundle'])
        .it('runs hello', ctx => {
        (0, test_1.expect)(ctx.stdout).to.contain('hello world');
    });
    test_1.test
        .stdout()
        .command(['bundle', '--name', 'jeff'])
        .it('runs hello --name jeff', ctx => {
        (0, test_1.expect)(ctx.stdout).to.contain('hello jeff');
    });
});
//# sourceMappingURL=bundle.test.js.map