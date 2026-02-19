<script>
  import { getDomain } from "tldts";

  let website = ''

  let addToRail = async (domain) => {
    const { railed = [] } = await chrome.storage.local.get("railed")
    const updated = [...railed, domain]
    await chrome.storage.local.set({ railed: updated })
  }

  let prepForRail = async (websiteString) => {
    const domain = getDomain(websiteString)

    if (!domain) return

    await addToRail(domain)
    website = ''
  }


</script>

<main class="container-fluid">
  <h1>Guardrail</h1>
  <p>Welcome to Guardrail, a simple system to interrupt distracting or destructive behaviors. </p>
  <hr />
  <p>Enter a website you want to guardrail to begin</p>
  <input bind:value={website} type="text" name="rail" placeholder="Website" aria-label="Website">
  <div id="buttonbox">
    <button class="contrast" onclick={async () => await prepForRail(website)}>Add to the Rail</button>
  </div>
</main>
