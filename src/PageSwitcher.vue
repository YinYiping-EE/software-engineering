<script setup>
import {t} from './locale.js';
</script>

<template>
  <nav class="page-switcher" data-page="calculator" :aria-label="t('页面切换')">
    <a href="/" aria-current="page">
      <span class="page-switcher-icon" aria-hidden="true">=</span>
      <span class="page-switcher-copy"><strong>{{ t('算数记') }}</strong><small>{{ t('计算器') }}</small></span>
    </a>
    <a href="/scriptchisel/">
      <span class="page-switcher-icon" aria-hidden="true">S</span>
      <span class="page-switcher-copy"><strong>ScriptChisel</strong><small>{{ t('项目展示') }}</small></span>
    </a>
  </nav>
</template>
