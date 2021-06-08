const EMAIL_SELECTOR = '#email';
const PASSWORD_SELECTOR = '#password';
const STORAGE_CREDENTIALS_KEY = 'credentials';

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', setStorageToken);

async function restoreOptions() {
  const rawCredentials = (await browser.storage.local.get(STORAGE_CREDENTIALS_KEY))[STORAGE_CREDENTIALS_KEY] || '{"email": "", "password": ""}';
  const credentials = JSON.parse(rawCredentials);
  document.querySelector(EMAIL_SELECTOR).value = credentials.email;
  document.querySelector(PASSWORD_SELECTOR).value = credentials.password;
}

function setStorageToken(e) {
  e.preventDefault();
  window.close();
  browser.storage.local.set({
    [STORAGE_CREDENTIALS_KEY]: JSON.stringify({
      email: document.querySelector(EMAIL_SELECTOR).value,
      password: document.querySelector(PASSWORD_SELECTOR).value
    })
  });
}
