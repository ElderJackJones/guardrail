import { getDomain } from "tldts";

export default defineBackground(() => {

  console.log('welcome, hitchhiker')
  console.log('grab a towel')
  async function fetchQuote() {
    const res = await fetch(`https://thequoteshub.com/api`);
    const json = await res.json();
    return json.text
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_QUOTE") {
      fetchQuote()
        .then(quote => sendResponse({ success: true, quote }))
        .catch(err => sendResponse({ success: false, error: err.message }));

      return true;
    }
  });

  chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {

    if (details.frameId !== 0) return

    const { railed = [] } = await chrome.storage.local.get("railed");
    const railList = railed as string[]; 

    const url = details.url
    if (url.startsWith(chrome.runtime.getURL(""))) return;
    const domain = getDomain(url)

    if (!domain) return

    if (railList.includes(domain)) {
        const { allow } = await chrome.storage.local.get("allow")

        if (allow === domain) {
          chrome.storage.local.remove('allow')
          return
        }

      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("wait.html") +
            "?target=" + encodeURIComponent(details.url)
      });
    }
    
  })

});
