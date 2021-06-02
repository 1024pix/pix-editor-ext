const TOKEN_SELECTOR = '#token';
const STORAGE_TOKEN_KEY = 'token';

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', setStorageToken);

function restoreOptions() {
  browser.storage.local.get(STORAGE_TOKEN_KEY, (result) => {
    document.querySelector(TOKEN_SELECTOR).value = result[STORAGE_TOKEN_KEY] || "";
  });
}

function setStorageToken(e) {
  e.preventDefault();
  window.close();
  browser.storage.local.set({
    [STORAGE_TOKEN_KEY]: document.querySelector(TOKEN_SELECTOR).value
  });
}
