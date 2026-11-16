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

// 1. عرض قائمة الاختبارات المتاحة
async function renderQuizList(container) {
  try {
    const manifest = await getManifest();
    let html = '<h1 class="page-title">الاختبارات التثقيفية</h1>';
    
    if (!manifest.quizzes || manifest.quizzes.length === 0) {
      container.innerHTML = html + '<p class="search-hint">لا توجد اختبارات متاحة حالياً.</p>';
      return;
    }

    let cardsHtml = '';
    let hasValidQuizzes = false;

    // نجرب تحميل كل اختبار على حدة
    for (const qSlug of manifest.quizzes) {
      try {
        const quiz = await getQuiz(qSlug);
        cardsHtml += `
          <a href="quiz.html?slug=${quiz.slug}" class="quiz-list-card">
            <h2>${quiz.title}</h2>
            <p>${quiz.description}</p>
            <span class="btn btn--primary">ابدأ الاختبار</span>
          </a>
        `;
        hasValidQuizzes = true;
      } catch (err) {
        // إذا كان الملف غير موجود، نطبع تحذيراً في الـ Console فقط ولا نكسر الصفحة
        console.warn(`تم تخطي الاختبار غير الموجود: ${qSlug}.json`);
      }
    }
    
    if (!hasValidQuizzes) {
       container.innerHTML = html + '<p class="search-hint">جاري إعداد الاختبارات... (لم يتم العثور على ملفات).</p>';
       return;
    }

    html += `<div class="quiz-list">${cardsHtml}</div>`;
    container.innerHTML = html;

  } catch (error) {
    // رسالة خطأ تفصيلية تظهر على الشاشة للمساعدة في التشخيص
    container.innerHTML = `
      <div style="background: #FEF2F2; border: 1px solid #EF4444; color: #991B1B; padding: 20px; border-radius: 8px; text-align: center; margin: 20px auto; max-width: 600px;">
        <h3 style="color: #991B1B; margin-bottom: 10px;">حدث خطأ أثناء تحميل الاختبارات</h3>
        <p><strong>السبب:</strong> ${error.message}</p>
        <p style="font-size: 14px; margin-top: 10px;">تأكد من أن ملف <code>data/manifest.json</code> موجود ومكتوب بشكل صحيح.</p>
      </div>
    `;
    console.error('خطأ في قائمة الاختبارات:', error);
  }
}

// 2. عرض اختبار واحد والتفاعل معه
async function renderQuiz(container, slug) {
  try {
    const quiz = await getQuiz(slug);
    document.title = `${quiz.title} | دربك`;

    let html = `
      <div class="quiz-header">
        <h1 class="page-title">${quiz.title}</h1>
        <p class="quiz-desc" style="text-align: center; color: var(--color-text-muted); margin-bottom: var(--space-6);">${quiz.description}</p>
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

    // ربط نموذج الاختبار بدالة الحساب
    const form = document.getElementById('quiz-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateResult(quiz, form);
    });

  } catch (error) {
    container.innerHTML = `
      <div style="background: #FEF2F2; border: 1px solid #EF4444; color: #991B1B; padding: 20px; border-radius: 8px; text-align: center; margin: 20px auto; max-width: 600px;">
        <h3 style="color: #991B1B; margin-bottom: 10px;">لم يتم العثور على هذا الاختبار</h3>
        <p>تأكد من وجود الملف: <code>data/quizzes/${slug}.json</code></p>
      </div>
    `;
    console.error('خطأ في تحميل الاختبار الفردي:', error);
  }
}

// 3. حساب النتيجة وعرض التفسيرات
function calculateResult(quiz, form) {
  const formData = new FormData(form);
  let score = 0;
  let resultHtml = '<h2>تفاصيل إجاباتك:</h2>';

  quiz.questions.forEach((q, index) => {
    const selectedStr = formData.get(q.id);
    const selected = selectedStr !== null ? parseInt(selectedStr) : -1;
    const isCorrect = selected === q.correctIndex;
    
    if (isCorrect) score++;

    resultHtml += `
      <div class="quiz-result-item ${isCorrect ? 'is-correct' : 'is-wrong'}">
        <h4>${index + 1}. ${q.text}</h4>
        <p><strong>إجابتك:</strong> ${selected >= 0 ? q.options[selected] : 'لم تجب'}</p>
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
  form.style.display = 'none'; // إخفاء الأسئلة بعد إظهار النتيجة
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
