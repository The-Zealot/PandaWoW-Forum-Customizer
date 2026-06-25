const STYLE_ELEMENT_ID = 'extension-custom-style-tag';

function injectStyle(cssText) {
  let styleEl = document.getElementById(STYLE_ELEMENT_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    (document.head || document.documentElement).appendChild(styleEl);
  }
  styleEl.textContent = cssText;
}

chrome.storage.local.get(['customCss'], (data) => {
  if (data.customCss) {
    injectStyle(data.customCss);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "applyStyle") {
    injectStyle(message.css);
  }
});
