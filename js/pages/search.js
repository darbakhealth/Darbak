import { getAllDiseases } from '../data.js';

/**
 * تطبيع النص العربي للبحث (تجاهل التشكيل، توحيد الهمزات والتاء المربوطة)
 */
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة التشكيل
    .replace(/[أإآ]/g, "ا") // توحيد الألف
    .replace(/ة/g, "ه") // التاء المربوطة
    .replace(/ى/g, "ي") // الألف المقصورة
    .replace(/[ؤئ]/g, "ء") // الهمزات
    .replace(/\s+/g, " ") // مسافات متعددة
    .trim();
}

/**
 * بناء فهرس بحث من بيانات الأمراض
 */
function buildSearchIndex(diseases) {
  const index = [];
  
  diseases.forEach(disease => {
    // 1. إضافة عنوان المرض
    index.push({
      diseaseSlug: disease.slug,
      diseaseTitle: disease.title,
      sectionId: '',
      sectionTitle: 'عن المرض',
      text: `${disease.title} ${disease.tagline}`
    });

    // 2. إضافة أقسام المرض
    if (disease.sections) {
      disease.sections.forEach(section => {
        let contentText = section.title + ' ';
        if (section.content) contentText += section.content + ' ';
        if (section.items) contentText += section.items.join(' ');
        
        index.push({
          diseaseSlug: disease.slug,
          diseaseTitle: disease.title,
          sectionId: section.id,
          sectionTitle: section.title,
          text: contentText
        });
      });
    }
  });
  
  return index;
}

export async function initSearchPage() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  
  if (!form || !input || !resultsContainer) return;

  let searchIndex = [];
  try {
    const diseases = await getAllDiseases();
    searchIndex = buildSearchIndex(diseases);
  } catch (error) {
    console.error('فشل تحميل بيانات البحث', error);
    resultsContainer.innerHTML = '<p class="error-text">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
    return;
  }

  const performSearch = (query) => {
    const q = normalizeArabic(query);
    
    if (q.length < 2) {
      resultsContainer.innerHTML = '<p class="search-hint">يرجى كتابة حرفين على الأقل للبحث.</p>';
      return;
    }

    const matchedResults = searchIndex.filter(item => 
      normalizeArabic(item.text).includes(q)
    );

    // إزالة التكرار (قد نجد نفس القسم يطابق بكلمات مختلفة)
    const uniqueResults = Array.from(new Set(matchedResults.map(r => r.diseaseSlug + r.sectionId)))
      .map(id => {
        return matchedResults.find(r => (r.diseaseSlug + r.sectionId) === id);
      });

    if (uniqueResults.length === 0) {
      resultsContainer.innerHTML = `<p class="search-hint">لم يتم العثور على نتائج لـ "<strong>${query}</strong>". جرب كلمات أخرى.</p>`;
      return;
    }

    // عرض النتائج
    let html = `<h2 class="search-results-title">نتائج البحث (${uniqueResults.length}):</h2>`;
    html += '<div class="search-results-list">';
    
    uniqueResults.forEach(res => {
      // الرابط يوجه لصفحة المرض، ويمرر الـ ID للقسم ليقفز إليه
      const link = `disease.html?slug=${res.diseaseSlug}${res.sectionId ? '#' + res.sectionId : ''}`;
      
      html += `
        <a href="${link}" class="search-result-card">
          <div class="search-result-card__header">
            <strong>${res.diseaseTitle}</strong> 
            <span class="search-result-card__badge">${res.sectionTitle}</span>
          </div>
          <p class="search-result-card__text">${res.text.substring(0, 120)}...</p>
        </a>
      `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
  };

  // التعامل مع إرسال النموذج
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    
    // تحديث الرابط ليتمكن المستخدم من مشاركته
    const url = new URL(window.location);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url);
    
    performSearch(query);
  });

  // التحقق مما إذا كان هناك بحث في الرابط عند فتح الصفحة
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');
  if (initialQuery) {
    input.value = initialQuery;
    performSearch(initialQuery);
  }
}
