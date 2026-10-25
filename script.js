(() => {
    'use strict';
    const core = window.FateSpinnerCore;
    const STORAGE_KEY = 'fatespinner.choices.v1';
    const SPIN_DURATION = 3600;
    const colors = ['#dce7fa', '#eef2fa', '#c5d6f1', '#e5eaf4', '#b4c9ec'];
    const state = { items: [], isSpinning: false, currentRotation: 0, winnerIndex: -1, undoItems: null };
    const elements = Object.fromEntries(['wheel', 'wheelCenter', 'editChoicesLink', 'spinBtn', 'spinHint', 'lastPick', 'wordInput', 'addWordBtn', 'choiceForm', 'itemsList', 'resetBtn', 'exampleBtn', 'emptyState', 'itemCount', 'saveNotice', 'undoBtn', 'inputError', 'statusMessage', 'resultDialog', 'winnerName', 'resultDetail', 'spinAgainBtn', 'removeWinnerBtn', 'closeResult'].map(id => [id, document.getElementById(id)]));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let finishTimer;
    let finishCurrentSpin = null;

    function announce(message) { elements.statusMessage.textContent = message; }

    function saveChoices() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
            elements.saveNotice.textContent = 'Choices are saved in this browser.';
        } catch {
            elements.saveNotice.textContent = 'Browser storage is unavailable. Keep this tab open to retain your choices.';
        }
    }

    function loadChoices() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            state.items = saved ? core.restoreChoices(JSON.parse(saved)) : [];
        } catch {
            elements.saveNotice.textContent = 'Browser storage is unavailable. Keep this tab open to retain your choices.';
        }
    }

    function updateControls() {
        const count = state.items.length;
        elements.spinBtn.disabled = count < 2 || state.isSpinning;
        elements.spinBtn.firstChild.textContent = state.isSpinning ? 'Choosing… ' : 'Spin the wheel ';
        elements.spinHint.textContent = state.isSpinning ? 'A decision is on its way…' : count < 2 ? `Add ${2 - count} ${count === 1 ? 'more choice' : 'choices'} to get started.` : `${count} entries. One decision. Give it a spin.`;
        elements.wordInput.disabled = state.isSpinning;
        elements.addWordBtn.disabled = state.isSpinning;
        elements.resetBtn.disabled = !count || state.isSpinning;
        elements.exampleBtn.disabled = state.isSpinning;
        elements.undoBtn.disabled = state.isSpinning;
        elements.itemsList.querySelectorAll('button').forEach(button => { button.disabled = state.isSpinning; });
        elements.wheel.parentElement.classList.toggle('is-spinning', state.isSpinning);
        elements.wheelCenter.textContent = count || '?';
        elements.editChoicesLink.firstChild.textContent = count ? 'Edit your choices ' : 'Add your choices ';
    }

    function render() {
        const count = state.items.length;
        elements.itemsList.replaceChildren();
        const list = document.createDocumentFragment();
        state.items.forEach((item, index) => {
            const li = document.createElement('li');
            const number = document.createElement('span');
            number.className = 'item-number';
            number.textContent = String(index + 1).padStart(2, '0');
            number.setAttribute('aria-hidden', 'true');
            const label = document.createElement('span');
            label.className = 'item-label';
            label.textContent = item;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'remove-btn';
            button.dataset.index = index;
            button.textContent = '×';
            button.setAttribute('aria-label', `Remove entry ${index + 1}: ${item}`);
            li.append(number, label, button);
            list.append(li);
        });
        elements.itemsList.append(list);
        elements.itemCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
        elements.emptyState.hidden = count > 0;
        elements.itemsList.hidden = count === 0;
        elements.undoBtn.hidden = !state.undoItems;
        elements.wheel.replaceChildren();
        elements.wheel.classList.toggle('wheel-empty', count === 0);
        if (!count) {
            elements.wheel.style.background = '';
        } else {
            const angle = 360 / count;
            elements.wheel.style.background = `conic-gradient(${state.items.map((_, i) => `${colors[i % colors.length]} ${i * angle}deg ${(i + 1) * angle}deg`).join(',')})`;
            state.items.forEach((item, i) => {
                const separator = document.createElement('span');
                separator.className = 'wheel-separator';
                separator.style.transform = `rotate(${i * angle - 90}deg)`;
                elements.wheel.append(separator);
                if (count <= 24) {
                    const label = document.createElement('span');
                    label.className = `wheel-text${count > 12 ? ' wheel-number' : ''}`;
                    label.textContent = count > 12 ? i + 1 : item;
                    label.style.transform = `rotate(${i * angle + angle / 2 - 90}deg) translateX(var(--label-offset)) translateY(-50%)`;
                    elements.wheel.append(label);
                }
            });
        }
        updateControls();
    }

    function clearError() {
        elements.inputError.hidden = true;
        elements.wordInput.removeAttribute('aria-invalid');
    }

    function choicesChanged(message) {
        state.currentRotation = 0;
        elements.wheel.style.transform = 'rotate(0deg)';
        state.winnerIndex = -1;
        elements.lastPick.hidden = true;
        saveChoices();
        render();
        announce(message);
    }

    function addItems(event) {
        event.preventDefault();
        if (state.isSpinning) return;
        const parsed = core.parseChoices(elements.wordInput.value, state.items.length);
        if (parsed.error) {
            elements.inputError.textContent = parsed.error;
            elements.inputError.hidden = false;
            elements.wordInput.setAttribute('aria-invalid', 'true');
            elements.wordInput.focus();
            return;
        }
        state.items.push(...parsed.items);
        state.undoItems = null;
        elements.wordInput.value = '';
        clearError();
        choicesChanged(`${parsed.items.length} ${parsed.items.length === 1 ? 'choice' : 'choices'} added. ${state.items.length} entries on the wheel.`);
        elements.wordInput.focus();
    }

    function spin() {
        if (state.isSpinning || state.items.length < 2) return;
        state.isSpinning = true;
        state.winnerIndex = core.randomIndex(state.items.length);
        state.currentRotation = core.planRotation(state.currentRotation, state.items.length, state.winnerIndex);
        updateControls();
        announce('The wheel is spinning.');
        elements.wheel.style.transform = `rotate(${state.currentRotation}deg)`;
        const finish = () => {
            if (!state.isSpinning) return;
            clearTimeout(finishTimer);
            elements.wheel.removeEventListener('transitionend', onEnd);
            finishCurrentSpin = null;
            state.isSpinning = false;
            updateControls();
            const winner = state.items[state.winnerIndex];
            elements.winnerName.textContent = winner;
            elements.resultDetail.textContent = `Selected from ${state.items.length} equally likely entries.`;
            elements.lastPick.textContent = `Last pick: ${winner}`;
            elements.lastPick.hidden = false;
            elements.resultDialog.showModal();
        };
        const onEnd = event => { if (event.target === elements.wheel && event.propertyName === 'transform') finish(); };
        finishCurrentSpin = finish;
        elements.wheel.addEventListener('transitionend', onEnd);
        // The fallback also completes a spin in background tabs where transition events may be skipped.
        finishTimer = setTimeout(finish, reducedMotion.matches ? 0 : SPIN_DURATION + 150);
    }

    elements.choiceForm.addEventListener('submit', addItems);
    elements.wordInput.addEventListener('input', clearError);
    elements.wordInput.addEventListener('keydown', event => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) {
            event.preventDefault();
            elements.choiceForm.requestSubmit();
        }
    });
    elements.spinBtn.addEventListener('click', spin);
    elements.itemsList.addEventListener('click', event => {
        const button = event.target.closest('button[data-index]');
        if (!button || state.isSpinning) return;
        const index = Number(button.dataset.index);
        const [removed] = state.items.splice(index, 1);
        state.undoItems = null;
        choicesChanged(`${removed} removed. ${state.items.length} entries remain.`);
        const nextButton = elements.itemsList.querySelectorAll('button')[Math.min(index, state.items.length - 1)];
        (nextButton || elements.wordInput).focus();
    });
    elements.resetBtn.addEventListener('click', () => {
        if (state.isSpinning || !state.items.length) return;
        state.undoItems = [...state.items];
        state.items = [];
        choicesChanged('All choices cleared. Use Undo clear to restore them.');
        elements.undoBtn.focus();
    });
    elements.undoBtn.addEventListener('click', () => {
        if (state.isSpinning || !state.undoItems) return;
        state.items = state.undoItems;
        state.undoItems = null;
        choicesChanged(`${state.items.length} choices restored.`);
        elements.resetBtn.focus();
    });
    elements.exampleBtn.addEventListener('click', () => {
        if (state.isSpinning || state.items.length) return;
        state.items = ['Pizza', 'Sushi', 'Tacos', 'Pasta', 'Something new'];
        state.undoItems = null;
        choicesChanged('Lunch choices added. Ready to spin.');
        elements.spinBtn.focus();
    });
    elements.closeResult.addEventListener('click', () => elements.resultDialog.close());
    elements.resultDialog.addEventListener('close', () => elements.spinBtn.focus());
    elements.spinAgainBtn.addEventListener('click', () => {
        elements.resultDialog.close();
        spin();
    });
    elements.removeWinnerBtn.addEventListener('click', () => {
        if (state.winnerIndex < 0) return;
        const [removed] = state.items.splice(state.winnerIndex, 1);
        state.undoItems = null;
        elements.resultDialog.close();
        choicesChanged(`${removed} removed. ${state.items.length} entries remain.`);
        (state.items.length > 1 ? elements.spinBtn : elements.wordInput).focus();
    });
    reducedMotion.addEventListener('change', event => {
        if (event.matches && finishCurrentSpin) finishCurrentSpin();
    });
    loadChoices();
    render();
})();
