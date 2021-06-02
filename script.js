/* eslint-disable no-undef */
const editorPath = 'https://editor.pix.fr';
const STORAGE_TOKEN_KEY = 'token';

let token = '';

refreshToken();
browser.storage.onChanged.addListener(refreshToken);

function refreshToken() {
  browser.storage.local.get(STORAGE_TOKEN_KEY, setToken);
}
function setToken(result) {
  token = result[STORAGE_TOKEN_KEY] || '';

  if (token) {
    keepPopupClosedAndEnableAddon();
  } else {
    askForToken();
  }
}

function keepPopupClosedAndEnableAddon() {
  browser.browserAction.setPopup({
    popup: ''
  });
}

function askForToken() {
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

async function getLastChallengeId(baseUrl, token, assessmentId) {
  const response = await fetch(`${baseUrl}/api/assessments/${assessmentId}/last-challenge-id`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
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
      const baseUrl = getBaseUrlFromTab(tabs[0]);
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
    }
  });
});
