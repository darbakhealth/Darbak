import { getDisease } from '../data.js';
import { createMedicalDisclaimer } from '../components.js';

export async function initDiseasePage() {
  const container = document.getElementById('disease-container');
  if (!container) return;

  // 1. جلب اسم المرض من الرابط (مثال: disease.html?slug=diabetes)
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    container.innerHTML = '<p class="error-text">لم يتم تحديد المرض. يرجى العودة للصفحة الرئيسية واختيار مرض.</p>';
    return;
  }

  try {
    // 2. جلب البيانات
    const disease = await getDisease(slug);
    
    // 3. تحديث عنوان الصفحة
    document.title = `${disease.title} | دربك`;

    // 4. بناء واجهة المرض
    let html = `
      <header class="disease-header">
        <h1 class="disease-header__title">${disease.title}</h1>
        <p class="disease-header__tagline">${disease.tagline}</p>
        
        <div class="disease-meta">
          <span>تاريخ آخر مراجعة: ${disease.lastReview}</span>
          <span>|</span>
          <span>المراجع الطبي: ${disease.reviewer ? disease.reviewer.name : 'قيد المراجعة الطبية'}</span>
        </div>
      </header>

      ${createMedicalDisclaimer()}
    `;

    // 5. بناء أقسام المرض (الأعراض، الأسباب، إلخ)
    html += '<div class="disease-sections">';
    disease.sections.forEach(section => {
      // تحديد نوع القسم (عادي أو تحذير)
      const sectionClass = section.type === 'warning' ? 'disease-section disease-section--warning' : 'disease-section';
      
      html += `<section class="${sectionClass}" id="${section.id}">`;
      html += `<h2 class="disease-section__title">${section.title}</h2>`;
      
      if (section.content) {
        html += `<p>${section.content}</p>`;
      }
      
      if (section.items && section.items.length > 0) {
        html += '<ul class="disease-list">';
        section.items.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      }
      
      html += '</section>';
    });
    html += '</div>';

    // 6. بناء المصادر
    if (disease.sources && disease.sources.length > 0) {
      html += `
        <div class="disease-sources">
          <h3>المصادر والمراجع العلمية:</h3>
          <ul>
            ${disease.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a></li>`).join('')}
          </ul>
        </div>
      `;
    }

    // 7. حقن كل شيء في الصفحة
    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = '<p class="error-text">عذراً، لم يتم العثور على هذا المرض أو حدث خطأ في التحميل.</p>';
    console.error(error);
  }
}
