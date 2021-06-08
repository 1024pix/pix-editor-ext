/* eslint-disable no-undef */
const editorPath = 'https://editor.pix.fr';
const STORAGE_CREDENTIALS_KEY = 'credentials';

let credentials = '';

refreshCredentials();
browser.storage.onChanged.addListener(refreshCredentials);

function refreshCredentials() {
  browser.storage.local.get(STORAGE_CREDENTIALS_KEY, setCredentials);
}
function setCredentials(result) {
  credentials = result[STORAGE_CREDENTIALS_KEY] || '';

  if (credentials) {
    credentials = JSON.parse(credentials);
    keepPopupClosedAndEnableAddon();
  } else {
    askForCredentials();
  }
}

function keepPopupClosedAndEnableAddon() {
  browser.browserAction.setPopup({
    popup: ''
  });
}

function askForCredentials() {
  browser.browserAction.setPopup({
    popup: browser.extension.getURL("options.html")
  });
}

function getAssessmentIdFromTab(tab) {
  const url = tab.url;
  const matchChallengeUrl = url.match(/assessments\/(\d+)\/challenges\/\d+/);
  if (matchChallengeUrl) {
    return matchChallengeUrl[1];
  }
  return false;
}

function getBaseUrlFromTab(tab) {
  const url = new URL(tab.url);

  return url.protocol + '//'+ url.host;
}

async function getToken(baseUrl, { email, password }) {
  const response = await fetch(`${baseUrl}/api/token`,  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=password&username=${email}&password=${password}`,
  });
  if (response.status === 401) {
    throw new Error('Vérifier vos informations de connexion');
  } else if (!response.ok) {
    throw new Error('Erreur inattendu lors de la connexion');
  }

  const token = (await response.json()).access_token;
  return token;
}

async function getLastChallengeId(baseUrl, token, assessmentId) {
  const response = await fetch(`${baseUrl}/api/assessments/${assessmentId}/last-challenge-id`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de l\'id de l\'épreuve. Êtes vous Pix Master ?');
  }
  const lastChallengeId = await response.text();

  return lastChallengeId;
}

function updateTabStatus(tab) {
  if (getAssessmentIdFromTab(tab)) {
    browser.browserAction.enable(tab.id);
  } else {
    browser.browserAction.disable(tab.id);
  }
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    updateTabStatus(tab);
  }
});

browser.tabs.onCreated.addListener(function(tab) {
  updateTabStatus(tab);
});

browser.browserAction.onClicked.addListener(function() {
  browser.tabs.query({ active: true, lastFocusedWindow: true }, async function (tabs) {
    const assessmentId = getAssessmentIdFromTab(tabs[0]);
    if (assessmentId) {
      try {
        const baseUrl = getBaseUrlFromTab(tabs[0]);
        const token = await getToken(baseUrl, credentials);
        const challengeId = await getLastChallengeId(baseUrl, token, assessmentId);
        const editorUrl = editorPath + '/#/challenge/' + challengeId;
        browser.tabs.query({ title: 'Pix Editor' }, function(tabs) {
          if (tabs && tabs.length > 0) {
            const tab = tabs[0];
            browser.tabs.update(tab.id, { url: editorUrl, active: true });
          } else {
            browser.tabs.create({ url: editorUrl, active: true });
          }
        });
      } catch (e) {
        browser.notifications.create('pix-editor', {
          type: 'basic',
          title: 'Une erreur est survenue',
          message: e.message
        });
      }
    }
  });
});
