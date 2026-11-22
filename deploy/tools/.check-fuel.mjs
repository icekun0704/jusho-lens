
(() => {
  'use strict';

  const distanceEl = document.getElementById('distance');
  const fuelEl = document.getElementById('fuel');
  const priceEl = document.getElementById('unitPrice');
  const daysEl = document.getElementById('days');
  const tankEl = document.getElementById('tank');
  const statusEl = document.getElementById('status');
  const summaryEl = document.getElementById('summary');
  const paceEl = document.getElementById('paceNote');
  const resetBtn = document.getElementById('resetBtn');
  const out = {
    kmPerL: document.getElementById('kmPerL'),
    cost: document.getElementById('fuelCost'),
    perKm: document.getElementById('costPerKm'),
    next: document.getElementById('nextFill')
  };

  function parseNumber(raw) {
    const s = String(raw)
      .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/[．。]/g, '.')
      .replace(/[，,]/g, '')
      .replace(/[％%]/g, '')
      .replace(/[¥￥]/g, '')
      .replace(/円/g, '')
      .replace(/km/gi, '')
      .replace(/[lℓ]/gi, '')
      .replace(/日/g, '')
      .replace(/\//g, '')
      .replace(/\s+/g, '');
    if (s === '') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  function yen(n) {
    return Math.round(n).toLocaleString('ja-JP') + '円';
  }

  function num(n, digits) {
    return n.toLocaleString('ja-JP', { maximumFractionDigits: digits });
  }

  function hideError() {
    statusEl.hidden = true;
    statusEl.textContent = '';
  }

  function showError(message) {
    statusEl.hidden = false;
    statusEl.textContent = message;
  }

  function clear(message, pace) {
    Object.values(out).forEach(el => {
      el.textContent = '—';
    });
    summaryEl.textContent = message;
    paceEl.textContent = pace || '';
  }

  function calc() {
    const distance = parseNumber(distanceEl.value);
    const fuel = parseNumber(fuelEl.value);
    const unitPrice = parseNumber(priceEl.value);

    if (distance === null || fuel === null || unitPrice === null) {
      hideError();
      clear('走行距離・給油量・単価を入れると計算します。', '');
      return;
    }
    if (Number.isNaN(distance) || distance <= 0 || distance > 5000) {
      showError('走行距離は0より大きく5,000kmまでで入力してください。');
      clear('入力内容を確認してください。', '');
      return;
    }
    if (Number.isNaN(fuel) || fuel <= 0 || fuel > 500) {
      showError('給油量は0より大きく500Lまでで入力してください。');
      clear('入力内容を確認してください。', '');
      return;
    }
    if (Number.isNaN(unitPrice) || unitPrice < 0 || unitPrice > 1000) {
      showError('ガソリン単価は0〜1,000円/Lの範囲で入力してください。');
      clear('入力内容を確認してください。', '');
      return;
    }

    const days = parseNumber(daysEl.value);
    if (days !== null && (Number.isNaN(days) || days <= 0 || days > 365)) {
      showError('前回からの日数は0より大きく365日までで入力してください。');
      clear('入力内容を確認してください。', '');
      return;
    }
    const tank = parseNumber(tankEl.value);
    if (tank !== null && (Number.isNaN(tank) || tank <= 0 || tank > 1000)) {
      showError('タンク容量は0より大きく1,000Lまでで入力してください。');
      clear('入力内容を確認してください。', '');
      return;
    }
    hideError();

    const kmPerL = distance / fuel;
    const fuelCost = fuel * unitPrice;
    const costPerKm = fuelCost / distance;
    const perDay = days === null ? null : distance / days;
    const range = tank === null ? null : tank * kmPerL;
    const daysPerTank = (tank !== null && days !== null) ? (tank / fuel) * days : null;

    out.kmPerL.textContent = kmPerL.toFixed(1);
    out.cost.textContent = yen(fuelCost);
    out.perKm.textContent = costPerKm.toFixed(1) + '円';
    out.next.textContent = daysPerTank === null ? '—' : Math.round(daysPerTank) + '日';

    summaryEl.textContent = '実燃費は ' + kmPerL.toFixed(1) + 'km/L。今回の給油は ' +
      num(fuel, 1) + 'L で ' + yen(fuelCost) + '、1kmあたり ' + costPerKm.toFixed(1) + '円です。';

    const pace = [];
    if (perDay !== null) {
      pace.push('1日あたり ' + perDay.toFixed(1) + 'km 走っています。');
    }
    if (range !== null) {
      pace.push('満タン' + num(tank, 1) + 'Lなら約' + num(range, 0) + 'km走れます。');
    }
    if (daysPerTank !== null) {
      pace.push('このペースで次の給油まで約' + Math.round(daysPerTank) + '日です。');
    }
    if (perDay === null && range === null) {
      pace.push('前回からの日数とタンク容量を入れると、給油間隔の目安が出ます。');
    } else if (perDay === null) {
      pace.push('前回からの日数を入れると、次の給油までの日数が出ます。');
    } else if (range === null) {
      pace.push('タンク容量を入れると、満タンで走れる距離が出ます。');
    }
    paceEl.textContent = pace.join(' ');
  }

  function resetAll() {
    distanceEl.value = '512';
    fuelEl.value = '36.4';
    priceEl.value = '172';
    daysEl.value = '14';
    tankEl.value = '45';
    calc();
    distanceEl.focus();
  }

  [distanceEl, fuelEl, priceEl, daysEl, tankEl].forEach(el => {
    el.addEventListener('input', calc);
    el.addEventListener('change', calc);
  });

  resetBtn.addEventListener('click', resetAll);

  calc();
})();
