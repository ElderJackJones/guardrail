export default defineBackground(() => {

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

});
