(() => {
  const navigation = document.querySelector('.page-switcher');
  if (!navigation) return;
  function updateLabels() {
    let english = false;
    try { english = localStorage.getItem('calculator-language') === 'en'; } catch { /* Optional preference. */ }
    navigation.setAttribute('aria-label', english ? 'Switch pages' : '页面切换');
    navigation.lang = english ? 'en' : 'zh-CN';
    const labels = {calculator: english ? 'Calc Journal' : '算数记',
      calculatorCaption: english ? 'Calculator' : '计算器', projectCaption: english ? 'Project showcase' : '项目展示'};
    navigation.querySelectorAll('[data-page-label]').forEach(element => {
      element.textContent = labels[element.dataset.pageLabel];
    });
  }
  updateLabels();
  window.addEventListener('storage', event => { if (event.key === 'calculator-language') updateLabels(); });
})();
