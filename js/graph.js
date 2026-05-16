/**
 * Graph Engine — Node graph, SVG connections, hover/click
 */
(function () {
  'use strict';

  var svg, scene, centerNode, tooltip;
  var nodes = [];
  var connections = [];
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    svg        = document.getElementById('graph-svg');
    scene      = document.getElementById('graph-scene');
    centerNode = document.getElementById('graph-center');
    tooltip    = document.getElementById('node-tooltip');
    nodes      = Array.from(document.querySelectorAll('.graph-node[data-panel]'));

    if (!svg || !scene || !nodes.length) return;

    drawConnections();
    bindEvents();

    var ro = new ResizeObserver(debounce(drawConnections, 150));
    ro.observe(scene);
  }

  /* ---- Draw SVG connections ------------------------------------------ */
  function drawConnections() {
    if (window.innerWidth <= 600) { svg.innerHTML = ''; return; }

    svg.innerHTML = '';
    connections = [];

    var sr  = scene.getBoundingClientRect();
    var cr  = centerNode.getBoundingClientRect();
    var cx  = cr.left - sr.left + cr.width  / 2;
    var cy  = cr.top  - sr.top  + cr.height / 2;

    nodes.forEach(function (node, i) {
      var id = node.getAttribute('data-panel');
      var nr = node.getBoundingClientRect();
      var nx = nr.left - sr.left + nr.width  / 2;
      var ny = nr.top  - sr.top  + nr.height / 2;

      // Base line
      var line = makeSVG('line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', nx); line.setAttribute('y2', ny);
      line.setAttribute('class', 'graph-line');
      line.setAttribute('data-conn', id);
      svg.appendChild(line);

      // Animated path (for particle)
      var pid  = 'cp-' + id;
      var path = makeSVG('path');
      path.setAttribute('id', pid);
      path.setAttribute('d', 'M ' + cx + ' ' + cy + ' L ' + nx + ' ' + ny);
      path.setAttribute('fill', 'none');
      svg.appendChild(path);

      // Flowing particle
      if (!prefersReduced) {
        var p  = makeSVG('circle');
        p.setAttribute('r', '2.5');
        p.setAttribute('class', 'graph-particle');
        var am = makeSVG('animateMotion');
        am.setAttribute('dur', (1.6 + i * 0.25) + 's');
        am.setAttribute('repeatCount', 'indefinite');
        am.setAttribute('begin', (i * 0.3) + 's');
        var mp = makeSVG('mpath');
        mp.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + pid);
        am.appendChild(mp); p.appendChild(am);
        svg.appendChild(p);
      }

      connections.push({ id: id, line: line });
    });
  }

  /* ---- Events --------------------------------------------------------- */
  function bindEvents() {
    nodes.forEach(function (node) {
      var id = node.getAttribute('data-panel');

      node.addEventListener('mouseenter', function (e) {
        highlight(id);
        showTooltip(node, e);
      });
      node.addEventListener('mousemove', function (e) { moveTooltip(e); });
      node.addEventListener('mouseleave', function () { reset(); hideTooltip(); });

      node.addEventListener('click', function () { onNodeClick(id, node); });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(id, node); }
      });
    });
  }

  function onNodeClick(id, node) {
    // Highlight the node
    highlight(id);
    node.classList.add('node-active');

    // Dispatch event — panels.js will listen in next phase
    document.dispatchEvent(new CustomEvent('graph:open', { detail: { panelId: id } }));

    // Fallback: show a subtle toast if no panel system loaded
    if (typeof window.PanelSystem === 'undefined') {
      showToast('Opening ' + id + '...');
    }
  }

  /* ---- Highlight / Reset --------------------------------------------- */
  function highlight(activeId) {
    connections.forEach(function (c) {
      c.line.classList.toggle('active', c.id === activeId);
      c.line.classList.toggle('dimmed', c.id !== activeId);
    });
    nodes.forEach(function (n) {
      var nid = n.getAttribute('data-panel');
      n.classList.toggle('node-active', nid === activeId);
      n.classList.toggle('node-dimmed', nid !== activeId);
    });
  }

  function reset() {
    connections.forEach(function (c) { c.line.classList.remove('active', 'dimmed'); });
    nodes.forEach(function (n) { n.classList.remove('node-active', 'node-dimmed'); });
  }

  /* ---- Tooltip -------------------------------------------------------- */
  var tooltipLabels = {
    projects: 'View 4 Engineering Projects',
    skills: 'Browse Tech Stack',
    experience: 'Professional Timeline',
    profiles: 'Coding Achievements',
    contact: 'Send a Message',
    resume: 'Download Resume'
  };

  function showTooltip(node, e) {
    if (!tooltip) return;
    var id = node.getAttribute('data-panel');
    tooltip.textContent = tooltipLabels[id] || id;
    tooltip.classList.add('visible');
    tooltip.removeAttribute('aria-hidden');
    moveTooltip(e);
  }

  function moveTooltip(e) {
    if (!tooltip) return;
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top  = (e.clientY - 28) + 'px';
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  /* ---- Toast ---------------------------------------------------------- */
  function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'graph-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 400);
    }, 2000);
  }

  /* ---- Public API ----------------------------------------------------- */
  window.GraphEngine = {
    setActiveNode: function (id) {
      if (id) { highlight(id); } else { reset(); }
    },
    redraw: drawConnections
  };

  /* ---- Utility -------------------------------------------------------- */
  function makeSVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
