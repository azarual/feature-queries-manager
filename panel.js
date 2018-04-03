
let FEATURE_QUERY_DECLARATIONS = [];
let FEATURE_QUERY_CONDITIONS = [];
const conditionsListEl = document.getElementById("feature-queries");

function displayFeatureQueryConditionsList() {
  let content = "";

  FEATURE_QUERY_CONDITIONS.forEach((condition, i) => {
    const template = `<li data-index="${i}">
      <span class="toggle">
        <input type="checkbox" checked aria-label="Toggle Feature Query ${condition}">
      </span>
      <button class="details">${condition}</button>
    </li>`;
    content += template;
  });

  conditionsListEl.innerHTML = content;
}

function displayConditionRules(conditionRules, event) {
  let content = "";

  conditionRules.forEach((cr) => {
    const code = document.createElement("code");
    code.innerHTML = cr.cssText;
    code.classList.add("css");

    const template = `<section class="group">
    <h3>${cr.stylesheet}</h3>
    <pre>${code.outerHTML}</pre>
    </section>`;
    content += template;
  });

  document.querySelector("main").innerHTML = content;

  hljs.initHighlightingOnLoad();

  const currentlySelected = document.querySelector(".selected");
  if (currentlySelected) currentlySelected.classList.remove("selected");
  event.target.parentElement.classList.add("selected");
}

function onClickConditionsList(event) {

  // If clicked the checkbox
  if (event.target.tagName == "INPUT") {
    chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
      action: "toggleCondition",
      condition: FEATURE_QUERY_CONDITIONS[event.target.parentElement.parentElement.dataset.index],
      toggleOn: event.target.checked
    }, (response) => {});
  }

  // If clicked the button
  else if (event.target.tagName == "BUTTON") {
    chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
      action: "getConditionRules",
      condition: FEATURE_QUERY_CONDITIONS[event.target.parentElement.dataset.index]
    }, (response) => displayConditionRules(response, event));
  }

}

document.getElementById("reload").addEventListener("click", start);

/* ************************************************************************
    start 
************************************************************************ */

function start() {
  chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, { action: "start" }, (res) => {
    FEATURE_QUERY_DECLARATIONS = res.FEATURE_QUERY_DECLARATIONS;
    FEATURE_QUERY_CONDITIONS = res.FEATURE_QUERY_CONDITIONS;
    
    if (FEATURE_QUERY_CONDITIONS.length > 0) {
      displayFeatureQueryConditionsList();
      conditionsListEl.addEventListener("click", onClickConditionsList);
      document.querySelector('li[data-index="0"] button').click();
    } else {
      conditionsListEl.innerHTML = "No Feature Queries found on this page."
    }
  });
}

start();

/* ************************************************************************
    onUpdated 
************************************************************************ */

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.status === "complete") {
    start();
  }
});
