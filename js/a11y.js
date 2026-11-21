/* ==========================================================================
   DARBAK — Accessibility Module
   Injects the A11y UI and handles font size, contrast, motion, and TTS.
   ========================================================================== */

export function initA11y() {
  // 1. حقن واجهة القائمة في الصفحة
  injectA11yUI();

  const html = document.documentElement;
  const toggleBtn = document.getElementById('a11y-toggle');
  const panel = document.getElementById('a11y-panel');
  const overlay = document.getElementById('a11y-overlay');
  const closeBtn = document.getElementById('a11y-close');

  // 2. فتح وإغلاق القائمة
  const togglePanel = () => {
    const isOpen = panel.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    panel.setAttribute('aria-hidden', !isOpen);
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // إيقاف الصوت عند الإغلاق
    }
  };

  toggleBtn.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', togglePanel);
  overlay.addEventListener('click', togglePanel);

  // 3. استرجاع الإعدادات المحفوظة
  const savedFont = localStorage.getItem('darbak:font') || 'md';
  const savedContrast = localStorage.getItem('darbak:contrast') === 'high';
  const savedMotion = localStorage.getItem('darbak:motion') === 'reduced';

  html.setAttribute('data-font-size', savedFont);
  if (savedContrast) html.setAttribute('data-contrast', 'high');
  if (savedMotion) html.setAttribute('data-motion', 'reduced');

  // 4. التحكم في حجم الخط
  document.querySelectorAll('[data-font]').forEach(btn => {
    if (btn.dataset.font === savedFont) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
      const size = btn.dataset.font;
      html.setAttribute('data-font-size', size);
      localStorage.setItem('darbak:font', size);
      document.querySelectorAll('[data-font]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // 5. التباين العالي
  const contrastBtn = document.getElementById('a11y-contrast');
  if (savedContrast) contrastBtn.classList.add('is-active');
  contrastBtn.addEventListener('click', () => {
    const isHigh = html.getAttribute('data-contrast') === 'high';
    if (isHigh) {
      html.removeAttribute('data-contrast');
      localStorage.setItem('darbak:contrast', 'normal');
      contrastBtn.classList.remove('is-active');
    } else {
      html.setAttribute('data-contrast', 'high');
      localStorage.setItem('darbak:contrast', 'high');
      contrastBtn.classList.add('is-active');
    }
  });

  // 6. تقليل الحركة
  const motionBtn = document.getElementById('a11y-motion');
  if (savedMotion) motionBtn.classList.add('is-active');
  motionBtn.addEventListener('click', () => {
    const isReduced = html.getAttribute('data-motion') === 'reduced';
    if (isReduced) {
      html.removeAttribute('data-motion');
      localStorage.setItem('darbak:motion', 'full');
      motionBtn.classList.remove('is-active');
    } else {
      html.setAttribute('data-motion', 'reduced');
      localStorage.setItem('darbak:motion', 'reduced');
      motionBtn.classList.add('is-active');
    }
  });

  // 7. القراءة الصوتية (TTS)
  const playBtn = document.getElementById('a11y-tts-play');
  const stopBtn = document.getElementById('a11y-tts-stop');

  if ('speechSynthesis' in window) {
    playBtn.addEventListener('click', () => {
      window.speechSynthesis.cancel(); 
      const mainContent = document.querySelector('main');
      if (!mainContent) return;

      const text = mainContent.innerText;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      playBtn.classList.add('is-active');
    });

    stopBtn.addEventListener('click', () => {
      window.speechSynthesis.cancel();
      playBtn.classList.remove('is-active');
    });
  } else {
    playBtn.disabled = true;
    playBtn.textContent = 'غير مدعوم';
    stopBtn.disabled = true;
  }
}

// دالة حقن واجهة المستخدم
function injectA11yUI() {
  const uiHTML = `
    <button class="a11y-toggle" id="a11y-toggle" aria-label="إعدادات إمكانية الوصول" aria-expanded="false" aria-controls="a11y-panel">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
      </svg>
    </button>

    <div class="a11y-overlay" id="a11y-overlay"></div>

    <aside class="a11y-panel" id="a11y-panel" aria-hidden="true" aria-label="قائمة إمكانية الوصول">
      <div class="a11y-panel__header">
        <h2 class="a11y-panel__title">إمكانية الوصول</h2>
        <button class="icon-btn" id="a11y-close" aria-label="إغلاق القائمة">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="a11y-group">
        <label>حجم الخط</label>
        <div class="a11y-actions">
          <button class="a11y-btn" data-font="sm">ص</button>
          <button class="a11y-btn" data-font="md">م</button>
          <button class="a11y-btn" data-font="lg">ك</button>
          <button class="a11y-btn" data-font="xl">ك ك</button>
        </div>
      </div>

      <div class="a11y-group">
        <label>التباين العالي</label>
        <button class="a11y-btn" id="a11y-contrast" style="width: 100%;">تفعيل التباين العالي</button>
      </div>

      <div class="a11y-group">
        <label>تقليل الحركة</label>
        <button class="a11y-btn" id="a11y-motion" style="width: 100%;">إيقاف الحركات والانتقالات</button>
      </div>

      <div class="a11y-group">
        <label>القراءة الصوتية</label>
        <div class="a11y-actions">
          <button class="a11y-btn" id="a11y-tts-play">▶ تشغيل القراءة</button>
          <button class="a11y-btn" id="a11y-tts-stop">■ إيقاف</button>
        </div>
      </div>
    </aside>
  `;
  document.body.insertAdjacentHTML('beforeend', uiHTML);
}
