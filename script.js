/**
 * Main Orchestrator
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

 // Page Loader

var loader = document.getElementById('page-loader');

if (loader) {

  window.addEventListener('load', function () {

    setTimeout(function () {

      loader.classList.add('hidden');

    }, 2800);

  });

}

  // Live uptime counter
  var uptimeEl = document.getElementById('sys-uptime');
  if (uptimeEl) {
    var start = Date.now();
    setInterval(function () {
      var s = Math.floor((Date.now() - start) / 1000);
      var m = Math.floor(s / 60); s = s % 60;
      uptimeEl.textContent = (m > 0 ? m + 'm ' : '') + s + 's';
    }, 1000);
  }

  // Node triggers in navbar — pulse the matching graph node
  document.querySelectorAll('.node-trigger').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var panelId = el.getAttribute('data-panel');
      if (panelId) {
        e.preventDefault();
        var node = document.querySelector('.graph-node[data-panel="' + panelId + '"]');
        if (node) {
          node.focus();
          node.classList.add('node-active');
          setTimeout(function () { node.classList.remove('node-active'); }, 1200);
        }
        // Panels will be wired in next phase
        console.log('[graph] Node triggered:', panelId);
      }
    });
  });
});
