import { getManifest, getQuiz } from '../data.js';

export async function initQuizPage() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (slug) {
    await renderQuiz(container, slug);
  } else {
    await renderQuizList(container);
  }
}

// عرض قائمة الاختبارات المتاحة
async function renderQuizList(container) {
  try {
    const manifest = await getManifest();
    let html = '<h1 class="page-title">الاختبارات التثقيفية</h1>';
    
    if (!manifest.quizzes || manifest.quizzes.length === 0) {
      container.innerHTML = html + '<p class="search-hint">لا توجد اختبارات متاحة حالياً.</p>';
      return;
    }

    html += '<div class="quiz-list">';
    let hasValidQuizzes = false;

    // جلب تفاصيل كل اختبار لعرض العنوان (مع حماية ضد الملفات الناقصة)
    for (const qSlug of manifest.quizzes) {
      try {
        const quiz = await getQuiz(qSlug);
        html += `
          <a href="quiz.html?slug=${quiz.slug}" class="quiz-list-card">
            <h2>${quiz.title}</h2>
            <p>${quiz.description}</p>
            <span class="btn btn--primary">ابدأ الاختبار</span>
          </a>
        `;
        hasValidQuizzes = true;
      } catch (err) {
        // إذا لم يوجد ملف اختبار، نتجاهله بهدوء ولا نكسر الصفحة
        console.warn(`تنبيه: لم يتم العثور على ملف الاختبار: ${qSlug}.json`);
      }
    }
    
    html += '</div>';

    if (!hasValidQuizzes) {
       container.innerHTML = '<h1 class="page-title">الاختبارات التثقيفية</h1><p class="search-hint">جاري إعداد الاختبارات قريباً...</p>';
       return;
    }

    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = '<p class="error-text">حدث خطأ أثناء تحميل قائمة الاختبارات.</p>';
    console.error(error);
  }
}

// عرض اختبار واحد والتفاعل معه
async function renderQuiz(container, slug) {
  try {
    const quiz = await getQuiz(slug);
    document.title = `${quiz.title} | دربك`;

    let html = `
      <div class="quiz-header">
        <h1 class="page-title">${quiz.title}</h1>
        <p class="quiz-desc">${quiz.description}</p>
      </div>
      <form id="quiz-form" class="quiz-form">
    `;

    quiz.questions.forEach((q, index) => {
      html += `
        <div class="quiz-question" data-qid="${q.id}">
          <h3>${index + 1}. ${q.text}</h3>
          <div class="quiz-options">
            ${q.options.map((opt, i) => `
              <label class="quiz-option">
                <input type="radio" name="${q.id}" value="${i}" required>
                <span class="quiz-option__text">${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `
        <button type="submit" class="btn btn--primary btn--full">إظهار النتيجة</button>
      </form>
      <div id="quiz-result" class="quiz-result" style="display: none;"></div>
    `;

    container.innerHTML = html;

    const form = document.getElementById('quiz-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateResult(quiz, form);
    });

  } catch (error) {
    container.innerHTML = '<p class="error-text">لم يتم العثور على الاختبار المطلوب.</p>';
    console.error(error);
  }
}

// حساب النتيجة وعرض التفسيرات
function calculateResult(quiz, form) {
  const formData = new FormData(form);
  let score = 0;
  let resultHtml = '<h2>النتيجة:</h2>';

  quiz.questions.forEach((q, index) => {
    const selected = parseInt(formData.get(q.id));
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) score++;

    resultHtml += `
      <div class="quiz-result-item ${isCorrect ? 'is-correct' : 'is-wrong'}">
        <h4>${index + 1}. ${q.text}</h4>
        <p><strong>إجابتك:</strong> ${q.options[selected]}</p>
        ${!isCorrect ? `<p><strong>الإجابة الصحيحة:</strong> ${q.options[q.correctIndex]}</p>` : ''}
        <p class="quiz-explanation"><strong>التفسير:</strong> ${q.explanation}</p>
      </div>
    `;
  });

  const percentage = Math.round((score / quiz.questions.length) * 100);
  
  const resultContainer = document.getElementById('quiz-result');
  resultContainer.innerHTML = `
    <div class="quiz-score-box">
      <span class="quiz-score-number">${percentage}%</span>
      <p>لقد أجبت بشكل صحيح على ${score} من أصل ${quiz.questions.length} أسئلة.</p>
    </div>
    ${resultHtml}
    <div style="text-align: center; margin-top: var(--space-6);">
      <a href="quiz.html" class="btn btn--primary">العودة لقائمة الاختبارات</a>
    </div>
  `;
  
  resultContainer.style.display = 'block';
  form.style.display = 'none'; 
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
