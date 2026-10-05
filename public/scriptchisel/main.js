(() => {
  'use strict';
  const motion = document.querySelector('#motion');
  const motionToggle = document.querySelector('#motion-toggle');
  const motionLabel = document.querySelector('#motion-label');
  function setMotion(paused) {
    motion.src = paused ? 'assets/poster.webp' : 'assets/writing-machine.gif';
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', paused ? '播放写字机动画' : '暂停写字机动画');
    motionLabel.textContent = paused ? '播放动画' : '暂停动画';
  }
  motionToggle.addEventListener('click', () => setMotion(motionToggle.getAttribute('aria-pressed') !== 'true'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) setMotion(true);
  reducedMotion.addEventListener('change', event => setMotion(event.matches));

  const stages = [
    { image: 'pipeline-original', title: '原始答卷', alt: '真实手写数学答卷的原始图像', description: '从真实答卷采集图像，保留题目与学生作答的空间关系。右侧为项目已有的同页处理示例。' },
    { image: 'pipeline-detection', title: '区域识别', alt: '同一答卷上的题目、作答区域识别与掩码示例', description: '实例分割提取题目与学生答案，再把相应作答区域与题目配对，为 AI 理解和后续布局提供输入。' },
    { image: 'pipeline-planning', title: '布局示例', alt: '同一答卷的答题区域、可用空间和批注标记布局示例', description: '根据已有内容筛选空白区域，安排批注的位置和尺寸。这里展示项目已有的布局示例；错误锚点驱动规划仍在研究中。' }
  ];
  const hardware = [
    { image: 'machine', title: '三层结构，一条处理链路。', label: 'MODULAR SYSTEM', caption: '模块化整机三维设计', description: '进纸机构、CoreXY 书写平台与顶层电控舱协同工作。模块化结构便于维护，也为视觉、运动控制和云端通信保留清晰的接口。' },
    { image: 'machine-arm', title: '让笔尖抵达指定位置。', label: 'COREXY WRITING PLATFORM', caption: '中层 CoreXY 书写平台设计', description: 'CoreXY 机构完成平面运动，配合笔尖升降执行分段笔画。文本与符号经本地路径规划后，转换为控制器可执行的 G-code。' },
    { image: 'machine-feed', title: '把纸张送入工作区域。', label: 'PAPER FEEDING MODULE', caption: '底层进纸机构设计', description: '底层进纸机构围绕纸张输送与卷面放置组织。与采集、书写阶段相连接，形成从纸张进入到反馈输出的机械链路。' },
    { image: 'machine-control', title: '视觉计算与运动执行协同。', label: 'EDGE & CONTROL CABIN', caption: '顶层电控舱设计', description: '电控舱容纳边缘计算、控制与供电组件。边缘端处理图像和书写路径，控制器执行运动指令，设备状态通过涂鸦平台同步。' }
  ];
  function wireTabs(selector, activate) {
    const buttons = Array.from(document.querySelectorAll(selector));
    function select(index, focus) {
      buttons.forEach((button, i) => {
        button.classList.toggle('active', i === index);
        button.setAttribute('aria-selected', String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
      activate(index, buttons[index]);
      if (focus) buttons[index].focus();
    }
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(index, false));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); select(next, true); }
      });
    });
  }
  wireTabs('[data-stage]', (index, button) => {
    const stage = stages[index];
    document.querySelector('#stage-image').src = `assets/${stage.image}.webp`;
    document.querySelector('#stage-image').alt = stage.alt;
    document.querySelector('#stage-kicker').textContent = stage.title;
    document.querySelector('#stage-description').textContent = stage.description;
    document.querySelector('#stage-panel').setAttribute('aria-labelledby', button.id);
    document.querySelector('#stage-zoom').dataset.zoom = `assets/${stage.image}.webp`;
    document.querySelector('#stage-zoom').dataset.caption = `${stage.title}：项目已有的同页处理示例`;
  });
  wireTabs('[data-hardware]', (index, button) => {
    const item = hardware[index];
    document.querySelector('#hardware-image').src = `assets/${item.image}.webp`;
    document.querySelector('#hardware-image').alt = item.caption;
    document.querySelector('#hardware-caption').textContent = item.caption;
    document.querySelector('#hardware-name').textContent = item.title;
    document.querySelector('#hardware-label').textContent = item.label;
    document.querySelector('#hardware-description').textContent = item.description;
    document.querySelector('#hardware-detail').setAttribute('aria-labelledby', button.id);
    document.querySelector('#hardware-zoom').dataset.zoom = `assets/${item.image}.webp`;
    document.querySelector('#hardware-zoom').dataset.caption = item.caption;
  });

  const dialog = document.querySelector('#image-dialog');
  document.querySelectorAll('[data-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      const caption = button.dataset.caption;
      document.querySelector('#dialog-image').src = button.dataset.zoom;
      document.querySelector('#dialog-image').alt = caption;
      document.querySelector('#dialog-caption').textContent = caption;
      dialog.showModal();
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();
