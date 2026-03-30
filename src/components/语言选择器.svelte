<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let selectedLanguage = 'javascript';
  const languages = ['javascript', 'typescript', 'python', 'java', 'cpp'];
  const dispatch = createEventDispatcher();
  
  function selectLanguage(lang) {
    selectedLanguage = lang;
    dispatch('change', { language: lang });
  }
</script>

<select bind:value={selectedLanguage} on:change={(e) => selectLanguage(e.target.value)}>
  {#each languages as lang}
    <option value={lang}>{lang}</option>
  {/each}
</select>

<style>
  select {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
</style>
