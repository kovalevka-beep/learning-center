// После создания счётчика замените 0 его числовым номером.
window.METRIKA_ID = 0;
if (Number.isSafeInteger(window.METRIKA_ID) && window.METRIKA_ID > 0) {
  window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
  window.ym.l = Date.now();
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.append(script);
  window.ym(window.METRIKA_ID, 'init', {clickmap: true, trackLinks: true, accurateTrackBounce: true});
}
