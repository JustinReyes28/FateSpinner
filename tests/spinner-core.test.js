'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../spinner-core.js');

test('bulk choices trim blank lines, retain punctuation and allow duplicate entries', () => {
    assert.deepEqual(core.parseChoices('  Pizza, please \r\n\n Sushi\nSushi '), { items: ['Pizza, please', 'Sushi', 'Sushi'] });
});

test('invalid or oversized input is rejected without partial additions', () => {
    assert.ok(core.parseChoices(' \n ').error);
    assert.ok(core.parseChoices('x'.repeat(81)).error);
    assert.ok(core.parseChoices('One\nTwo', 59).error);
    assert.equal(core.parseChoices('One', 59).items.length, 1);
});

test('saved choices are bounded and validated before rendering', () => {
    assert.deepEqual(core.restoreChoices({ items: ['bad shape'] }), []);
    assert.deepEqual(core.restoreChoices([null, 12, '', '  ', ' Valid ', 'x'.repeat(81), '<b>Text</b>']), ['Valid', '<b>Text</b>']);
    assert.equal(core.restoreChoices(Array(100).fill('Choice')).length, 60);
});

test('every possible winner lands under the pointer for every supported wheel size', () => {
    for (let count = 2; count <= core.MAX_ITEMS; count++) {
        for (let index = 0; index < count; index++) {
            for (const rotation of [0, 359.99, 12345.67, 987654.32]) {
                for (const offset of [0, 0.5, 1]) {
                    const destination = core.planRotation(rotation, count, index, offset);
                    assert.ok(destination >= rotation + 1800);
                    assert.equal(core.winnerIndex(destination, count), index, `count=${count} index=${index} rotation=${rotation}`);
                    const position = core.normalizeAngle(-destination) / (360 / count) - index;
                    assert.ok(position > 0.19 && position < 0.81, 'landing stays away from segment borders');
                }
            }
        }
    }
});

test('random selection rejects the biased tail and supports every index', () => {
    const values = [4294967295, 4294967294, 4];
    const cryptoSource = { getRandomValues(array) { array[0] = values.shift(); return array; } };
    assert.equal(core.randomIndex(3, cryptoSource), 2);
    assert.deepEqual(values, [4]);
    for (let index = 0; index < 60; index++) {
        assert.equal(core.randomIndex(60, { getRandomValues(array) { array[0] = index; return array; } }), index);
    }
});
