
(() => {
  'use strict';

  const heightEl = document.getElementById('height');
  const weightEl = document.getElementById('weight');
  const ageEl = document.getElementById('age');
  const sexEl = document.getElementById('sex');
  const activityEl = document.getElementById('activity');
  const statusEl = document.getElementById('status');
  const bmiEl = document.getElementById('bmi');
  const stdEl = document.getElementById('std');
  const bmrEl = document.getElementById('bmr');
  const tdeeEl = document.getElementById('tdee');
  const evalEl = document.getElementById('eval');
  const actBody = document.getElementById('actBody');

  const ACTIVITY = [
    { value: 1.2, label: 'ほぼ運動しない（デスクワーク中心）' },
    { value: 1.375, label: '軽い運動（週1〜3回）' },
    { value: 1.55, label: '中程度の運動（週3〜5回）' },
    { value: 1.725, label: '激しい運動（週6〜7回）' },
    { value: 1.9, label: '非常に激しい運動（1日2回など）' }
  ];

  function readNumber(el) {
    const raw = el.value.trim();
    if (raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function bmiCategory(bmi) {
    if (bmi < 18.5) return { label: '低体重（やせ）', cls: 'warn' };
    if (bmi < 25) return { label: '普通体重', cls: 'ok' };
    if (bmi < 30) return { label: '肥満（1度）', cls: 'warn' };
    if (bmi < 35) return { label: '肥満（2度）', cls: 'warn' };
    if (bmi < 40) return { label: '肥満（3度）', cls: 'warn' };
    return { label: '肥満（4度）', cls: 'warn' };
  }

  function fmt1(n) {
    return n.toFixed(1);
  }

  function fmtInt(n) {
    return Math.round(n).toLocaleString('ja-JP');
  }

  function resetTable() {
    actBody.replaceChildren();
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.className = 'hint';
    td.textContent = '身長・体重・年齢を入力すると表示されます。';
    tr.append(td);
    actBody.append(tr);
  }

  function clearResults(message) {
    bmiEl.textContent = '—';
    stdEl.textContent = '—';
    bmrEl.textContent = '—';
    tdeeEl.textContent = '—';
    evalEl.className = 'note';
    evalEl.textContent = message || '身長・体重・年齢を入力すると判定が表示されます。';
    resetTable();
  }

  function showError(message) {
    statusEl.hidden = false;
    statusEl.textContent = message;
    clearResults('入力内容を確認してください。');
  }

  function hideError() {
    statusEl.hidden = true;
    statusEl.textContent = '';
  }

  function renderActivity(bmr, selectedFactor) {
    actBody.replaceChildren();
    for (const item of ACTIVITY) {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = item.label + (item.value === selectedFactor ? '（選択中）' : '');
      const tdFactor = document.createElement('td');
      tdFactor.textContent = item.value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
      const tdKcal = document.createElement('td');
      tdKcal.className = 'mono';
      tdKcal.textContent = fmtInt(bmr * item.value);
      tr.append(th, tdFactor, tdKcal);
      actBody.append(tr);
    }
  }

  function calc() {
    const cm = readNumber(heightEl);
    const kg = readNumber(weightEl);
    const age = readNumber(ageEl);

    if (cm === null || kg === null || age === null) {
      hideError();
      clearResults();
      return;
    }
    if (cm < 50 || cm > 250) {
      showError('身長は 50〜250 cm の範囲で入力してください。');
      return;
    }
    if (kg < 10 || kg > 400) {
      showError('体重は 10〜400 kg の範囲で入力してください。');
      return;
    }
    if (age < 10 || age > 120) {
      showError('年齢は 10〜120 歳の範囲で入力してください。');
      return;
    }
    hideError();

    const m = cm / 100;
    const bmi = kg / (m * m);
    const standard = 22 * m * m;
    const male = sexEl.value !== 'female';
    const bmr = 10 * kg + 6.25 * cm - 5 * age + (male ? 5 : -161);

    const selectedFactor = Number(activityEl.value);
    const factor = Number.isFinite(selectedFactor) ? selectedFactor : 1.2;
    const tdee = bmr * factor;

    const category = bmiCategory(bmi);
    bmiEl.textContent = fmt1(bmi);
    stdEl.textContent = fmt1(standard);
    bmrEl.textContent = fmtInt(bmr);
    tdeeEl.textContent = fmtInt(tdee);

    evalEl.className = category.cls;
    evalEl.textContent = 'BMI ' + fmt1(bmi) + '：' + category.label +
      '（標準体重 ' + fmt1(standard) + ' kg）';

    renderActivity(bmr, factor);
  }

  [heightEl, weightEl, ageEl].forEach(el => {
    el.addEventListener('input', calc);
    el.addEventListener('change', calc);
  });
  [sexEl, activityEl].forEach(el => {
    el.addEventListener('change', calc);
  });

  calc();
})();
