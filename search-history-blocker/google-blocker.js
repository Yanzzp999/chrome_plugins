/**
 * Search History Blocker
 * 屏蔽 Google 搜索页面的搜索历史记录弹窗
 * 只隐藏下拉建议，不影响搜索输入框
 */

(function() {
  'use strict';

  // 需要屏蔽的选择器列表 - 只针对下拉建议，不影响输入框
  const SELECTORS_TO_HIDE = [
    'div[role="listbox"]',
    'ul[role="listbox"]',
    'div[jsname="LwH6nd"]',
    'ul[jsname="bw4e9b"]',
    'div.aajZCb',
    'div.UUbT9',
    'div.OBMEnb',
    'div.wM6W7d',
    'div.lJ9FBc',
    'div.QrShKb',
    'div.CcAdNb',
    'div.Umvnrc',
    'div[jscontroller="HMXFQd"]',
    'li[data-view-type="1"]',
    'li.sbct',
    'li.G43f7e'
  ];

  // 注入隐藏样式
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'search-history-blocker-styles';
    style.textContent = `
      ${SELECTORS_TO_HIDE.join(',\n      ')} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }
    `;
    
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.documentElement.appendChild(style);
    }
  }

  // 移除搜索历史元素
  function removeHistoryElements() {
    SELECTORS_TO_HIDE.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.cssText = 'display: none !important; visibility: hidden !important;';
      });
    });
  }

  // 阻止搜索框的某些事件来防止下拉框出现
  function blockSearchBoxEvents() {
    const searchInputs = document.querySelectorAll('input[name="q"], textarea[name="q"]');
    
    searchInputs.forEach(input => {
      input.addEventListener('focus', function(e) {
        setTimeout(removeHistoryElements, 10);
        setTimeout(removeHistoryElements, 50);
        setTimeout(removeHistoryElements, 100);
        setTimeout(removeHistoryElements, 200);
      }, true);

      input.addEventListener('click', function(e) {
        setTimeout(removeHistoryElements, 10);
        setTimeout(removeHistoryElements, 50);
        setTimeout(removeHistoryElements, 100);
      }, true);

      input.addEventListener('input', function(e) {
        setTimeout(removeHistoryElements, 10);
        setTimeout(removeHistoryElements, 100);
      }, true);
    });
  }

  // 使用 MutationObserver 监视 DOM 变化
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      let shouldRemove = false;
      
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldRemove = true;
          break;
        }
      }
      
      if (shouldRemove) {
        removeHistoryElements();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // 初始化
  function init() {
    injectStyles();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        removeHistoryElements();
        blockSearchBoxEvents();
        observeDOM();
      });
    } else {
      removeHistoryElements();
      blockSearchBoxEvents();
      observeDOM();
    }

    // 定时清理
    setInterval(removeHistoryElements, 500);
  }

  init();
})();
