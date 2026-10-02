function addLootItemRow(qty = 1, value = '', name = '') {
    const container = document.getElementById('loot-items-container');
    if (!container) return;

    const rowId = 'loot-row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const row = document.createElement('div');
    row.id = rowId;
    row.className = 'loot-item-row';
    row.style.cssText = 'display: grid; grid-template-columns: 50px 1fr 80px 24px; gap: 6px; align-items: center;';
    
    row.innerHTML = `
        <input type="number" class="stat-input loot-item-qty" value="${escapeHtml(qty)}" min="1" placeholder="Qty" style="border: 1px solid var(--border-color); padding: 4px; border-radius: 2px; text-align: center;" title="Quantity">
        <input type="text" class="stat-input loot-item-desc" value="${escapeHtml(name)}" placeholder="Item (e.g. Ruby, Crown)" style="border: 1px solid var(--border-color); padding: 4px 6px; border-radius: 2px; text-align: left;" title="Description">
        <input type="number" class="stat-input loot-item-val" value="${escapeHtml(value)}" min="0" placeholder="GP each" style="border: 1px solid var(--border-color); padding: 4px 6px; border-radius: 2px; text-align: right;" title="Value per item in GP">
        <button type="button" onclick="removeLootItemRow('${rowId}')" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.9rem;" title="Remove" aria-label="Remove">${getIcon('close', 15)}</button>
    `;

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateLootTotal);
    });

    container.appendChild(row);
    calculateLootTotal();
}

function removeLootItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        calculateLootTotal();
    }
}

function openLootModal() {
    const container = document.getElementById('loot-items-container');
    if (container && container.children.length === 0) {
        addLootItemRow(1, '', '');
    }
    document.getElementById('loot-calc-modal').style.display = 'flex';
    calculateLootTotal();
}

function closeLootModal() {
    document.getElementById('loot-calc-modal').style.display = 'none';
}

function calculateLootTotal() {
    const cp = Number(document.getElementById('loot-cp').value) || 0;
    const sp = Number(document.getElementById('loot-sp').value) || 0;
    const ep = Number(document.getElementById('loot-ep').value) || 0;
    const gp = Number(document.getElementById('loot-gp').value) || 0;
    const pp = Number(document.getElementById('loot-pp').value) || 0;
    const pcs = Math.max(1, Number(document.getElementById('loot-party-pcs').value) || 1);

    const totalCoinsGP = Math.floor((cp / 100) + (sp / 10) + (ep / 2) + gp + (pp * 5));
    const coinShareGP = Math.floor(totalCoinsGP / pcs);
    const remainderGP = totalCoinsGP - (coinShareGP * pcs);

    let personalItemsGP = 0;
    document.querySelectorAll('.loot-item-row').forEach(row => {
        const qty = Number(row.querySelector('.loot-item-qty').value) || 0;
        const val = Number(row.querySelector('.loot-item-val').value) || 0;
        personalItemsGP += (qty * val);
    });

    const myTotalGP = coinShareGP + personalItemsGP;

    const shareDisplay = document.getElementById('loot-calc-coin-share');
    const remainderDisplay = document.getElementById('loot-calc-remainder');
    const totalDisplay = document.getElementById('loot-calc-total');

    if (shareDisplay) shareDisplay.innerText = `${coinShareGP} GP`;
    if (remainderDisplay) remainderDisplay.innerText = `${remainderGP} GP`;
    if (totalDisplay) totalDisplay.innerText = `${myTotalGP} GP`;

    return { totalCoinsGP, coinShareGP, remainderGP, myTotalGP, pcs };
}

function applyLootCalculation() {
    const { myTotalGP, pcs } = calculateLootTotal();
    const treasureInput = document.getElementById('calc-xp-treasure');
    if (treasureInput) {
        treasureInput.value = myTotalGP;
    }

    // Автоматическое зачисление монет в кошелек (доля персонажа)
    if (currentCharacter) {
        if (!currentCharacter.coins) currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
        const cp = Number(document.getElementById('loot-cp')?.value) || 0;
        const sp = Number(document.getElementById('loot-sp')?.value) || 0;
        const ep = Number(document.getElementById('loot-ep')?.value) || 0;
        const gp = Number(document.getElementById('loot-gp')?.value) || 0;
        const pp = Number(document.getElementById('loot-pp')?.value) || 0;
        const shareCount = pcs || 1;

        currentCharacter.coins.cp = (currentCharacter.coins.cp || 0) + Math.floor(cp / shareCount);
        currentCharacter.coins.sp = (currentCharacter.coins.sp || 0) + Math.floor(sp / shareCount);
        currentCharacter.coins.ep = (currentCharacter.coins.ep || 0) + Math.floor(ep / shareCount);
        currentCharacter.coins.gp = (currentCharacter.coins.gp || 0) + Math.floor(gp / shareCount);
        currentCharacter.coins.pp = (currentCharacter.coins.pp || 0) + Math.floor(pp / shareCount);

        // Автоматическая запись заявленных личных драгоценностей
        if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
        document.querySelectorAll('.loot-item-row').forEach(row => {
            const qty = Number(row.querySelector('.loot-item-qty')?.value) || 1;
            const typed = row.querySelector('.loot-item-desc')?.value.trim() || '';
            const val = Number(row.querySelector('.loot-item-val')?.value) || 0;
            const desc = typed || 'Gem';

            // Skip blank rows (no name and no value) instead of adding a 0 gp "Gem".
            if (val > 0 || typed) {
                currentCharacter.inventory.push({
                    name: desc,
                    qty: qty,
                    weight: 1, // стандартный вес драгоценного камня в BECMI (1 cn)
                    valueGP: val,
                    location: 'Pouch',
                    isValuable: true
                });
            }
        });

        if (typeof syncInventoryUI === 'function') syncInventoryUI();
        if (typeof debouncedSave === 'function') debouncedSave();

        // Record the share in the adventure log.
        const coinTxt = [['pp', pp], ['gp', gp], ['ep', ep], ['sp', sp], ['cp', cp]]
            .map(([k, v]) => [k, Math.floor(v / shareCount)]).filter(([, v]) => v > 0).map(([k, v]) => `${v.toLocaleString('en-US')} ${k}`);
        const gems = [...document.querySelectorAll('.loot-item-row')].map(row => {
            const qty = Number(row.querySelector('.loot-item-qty')?.value) || 1;
            const typed = row.querySelector('.loot-item-desc')?.value.trim() || '';
            const val = Number(row.querySelector('.loot-item-val')?.value) || 0;
            return (val > 0 || typed) ? `${qty > 1 ? qty + '× ' : ''}${typed || 'Gem'}${val ? ` (${val.toLocaleString('en-US')} gp)` : ''}` : '';
        }).filter(Boolean);
        if (coinTxt.length || gems.length) {
            const party = shareCount > 1 ? ` (share of ${shareCount})` : '';
            addChronicleEntry('treasure', `Treasure${party}: ${[coinTxt.join(', '), gems.join(', ')].filter(Boolean).join('; ')}. Worth ${Number(myTotalGP).toLocaleString('en-US')} gp in all.`,
                { coins: Object.fromEntries(coinTxt.map(t => t.split(' ').reverse())), gems, shareOf: shareCount, totalGP: myTotalGP });
        }
    }

    resetLootCalculator();   // applying the same haul twice must not add it twice
    updateXPPreview();
    closeLootModal();
}

function resetLootCalculator() {
    ['loot-cp', 'loot-sp', 'loot-ep', 'loot-gp', 'loot-pp'].forEach(id => safeSetVal(id, ''));
    const container = document.getElementById('loot-items-container');
    if (container) container.innerHTML = '';
    calculateLootTotal();
}

function updateXPPreview() {
    if (!currentCharacter) return;
    const monster = Number(document.getElementById('calc-xp-monster').value) || 0;
    const treasure = Number(document.getElementById('calc-xp-treasure').value) || 0;
    const baseXP = monster + treasure;
    
    if (baseXP <= 0) {
        document.getElementById('xp-preview').innerText = "";
        return;
    }

    const primeBonus = getPrimeRequisiteBonus(getXpBonusClass(currentCharacter), currentCharacter.abilities);
    const mapBonus = document.getElementById('bonus-map').checked ? 5 : 0;
    const marriedBonus = document.getElementById('bonus-married').checked ? 5 : 0;
    const totalBonusPct = primeBonus + mapBonus + marriedBonus;

    const finalXP = Math.floor(baseXP + (baseXP * (totalBonusPct / 100)));
    document.getElementById('xp-preview').innerText = `Preview: +${baseXP} Base, ${formatPercent(totalBonusPct)} Bonus = +${finalXP} XP Total`;
}

function updateXPDisplay() {
    if (!currentCharacter) {
        document.getElementById('prime-bonus-display').innerText = `+0%`;
        renderXpBar('', 1, 0, null);
        return;
    }

    const primeBonus = getPrimeRequisiteBonus(getXpBonusClass(currentCharacter), currentCharacter.abilities);
    document.getElementById('prime-bonus-display').innerText = formatPercent(primeBonus);

    const table = getXpTableFor(currentCharacter);
    const xp = Number(currentCharacter.experiencePoints) || 0;
    const stage = getCreatureStage(currentCharacter);
    let stageInfo = null;
    if (stage) {
        // Bar from this stage to the next stage, or to 1st level.
        const stages = ClassesDatabase[currentCharacter.characterClass].preStages;
        const next = stages.find(s => s.xp > stage.xp);
        stageInfo = { fromLabel: stage.name, from: stage.xp, toLabel: next ? next.name : 'Level I', to: next ? next.xp : table[1] };
    }
    renderXpBar('', currentCharacter.level, xp, table, stageInfo);
    if (typeof refreshOrnaments === 'function') refreshOrnaments();
}

function updateSubClassDisplay() {
    const subCard = document.getElementById('subclass-xp-card');
    const subLvlGroup = document.getElementById('subclass-level-group');
    const arcaneStartGroup = document.getElementById('arcane-start-group');
    const badge = document.getElementById('subclass-name-badge');
    const primeDisplay = document.getElementById('sub-prime-bonus-display');

    if (!subCard || !subLvlGroup || !arcaneStartGroup) return;

    if (!currentCharacter || !currentCharacter.subClass) {
        subCard.style.display = 'none';
        subLvlGroup.style.display = 'none';
        arcaneStartGroup.style.display = 'none';
        return;
    }

    // Sub-classes that keep their own separate level and XP bar (Shadow Shaman).
    const independentSubclasses = Object.values(ClassesDatabase).filter(c => c.ownXpTrack).map(c => c.name);
    const isArcaneWarrior = currentCharacter.subClass === 'Arcane Warrior';

    if (independentSubclasses.includes(currentCharacter.subClass)) {
        subCard.style.display = 'grid';
        subLvlGroup.style.display = 'flex';
        arcaneStartGroup.style.display = 'none';

        if (badge) badge.innerText = currentCharacter.subClass;

        const subPrimeBonus = getPrimeRequisiteBonus(currentCharacter.subClass, currentCharacter.abilities);
        if (primeDisplay) primeDisplay.innerText = formatPercent(subPrimeBonus);

        const subClassInfo = ClassesDatabase[currentCharacter.subClass];
        const subLvl = currentCharacter.subClassLevel || 1;
        const subXP = currentCharacter.subClassXP || 0;

        renderXpBar('sub-', subLvl, subXP, subClassInfo ? subClassInfo.xpTable : null);
    } else if (isArcaneWarrior) {
        subCard.style.display = 'none';
        subLvlGroup.style.display = 'none';
        arcaneStartGroup.style.display = 'flex';
    } else {
        subCard.style.display = 'none';
        subLvlGroup.style.display = 'none';
        arcaneStartGroup.style.display = 'none';
    }
}

function updateSubXPPreview() {
    if (!currentCharacter || !currentCharacter.subClass) return;
    const monsterInput = document.getElementById('sub-calc-xp-monster');
    const treasureInput = document.getElementById('sub-calc-xp-treasure');
    const previewDisplay = document.getElementById('sub-xp-preview');
    const mapBox = document.getElementById('sub-bonus-map');
    const marriedBox = document.getElementById('sub-bonus-married');

    if (!previewDisplay) return;

    const monster = (monsterInput && monsterInput.value) ? Number(monsterInput.value) : 0;
    const treasure = (treasureInput && treasureInput.value) ? Number(treasureInput.value) : 0;
    const baseXP = monster + treasure;
    
    if (baseXP <= 0) {
        previewDisplay.innerText = "";
        return;
    }

    const primeBonus = getPrimeRequisiteBonus(currentCharacter.subClass, currentCharacter.abilities);
    const mapBonus = (mapBox && mapBox.checked) ? 5 : 0;
    const marriedBonus = (marriedBox && marriedBox.checked) ? 5 : 0;
    const totalBonusPct = primeBonus + mapBonus + marriedBonus;

    const finalXP = Math.floor(baseXP + (baseXP * (totalBonusPct / 100)));
    previewDisplay.innerText = `Preview: +${baseXP} Base, ${formatPercent(totalBonusPct)} Bonus = +${finalXP} XP Total`;
}

// Привязка слушателей калькулятора
['loot-cp', 'loot-sp', 'loot-ep', 'loot-gp', 'loot-pp', 'loot-party-pcs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateLootTotal);
});
['calc-xp-monster', 'calc-xp-treasure'].forEach(id => { 
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateXPPreview); 
});
['bonus-map', 'bonus-married'].forEach(id => { 
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateXPPreview); 
});
['sub-calc-xp-monster', 'sub-calc-xp-treasure'].forEach(id => { 
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateSubXPPreview); 
});
['sub-bonus-map', 'sub-bonus-married'].forEach(id => { 
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateSubXPPreview); 
});


async function copyLootSummary() {
    const cp = Number(document.getElementById('loot-cp')?.value) || 0;
    const sp = Number(document.getElementById('loot-sp')?.value) || 0;
    const ep = Number(document.getElementById('loot-ep')?.value) || 0;
    const gp = Number(document.getElementById('loot-gp')?.value) || 0;
    const pp = Number(document.getElementById('loot-pp')?.value) || 0;
    const pcs = Math.max(1, Number(document.getElementById('loot-party-pcs')?.value) || 1);

    const coinTotalGP = Math.floor((cp / 100) + (sp / 10) + (ep / 2) + gp + (pp * 5));
    const shareGP = Math.floor(coinTotalGP / pcs);
    const remainderGP = coinTotalGP % pcs;

    // Сбор драгоценностей и предметов искусства
    let itemsList = [];
    document.querySelectorAll('.loot-item-row').forEach(row => {
        const qty = Number(row.querySelector('.loot-item-qty')?.value) || 1;
        const desc = row.querySelector('.loot-item-desc')?.value.trim() || 'Valuable';
        const val = Number(row.querySelector('.loot-item-val')?.value) || 0;
        if (val > 0 || desc !== 'Valuable') {
            itemsList.push(`• ${qty > 1 ? `x${qty} ` : ''}${desc} (${val} GP each)`);
        }
    });

    let lines = [
        "=== PARTY TREASURE SUMMARY ===",
        `Total Party Coins: ${coinTotalGP.toLocaleString()} GP value`,
        `Party Size: ${pcs} adventurer(s)`,
        `Each PC Coin Share: ${shareGP.toLocaleString()} GP`,
        remainderGP > 0 ? `Unsplit Coin Remainder: ${remainderGP} GP` : null,
        itemsList.length > 0 ? `\n--- Gems & Art Objects ---\n${itemsList.join('\n')}` : null,
        "=============================="
    ].filter(Boolean);

    const textToCopy = lines.join('\n');

    // Отказоустойчивое копирование (Clipboard API + Fallback Textarea)
    let copied = false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
            copied = true;
        }
    } catch (e) {
        console.warn('Navigator clipboard write failed, attempting fallback...', e);
    }

    if (!copied) {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            copied = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback execCommand copy failed:', err);
        }
        document.body.removeChild(ta);
    }

    // Визуальный отклик на кнопке (зелёная галочка)
    const btn = document.getElementById('loot-copy-btn');
    if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span style="color: var(--good);">${getIcon('check', 13)} Copied to Clipboard!</span>`;
        btn.style.borderColor = 'var(--good)';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.borderColor = 'var(--info)';
        }, 2000);
    }
}

window.addLootItemRow = addLootItemRow;
window.removeLootItemRow = removeLootItemRow;
window.openLootModal = openLootModal;
window.closeLootModal = closeLootModal;
window.calculateLootTotal = calculateLootTotal;
window.applyLootCalculation = applyLootCalculation;
window.copyLootSummary = copyLootSummary;