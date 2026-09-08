(() => {
  'use strict';
  const items = window.LEARNING_ITEMS;
  const main = document.querySelector('main');
  const page = document.body.dataset.page;
  const key = 'learning-center:v1:' + new URL('.', location.href).pathname;
  const labels = {new:'Не начато', started:'В процессе', passed:'Пройдено', failed:'Не пройдено'};
  let unavailable = false;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function read() {
    try { const data = JSON.parse(localStorage.getItem(key) || '{}'); return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; }
    catch { unavailable = true; return {}; }
  }
  let state = read();
  function status(id) {return Object.hasOwn(labels, state[id]) ? state[id] : 'new';}
  function badge(id) {const s = status(id); return `<span class="badge ${s}">${labels[s]}</span>`;}
  function track(event, item) {
    if (window.METRIKA_ID > 0 && typeof window.ym === 'function') window.ym(window.METRIKA_ID, 'reachGoal', event, item ? {item_id:item.id,item_type:item.type} : {});
  }
  function save(id, value) {
    state[id] = value;
    try {localStorage.setItem(key, JSON.stringify(state));} catch {unavailable = true;}
  }
  function warning() {
    if (unavailable) main.insertAdjacentHTML('beforeend','<p class="notice" role="status">Браузер не разрешает сохранять прогресс. После перехода или обновления страницы результат может исчезнуть. Разрешите хранение данных для этого сайта.</p>');
  }
  function render() {
    if (page === 'catalog') {
      const completed = items.filter(i => status(i.id) === 'passed').length;
      main.innerHTML = `<section class="intro"><div><div class="eyebrow">ВАШЕ ОБУЧЕНИЕ</div><h1>Новые знания.<br>В своём темпе.</h1><p>Изучайте материалы и проходите тесты. Всё, что нужно для следующего шага, — в одном каталоге.</p></div><aside class="progress-panel"><div class="progress-title"><span>Ваш прогресс</span><strong>${Math.round(completed/items.length*100)}%</strong></div><progress value="${completed}" max="${items.length}" aria-label="Пройдено ${completed} из ${items.length}"></progress><p>${completed} из ${items.length} завершено · материалы и тесты</p></aside></section><section><div class="section-title"><h2>Каталог обучения <span class="note">/ ${items.length}</span></h2><button class="text-button" id="reset">Сбросить прогресс</button></div><div class="grid">${items.map(i => `<article class="card"><div class="meta"><span class="type">${i.type === 'material' ? '↗ Материал' : '✓ Тест'}</span><span>${escape(i.duration)}</span></div><h2>${escape(i.title)}</h2><p class="description">${escape(i.description)}</p><div class="card-bottom">${badge(i.id)}<a class="card-link" href="item.html?id=${encodeURIComponent(i.id)}">Открыть карточку →</a></div></article>`).join('')}</div></section><p class="note">Прогресс сохраняется только в этом браузере. Его можно сбросить для новой учебной попытки.</p>`;
      document.querySelector('#reset').onclick = () => {if(confirm('Сбросить результаты всех материалов и тестов?')) {try {localStorage.removeItem(key);} catch {unavailable = true;} state = {}; render();}};
    } else {
      const id = new URLSearchParams(location.search).get('id');
      const item = items.find(i => i.id === id);
      if (!item || (page === 'platform' && item.type !== 'test')) {main.innerHTML = '<h1>Карточка не найдена</h1><p>Возможно, ссылка устарела. Выберите материал или тест в каталоге.</p><a href="index.html">Перейти в каталог</a>'; return;}
      document.title = `${item.title} · ${page === 'platform' ? 'Практикум' : 'Учебный центр'}`;
      main.innerHTML = `<div class="detail"><a class="back" href="index.html">← В каталог</a><div class="meta"><span>${escape(item.category)} · ${escape(item.duration)}</span>${badge(id)}</div><h1>${escape(item.title)}</h1><p class="description">${escape(item.description)}</p><section class="card" id="content"></section></div>`;
      const content = document.querySelector('#content');
      if (page === 'item') {
        content.innerHTML = `<h2>${item.type === 'material' ? 'Об этом материале' : 'Как проходит тест'}</h2><p>${escape(item.details)}</p>`;
        if (item.type === 'material') {
          let url; try {url = new URL(item.url);} catch {}
          if (!url || url.protocol !== 'https:') {content.insertAdjacentHTML('beforeend','<p class="notice">Ссылка недоступна. Проверьте адрес материала в настройках каталога.</p>');}
          else {content.insertAdjacentHTML('beforeend',`<div class="actions"><a class="button" id="launch" target="_blank" rel="noopener noreferrer" href="${escape(url.href)}">Перейти к материалу ↗</a></div><p class="note">Откроется новая вкладка · ${escape(url.hostname)}<br>Переход по ссылке означает «пройдено».</p>`);
            const complete = () => {save(id,'passed');track('material_open',item);render();};
            document.querySelector('#launch').addEventListener('click',complete);
            document.querySelector('#launch').addEventListener('auxclick',event => {if(event.button === 1) complete();});
          }
        } else {
          content.insertAdjacentHTML('beforeend',`<div class="actions"><a class="button" id="launch" href="platform.html?id=${encodeURIComponent(id)}">${status(id) === 'new' ? 'Перейти к тесту' : 'Начать новую попытку'} ↗</a></div><p class="note">«Практикум» откроется в этой вкладке. Результат новой попытки заменит предыдущий.</p>`);
          document.querySelector('#launch').onclick = () => {save(id,'started');track('test_start',item);};
        }
      } else {
        content.innerHTML = `<div class="eyebrow">УЧЕБНАЯ ПОПЫТКА</div><h2>Завершите тест</h2><p>Вы на имитации внешней платформы. Выберите результат, который хотите проверить в учебном центре.</p><p class="note">Настоящих вопросов и оценки здесь нет. Обе кнопки сохраняют выбранный результат.</p><div class="actions"><button data-result="passed">Завершить: пройдено</button><button class="secondary" data-result="failed">Завершить: не пройдено</button></div>`;
        content.querySelectorAll('[data-result]').forEach(button => {button.onclick = () => {
          const result = button.dataset.result; save(id,result); track(result === 'passed' ? 'test_pass' : 'test_fail',item);
          main.querySelector('.meta .badge').outerHTML = badge(id);
          content.innerHTML = `<div role="status"><div class="eyebrow">РЕЗУЛЬТАТ ПОПЫТКИ</div><p class="result">${labels[result]}</p><p>${unavailable ? 'Результат выбран, но браузер не смог его сохранить.' : 'Результат сохранён. Вернитесь в каталог, чтобы увидеть обновлённый прогресс.'}</p></div><div class="actions"><a class="button" href="index.html">Вернуться в каталог</a><a class="button secondary" href="item.html?id=${encodeURIComponent(id)}">К карточке теста</a></div>`;
        };});
      }
    }
    warning();
  }
  render();
  if(page === 'item') {const item = items.find(i => i.id === new URLSearchParams(location.search).get('id'));if(item) track('card_open',item);}
  window.addEventListener('pageshow', event => {if(event.persisted) {state = read();render();}});
  window.addEventListener('storage', event => {if(event.key === key || event.key === null) {state = read();render();}});
})();
