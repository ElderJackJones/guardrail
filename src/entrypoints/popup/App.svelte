<script lang="ts">
  import { getDomain } from "tldts";
  import { onMount } from "svelte";

  let website = "";
  let railed: string[] = [];
  let message = "";
  let messageType: "success" | "error" | "" = "";

  const loadRail = async () => {
    const result = await chrome.storage.local.get("railed");
    railed = Array.isArray(result.railed) ? result.railed : [];
  };

  onMount(loadRail);

  const normalize = (input: string) => {
    if (!input.startsWith("http")) {
      return "https://" + input;
    }
    return input;
  };

  const addToRail = async (domain: string) => {
    const updated = Array.from(new Set([...railed, domain]));
    await chrome.storage.local.set({ railed: updated });
    message = `Added ${domain}`;
    messageType = "success";
    await loadRail();
  };

  const removeFromRail = async (domain: string) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const waitUrl = chrome.runtime.getURL("/wait.html") + 
        `?target=https://${domain}&remove=true`;
      await chrome.tabs.update(tab.id, { url: waitUrl });
      window.close(); // Close the popup
    }
  };

  const prepForRail = async (websiteString: string, flag: string) => {
    const domain = getDomain(websiteString);

    if (!domain) {
      message = "Couldn't recognize that domain";
      messageType = "error";
      return;
    }

    if (flag === "add") {
      await addToRail(domain);
    } else {
      await removeFromRail(domain);
    }

    website = "";

    setTimeout(() => {
      message = "";
      messageType = "";
    }, 1200);
  };
</script>

<main class="container">
  <header>
    <h1>guardrail</h1>
    <p>A gentle pause before distraction.</p>
  </header>

  <article>
    <form
      onsubmit={async (e) => {
        e.preventDefault();
        await prepForRail(normalize(website), "add");
      }}
    >
      <label for="rail">Website</label>
      <input
        bind:value={website}
        type="text"
        name="rail"
        id="rail"
        placeholder="example.com"
        aria-label="Website to add"
        autocomplete="off"
        spellcheck="false"
      />

      <div class="grid">
        <button type="submit">Add</button>
      </div>
    </form>
  </article>

  <section>
    <h3 class="railtitle">guarded sites</h3>

    {#if railed.length === 0}
      <p><em>Nothing here yet.</em></p>
    {:else}
      <ul>
        {#each railed as domain}
          <li class="rail-item">
            <span>{domain}</span>
            <button
              class="mini"
              onclick={async () => await removeFromRail(domain)}
            >
              Remove
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if message}
    <small class={messageType === "error" ? "error" : "success"} role="status">
      {message}
    </small>
  {/if}
</main>
