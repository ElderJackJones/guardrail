<script lang="ts">
  export let site = "this site";
  import { onMount } from "svelte";
  import { getDomain } from "tldts";

  let seconds = 90;
  let interval: NodeJS.Timeout;

  const params = new URLSearchParams(window.location.search);
  const originalUrl = params.get("target") ?? "";
  const isRemoving = params.get("remove") === "true";

  site = originalUrl ? (getDomain(originalUrl) ?? "this site") : "this site";

  const startTimer = () => {
    interval = setInterval(() => {
      if (seconds > 0) {
        seconds -= 1;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleContinue = async () => {
    let domain = getDomain(originalUrl);
    if (!domain) return;

    if (isRemoving) {
      const result = await chrome.storage.local.get("railed");
      const railed = Array.isArray(result.railed) ? result.railed : [];
      const updated = railed.filter((item: string) => item !== domain);
      await chrome.storage.local.set({ railed: updated });
    } else {
      chrome.runtime.sendMessage({
        type: "allow-tab",
        domain,
      });
    }
    window.location.replace(originalUrl);
  };

  const handleStay = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      chrome.tabs.remove(tab.id);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}`;
  };

  onMount(() => {
    startTimer();
  });
</script>

<main>
  <div class="card">
    <p class="label">{isRemoving ? "confirmation" : "taking a moment"}</p>
    <h1>{isRemoving ? "Sure about this?" : "Breathe first."}</h1>

    <p class="context">
      {isRemoving ? "Removing guardrail for" : "You were heading to"} <strong>{site}</strong>.
    </p>

    <section class="breathing">
      <div class="breath-ring" class:done={seconds === 0}>
        <span class="timer">{formatTime(seconds)}</span>
      </div>
      <p class="hint">
        {#if seconds > 0}
          Inhale… hold… exhale.
        {:else}
          Ready when you are.
        {/if}
      </p>
    </section>

    <div class="actions">
      <button class="btn-primary" onclick={async () => await handleStay()}>
        Close tab
      </button>

      <button
        class="btn-ghost"
        disabled={seconds > 0}
        onclick={async () => await handleContinue()}
      >
        {isRemoving ? "Confirm Removal" : "Continue anyway"}
      </button>
    </div>
  </div>
</main>

<style>
  main {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .card {
    max-width: 400px;
    width: 100%;
    text-align: center;
    background: var(--surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 36px 32px 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  }

  .label {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .context {
    font-size: 0.88rem;
    color: var(--text-muted);
    margin-top: 6px;
  }

  .context strong {
    color: var(--text);
    font-weight: 500;
  }

  /* ─── Breathing Ring ─── */
  .breathing {
    margin: 28px 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .breath-ring {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px solid rgba(124,154,130,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: breathe 6s ease-in-out infinite;
    transition: border-color 0.4s ease;
  }

  .breath-ring.done {
    animation: none;
    border-color: var(--accent);
  }

  .timer {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  .hint {
    font-size: 0.82rem;
    color: var(--text-muted);
    font-style: italic;
  }

  @keyframes breathe {
    0%, 100% {
      transform: scale(1);
      border-color: rgba(124,154,130,0.2);
    }
    50% {
      transform: scale(1.08);
      border-color: rgba(124,154,130,0.45);
    }
  }

  /* ─── Buttons ─── */
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  button {
    font-family: var(--font);
    font-size: 0.85rem;
    font-weight: 500;
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .btn-primary {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .btn-primary:hover {
    background: var(--accent-hover);
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    transform: translateY(-0.5px);
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid transparent;
  }

  .btn-ghost:hover:not(:disabled) {
    color: var(--text);
    background: rgba(0,0,0,0.03);
  }

  .btn-ghost:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  @media (max-width: 420px) {
    .card {
      padding: 28px 20px 22px;
    }
  }
</style>
