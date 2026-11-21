/* ==========================================================================
   DARBAK — Shared Components
   ========================================================================== */

// مكتبة أيقونات للأمراض
const icons = {
  diabetes: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
  hypertension: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  asthma: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>',
  kidney: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4c-4.5 0-6 3-6 7s2 7 6 7c2 0 4-1 5-3 1 2 3 3 5 3 4 0 6-3 6-7s-1.5-7-6-7c-2 0-4 1-5 3-1-2-3-3-5-3z"/></svg>',
  default: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
};

export function createDiseaseCard(disease) {
  const iconSvg = icons[disease.icon] || icons.default;
  
  return `
    <a href="disease.html?slug=${disease.slug}" class="disease-card" aria-label="اقرأ عن ${disease.title}">
      <div class="disease-card__icon" style="color: ${disease.color || 'var(--color-accent)'}; background: ${disease.color ? disease.color + '15' : 'var(--color-surface-2)'};">
        ${iconSvg}
      </div>
      <h3 class="disease-card__title">${disease.title}</h3>
      <p class="disease-card__tagline">${disease.tagline}</p>
      <span class="disease-card__action">اقرأ المزيد ←</span>
    </a>
  `;
}

export function createDiseaseGrid(diseases) {
  const cards = diseases.map(createDiseaseCard).join('');
  return `<div class="diseases-grid">${cards}</div>`;
}

export function createMedicalDisclaimer() {
  return `
    <div class="medical-disclaimer">
      <div class="medical-disclaimer__icon" aria-hidden="true" style="font-size: 24px;">⚕</div>
      <div class="medical-disclaimer__text">
        <strong>تنبيه طبي:</strong> منصة دربك هي منصة تثقيف صحي فقط. المعلومات المقدمة هنا لا تُغني عن استشارة الطبيب المختص أو التشخيص الطبي أو الحصول على وصفة دوائية.
      </div>
    </div>
  `;
}
