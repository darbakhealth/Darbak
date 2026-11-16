/* ==========================================================================
   DARBAK — Shared Components
   Pure UI functions. They receive data and return HTML strings.
   No data fetching happens here.
   ========================================================================== */

/**
 * Generate the HTML for a single disease card.
 * @param {object} disease - The disease object from JSON.
 * @returns {string} HTML string.
 */
export function createDiseaseCard(disease) {
  return `
    <a href="disease.html?slug=${disease.slug}" class="disease-card" aria-label="اقرأ عن ${disease.title}">
      <div class="disease-card__icon" aria-hidden="true">
        <!-- Placeholder icon using SVG -->
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </div>
      <h3 class="disease-card__title">${disease.title}</h3>
      <p class="disease-card__tagline">${disease.tagline}</p>
      <span class="disease-card__action">اقرأ المزيد ←</span>
    </a>
  `;
}

/**
 * Generate the HTML for a grid of disease cards.
 * @param {object[]} diseases - Array of disease objects.
 * @returns {string} HTML string.
 */
export function createDiseaseGrid(diseases) {
  const cards = diseases.map(createDiseaseCard).join('');
  return `
    <div class="diseases-grid">
      ${cards}
    </div>
  `;
}

/**
 * Generate the medical disclaimer HTML.
 * @returns {string} HTML string.
 */
export function createMedicalDisclaimer() {
  return `
    <div class="medical-disclaimer">
      <div class="medical-disclaimer__icon" aria-hidden="true">⚕</div>
      <div class="medical-disclaimer__text">
        <strong>تنبيه طبي:</strong> منصة دربك هي منصة تثقيف صحي فقط. المعلومات المقدمة هنا لا تُغني عن استشارة الطبيب المختص أو التشخيص الطبي أو الحصول على وصفة دوائية.
      </div>
    </div>
  `;
}
