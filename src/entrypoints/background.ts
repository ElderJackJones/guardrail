import { getDomain } from "tldts";

export default defineBackground(() => {

  console.log('welcome, hitchhiker')
  console.log('grab a towel')

  const allowedTabs = new Map<number, string>()

  async function fetchQuote() {
    const res = await fetch(`https://thequoteshub.com/api`);
    const json = await res.json();
    return json.text
  }

  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "allow-tab" && sender.tab?.id) {
      allowedTabs.set(sender.tab.id, msg.domain)
    }
  })

  chrome.tabs.onRemoved.addListener((tabId) => {
    allowedTabs.delete(tabId)
  })

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_QUOTE") {
      fetchQuote()
        .then(quote => sendResponse({ success: true, quote }))
        .catch(err => sendResponse({ success: false, error: err.message }));

      return true;
    }
  });

  let railList: string[] = []

    chrome.storage.local.get("railed").then(({ railed = [] }) => {
      railList = railed as string[]
    })

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.railed) {
        railList = (changes.railed.newValue as string[]) || []
      }
    })

  chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {

    if (details.frameId !== 0) return

    const url = details.url
    if (url.startsWith(chrome.runtime.getURL(""))) return;
    const domain = getDomain(url)

    if (!domain) return

    if (railList.includes(domain)) {

      const allowedDomain = allowedTabs.get(details.tabId)

      if (allowedDomain === domain) {
        return
      }

      const previousAllowed = allowedTabs.get(details.tabId)

      if (previousAllowed && previousAllowed !== domain) {
        allowedTabs.delete(details.tabId)
      }

      chrome.tabs.update(details.tabId, {
        url:
          chrome.runtime.getURL("wait.html") +
          "?target=" +
          encodeURIComponent(details.url)
      })
    }
    
  })

});
