/* ==========================================================================
   DARBAK — Home Page Controller
   Loads data and renders the home page components.
   ========================================================================== */

import { getAllDiseases } from '../data.js';
import { createDiseaseGrid, createMedicalDisclaimer } from '../components.js';

export async function initHomePage() {
  // 1. Render Disclaimer immediately
  const disclaimerContainer = document.getElementById('disclaimer-container');
  if (disclaimerContainer) {
    disclaimerContainer.innerHTML = createMedicalDisclaimer();
  }

  // 2. Fetch diseases and render grid
  const gridContainer = document.getElementById('diseases-container');
  if (gridContainer) {
    try {
      gridContainer.innerHTML = '<p class="loading-text">جاري تحميل الأمراض...</p>';
      
      const diseases = await getAllDiseases();
      
      // We sort them or limit them if needed, but here we show all 5
      gridContainer.innerHTML = createDiseaseGrid(diseases);
    } catch (error) {
      gridContainer.innerHTML = '<p class="error-text">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
      console.error(error);
    }
  }
}
