import { mount } from "svelte";
import Warning from "./Warning.svelte";
import './app.css';

mount(Warning, {
    target: document.getElementById('app')!
})