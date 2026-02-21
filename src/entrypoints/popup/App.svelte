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
    message = `${domain} added to rail`;
    messageType = "success";
    await loadRail();
  };

  const removeFromRail = async (domain: string) => {
    const updated = railed.filter((item) => item !== domain);
    await chrome.storage.local.set({ railed: updated });
    message = `${domain} removed from rail`;
    messageType = "success";
    await loadRail();
  };

  const prepForRail = async (websiteString: string, flag: string) => {
    const domain = getDomain(websiteString);

    if (!domain) {
      message = "Invalid domain";
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
    }, 500);
  };
</script>

<main class="container">
  <h1>Guardrail</h1>
  <p>Interrupt distractions before they interrupt you.</p>

  <article>
    <label for="rail">Website</label>
    <input
      bind:value={website}
      type="text"
      name="rail"
      placeholder="example.com"
      aria-label="Website"
    />

    <div class="grid">
      <button
        class="contrast"
        onclick={async () =>
          await prepForRail(normalize(website), "add")}
      >
        Add
      </button>
    </div>
  </article>
  <section>
    <h3>On the Rail</h3>

    {#if railed.length === 0}
      <p><em>No sites currently guarded.</em></p>
    {:else}
      <ul>
        {#each railed as domain}
          <li class="rail-item">
            <span>{domain}</span>
            <button
              class="secondary outline mini"
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
      <small
        class={messageType === "error" ? "error" : "success"}
        role="status"
      >
        {message}
      </small>
    {/if}

</main>
