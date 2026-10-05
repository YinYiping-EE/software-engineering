<script setup>
defineProps({name: {type: String, required: true}});
const paths = {
  play: 'M9 5 19 12 9 19Z', pause: 'M9 5v14M15 5v14',
  previous: 'M5 5v14M19 5 8 12l11 7Z', next: 'M19 5v14M5 5l11 7-11 7Z',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  repeat: 'm17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3',
  shuffle: 'm18 3 3 3-3 3M3 18h2c4 0 7-12 11-12h5M3 6h2c1.8 0 3.4 2.4 5 5m4 5c.7 1.2 1.3 2 2 2h5m-3-3 3 3-3 3',
  volume: 'M11 4 6 8H3v8h3l5 4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  muted: 'M11 4 6 8H3v8h3l5 4Zm5 6 5 5m0-5-5 5',
  chevron: 'm6 9 6 6 6-6', note: 'M9 18V5l11-2v13M9 8l11-2M9 18a3 3 0 1 1-3-3h3m11 1a3 3 0 1 1-3-3h3',
};
</script>

<template>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.note" /></svg>
</template>
