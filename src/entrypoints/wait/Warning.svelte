<script lang="ts">
    
    export let site = "this site";
    import { onMount } from "svelte";
    import { getDomain } from "tldts";

    let seconds = 90;
    let interval : NodeJS.Timeout;

    const params = new URLSearchParams(window.location.search);
    const originalUrl = params.get("target") ?? "";

    site = originalUrl ? getDomain(originalUrl) ?? "this site" : "this site"

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
        let domain = getDomain(originalUrl)
        chrome.runtime.sendMessage({
            type: "allow-tab",
            domain
        })
        window.location.replace(originalUrl)
    };

    const handleStay = async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            chrome.tabs.remove(tab.id);
        }
    };


    onMount(() => {
        startTimer();
    })

    </script>


    <main>
    <article>
    <h1>Pause.</h1>

    <p class="secondary">
        You're about to visit <strong>{site}</strong>.
    </p>

    <section class="breathing">
        <p>Take one slow breath.</p>
        <p class="subtle">Inhale. Hold. Exhale.</p>

        {#if seconds > 0}
        <p class="timer">{seconds}</p>
        {:else}
        <p class="subtle">It's up to you.</p>
        {/if}
    </section>

    <div class="actions">
        <button on:click={async () => await handleStay()}>
        Stay
        </button>

        <button class="secondary outline" disabled={seconds > 0} on:click={async () =>  await handleContinue()}>
        Continue
        </button>
    </div>
    </article>
    </main>

    <style>
    /* Full viewport centering */
    main {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem; /* breathing room on edges */
    }

    article {
    max-width: 480px;
    width: 100%;
    text-align: center;
    padding: 25px; /* remove vertical padding */
    }

    .breathing {
    margin: 2.5rem 0;
    }

    .subtle {
    opacity: 0.6;
    font-size: 0.95rem;
    }

    .timer {
    font-size: 2.5rem;
    margin-top: 1rem;
    }

    .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
    }

    /* Stack buttons on very small screens */
    @media (max-width: 420px) {
    .actions {
        flex-direction: column;
    }
    }
    </style>
