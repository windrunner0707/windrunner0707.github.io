/**
 * Flavor Theme — article navigation enhancements.
 * Builds an accessible table of contents from rendered Markdown headings and
 * updates the reading progress bar without requiring generator-side plugins.
 */
; (function () {
  'use strict';

  var article = document.querySelector('.article-container');
  var content = document.querySelector('.article-content');
  var toc = document.getElementById('articleToc');
  var tocList = document.getElementById('articleTocList');
  var progressBar = document.getElementById('readingProgressBar');

  if (!article || !content) return;

  var headings = content.querySelectorAll('h2, h3');
  if (toc && tocList && headings.length >= 3) {
    var usedIds = {};

    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var baseId = heading.id || ('section-' + (i + 1));
      var id = baseId;
      var suffix = 2;

      while (usedIds[id]) {
        id = baseId + '-' + suffix;
        suffix++;
      }

      usedIds[id] = true;
      heading.id = id;

      var item = document.createElement('li');
      item.className = 'article-toc__item article-toc__item--' + heading.tagName.toLowerCase();

      var link = document.createElement('a');
      link.className = 'article-toc__link';
      link.href = '#' + encodeURIComponent(id);
      link.textContent = heading.textContent;

      item.appendChild(link);
      tocList.appendChild(item);
    }

    toc.hidden = false;
    var details = toc.querySelector('details');
    if (details && window.matchMedia && window.matchMedia('(min-width: 769px)').matches) {
      details.open = true;
    }
  }

  if (progressBar) {
    var ticking = false;

    var updateProgress = function () {
      var start = article.offsetTop;
      var end = start + article.offsetHeight - window.innerHeight;
      var distance = Math.max(end - start, 1);
      var value = ((window.pageYOffset - start) / distance) * 100;
      value = Math.max(0, Math.min(100, value));
      progressBar.style.width = value + '%';
      ticking = false;
    };

    var requestUpdate = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updateProgress();
  }
})();
