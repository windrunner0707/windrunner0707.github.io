(function () {
  'use strict';

  var modal = document.getElementById('imageZoomModal');
  if (!modal) return;

  var stage = modal.querySelector('.image-zoom-stage');
  var image = modal.querySelector('.image-zoom-target');
  var level = document.getElementById('imageZoomLevel');
  var scale = 1;
  var x = 0;
  var y = 0;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var pinchDistance = 0;
  var opener = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function render() {
    image.style.transform = 'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
    level.textContent = Math.round(scale * 100) + '%';
  }

  function setScale(nextScale) {
    scale = clamp(nextScale, 0.25, 6);
    render();
  }

  function reset() {
    scale = 1;
    x = 0;
    y = 0;
    render();
  }

  function open(trigger) {
    opener = trigger;
    image.src = trigger.getAttribute('data-zoom-src');
    image.alt = trigger.querySelector('img').alt || '';
    modal.hidden = false;
    document.body.classList.add('image-zoom-open');
    reset();
    modal.querySelector('[data-zoom-action="close"]').focus();
  }

  function close() {
    modal.hidden = true;
    image.removeAttribute('src');
    document.body.classList.remove('image-zoom-open');
    if (opener) opener.focus();
  }

  document.querySelectorAll('.zoomable-image-trigger[data-zoom-src]').forEach(function (trigger) {
    trigger.addEventListener('click', function () { open(trigger); });
  });

  modal.addEventListener('click', function (event) {
    var action = event.target.getAttribute('data-zoom-action');
    if (action === 'in') setScale(scale + 0.25);
    if (action === 'out') setScale(scale - 0.25);
    if (action === 'reset') reset();
    if (action === 'close') close();
  });

  stage.addEventListener('wheel', function (event) {
    event.preventDefault();
    setScale(scale + (event.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });

  stage.addEventListener('pointerdown', function (event) {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    x += event.clientX - lastX;
    y += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    render();
  });

  stage.addEventListener('pointerup', function () { dragging = false; });
  stage.addEventListener('pointercancel', function () { dragging = false; });

  stage.addEventListener('touchmove', function (event) {
    if (event.touches.length !== 2) return;
    var dx = event.touches[0].clientX - event.touches[1].clientX;
    var dy = event.touches[0].clientY - event.touches[1].clientY;
    var distance = Math.hypot(dx, dy);
    if (pinchDistance) setScale(scale * distance / pinchDistance);
    pinchDistance = distance;
  }, { passive: false });

  stage.addEventListener('touchend', function () { pinchDistance = 0; });

  document.addEventListener('keydown', function (event) {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === '+' || event.key === '=') setScale(scale + 0.25);
    if (event.key === '-') setScale(scale - 0.25);
    if (event.key === '0') reset();
  });
})();
