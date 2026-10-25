/* Shared, dependency-free wheel math. Also usable from Node's built-in test runner. */
(function (root) {
    'use strict';

    const MAX_ITEMS = 60;
    const MAX_LABEL_LENGTH = 80;
    const normalizeAngle = angle => ((angle % 360) + 360) % 360;

    function parseChoices(text, existingCount = 0) {
        const items = text.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
        if (!items.length) return { error: 'Add a choice first. Put each choice on its own line.' };
        if (items.some(item => item.length > MAX_LABEL_LENGTH)) {
            return { error: `Keep each choice to ${MAX_LABEL_LENGTH} characters or fewer.` };
        }
        if (existingCount + items.length > MAX_ITEMS) {
            return { error: `The wheel holds ${MAX_ITEMS} entries. Remove a few or add fewer choices.` };
        }
        return { items };
    }

    function restoreChoices(value) {
        if (!Array.isArray(value)) return [];
        return value.filter(item => typeof item === 'string' && item.trim() && item.trim().length <= MAX_LABEL_LENGTH)
            .slice(0, MAX_ITEMS).map(item => item.trim());
    }

    function winnerIndex(rotation, count) {
        return Math.min(count - 1, Math.floor(normalizeAngle(-rotation) / (360 / count)));
    }

    function planRotation(currentRotation, count, selectedIndex, offset = 0.5) {
        // Land inside the segment, away from either boundary, so the pointer is unambiguous.
        const segmentPosition = (selectedIndex + 0.2 + Math.max(0, Math.min(1, offset)) * 0.6) * (360 / count);
        const destination = normalizeAngle(-segmentPosition);
        return currentRotation + 5 * 360 + normalizeAngle(destination - normalizeAngle(currentRotation));
    }

    function randomIndex(count, cryptoSource = root.crypto) {
        if (!cryptoSource || typeof cryptoSource.getRandomValues !== 'function') return Math.floor(Math.random() * count);
        // Reject the uneven tail instead of giving early entries an extra chance.
        const range = 2 ** 32;
        const limit = range - (range % count);
        const values = new Uint32Array(1);
        do { cryptoSource.getRandomValues(values); } while (values[0] >= limit);
        return values[0] % count;
    }

    const api = { MAX_ITEMS, MAX_LABEL_LENGTH, normalizeAngle, parseChoices, restoreChoices, winnerIndex, planRotation, randomIndex };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.FateSpinnerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
