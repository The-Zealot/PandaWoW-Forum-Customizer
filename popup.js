const THEMES = {
  'default': 'PandaWoW',
  'zealot': 'Zealot Animate',
  'horde': 'Орда Animate',
  'neon': 'Неон Animate',
  'forest': 'Природа Animate', 
  'black': 'Black Animate',
  'black1': 'Black Default'
};

const container = document.getElementById('buttons-container');

async function loadCssFile(themeId) {
  if (themeId === 'default') return ''; 
  try {
    const url = chrome.runtime.getURL(`themes/${themeId}.css`);
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error(`Не удалось прочитать файл themes/${themeId}.css :`, error);
    return '';
  }
}

function renderButtons() {
  Object.entries(THEMES).forEach(([id, name]) => {
    const button = document.createElement('button');
    button.id = `style-${id}`;
    button.textContent = name;
    button.setAttribute('data-theme-id', id);
    
    button.addEventListener('click', async (e) => {
      const themeId = e.target.getAttribute('data-theme-id');
      const cssText = await loadCssFile(themeId);

      await chrome.storage.local.set({ selectedThemeId: button.id, customCss: cssText });
      
      updateActiveButton(button.id);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "applyStyle", css: cssText });
      }
    });

    container.appendChild(button);
  });
}

function updateActiveButton(activeId) {
  document.querySelectorAll('#buttons-container button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(activeId)?.classList.add('active');
}

renderButtons();
chrome.storage.local.get(['selectedThemeId'], (data) => {
  updateActiveButton(data.selectedThemeId || 'style-default');
});
