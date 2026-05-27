/* ============================================================
   BUSINESS LAW CONSULTING — UNIVERSAL SCRIPT
   Работает для всех 5 страниц сайта
   ============================================================ */

// ============================================================
// КОНФИГУРАЦИЯ TELEGRAM
// ============================================================
const TG_TOKEN   = '8830532011:AAGJ6A7LZmmWT1c2Qi2YxZRJHpOd62FNN1w';
const TG_CHAT_ID = '-5102240344';

// ============================================================
// ОПРЕДЕЛЯЕМ НАЗВАНИЕ СТРАНИЦЫ ДЛЯ TELEGRAM
// ============================================================
function getPageName() {
  const title = document.title || '';
  if (title.includes('Due Diligence'))    return 'Due Diligence';
  if (title.includes('Взыскание'))        return 'Взыскание задолженности';
  if (title.includes('Корпоратив'))       return 'Корпоративные услуги';
  if (title.includes('Регистрац'))        return 'Регистрация бизнеса';
  if (title.includes('Договор'))          return 'Договорная работа';
  return document.title || 'Business Law Consulting';
}

// ============================================================
// ЯЗЫКОВАЯ СИСТЕМА — поддерживает оба формата:
//   1) data-ru / data-uz  (первый сайт)
//   2) data-i18n + объект translations (второй сайт)
// ============================================================
let currentLang = localStorage.getItem('blc-lang') || 'ru';

// Объект переводов — страницы подмешивают свои ключи
let translations = { ru: {}, uz: {} };

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('blc-lang', lang);

  // --- Формат 1: data-ru / data-uz ---
  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (!val) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = el.getAttribute('data-ph-' + lang) || val;
    } else {
      el.innerHTML = val;
    }
  });

  document.querySelectorAll('[data-ph-' + lang + ']').forEach(el => {
    el.placeholder = el.getAttribute('data-ph-' + lang);
  });

  // --- Формат 2: data-i18n ---
  const t = translations[lang];
  if (t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (t[key] !== undefined) el.placeholder = t[key];
    });
  }

  // --- Кнопки языка — оба варианта ---
  // Вариант 1: #btn-ru / #btn-uz
  const btnRu = document.getElementById('btn-ru');
  const btnUz = document.getElementById('btn-uz');
  if (btnRu) btnRu.classList.toggle('active', lang === 'ru');
  if (btnUz) btnUz.classList.toggle('active', lang === 'uz');

  // Вариант 2: .nav-lang button / .lang-switcher button
  document.querySelectorAll('.nav-lang button, .lang-btn').forEach(btn => {
    const btnLang = (btn.getAttribute('data-lang') ||
                     btn.id?.replace('btn-', '') ||
                     btn.textContent.trim().toLowerCase());
    btn.classList.toggle('active', btnLang === lang);
  });

  document.documentElement.lang = lang;

  // Закрываем мобильное меню
  closeMobileMenu();
}

// ============================================================
// ТЕЛЕФОН — единая логика для всех полей +998
// ============================================================
const PHONE_PREFIX = '+998';

function initPhoneInput(input) {
  if (!input) return;

  // Устанавливаем начальное значение
  if (!input.value || input.value === '+' || input.value === '') {
    input.value = PHONE_PREFIX;
  }

  input.addEventListener('focus', function () {
    if (!this.value.startsWith(PHONE_PREFIX)) this.value = PHONE_PREFIX;
    setTimeout(() => this.setSelectionRange(this.value.length, this.value.length), 0);
  });

  input.addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '');

    // Убираем префикс 998 из начала, если он есть
    if (digits.startsWith('998')) digits = digits.slice(3);

    // Максимум 9 цифр после +998
    digits = digits.substring(0, 9);

    this.value = PHONE_PREFIX + digits;
  });

  input.addEventListener('keydown', function (e) {
    const prefLen = PHONE_PREFIX.length;
    if (
      (e.key === 'Backspace' || e.key === 'Delete') &&
      this.selectionStart <= prefLen &&
      this.selectionEnd <= prefLen
    ) {
      e.preventDefault();
    }
  });

  input.addEventListener('click', function () {
    if (this.selectionStart < PHONE_PREFIX.length) {
      this.setSelectionRange(this.value.length, this.value.length);
    }
  });
}

// Инициализируем все телефонные поля на странице
function initAllPhoneInputs() {
  const selectors = [
    'input[type="tel"]',
    'input#f-phone',
    'input[id*="phone"]',
    'input[placeholder*="998"]',
    'input[placeholder*="+998"]',
  ];
  document.querySelectorAll(selectors.join(',')).forEach(input => {
    initPhoneInput(input);
  });
}

// ============================================================
// ВАЛИДАЦИЯ ТЕЛЕФОНА
// ============================================================
function isPhoneValid(phone) {
  return phone && phone.startsWith(PHONE_PREFIX) && phone.length === PHONE_PREFIX.length + 9;
}

// ============================================================
// ОТПРАВКА В TELEGRAM — универсальная
// ============================================================
async function sendToTelegram() {
  const nameEl    = document.getElementById('f-name');
  const phoneEl   = document.getElementById('f-phone');
  const messageEl = document.getElementById('f-message');
  const submitBtn = document.querySelector('.btn-submit, .form-submit');

  const name    = nameEl    ? nameEl.value.trim()    : '';
  const phone   = phoneEl   ? phoneEl.value.trim()   : '';
  const message = messageEl ? messageEl.value.trim() : '';

  const t = translations[currentLang]?.alert_name ? translations[currentLang] : null;

  if (!name) {
    alert(t?.alert_name || (currentLang === 'uz' ? 'Исмингизни киритинг' : 'Введите ваше имя'));
    return;
  }

  if (!isPhoneValid(phone)) {
    alert(t?.alert_phone || (currentLang === 'uz' ? 'Телефон рақамини тўлиқ киритинг (+998 XX XXX-XX-XX)' : 'Введите полный номер телефона (+998 XX XXX-XX-XX)'));
    return;
  }

  const text =
    `📋 *Новая заявка — ${getPageName()}*\n\n` +
    `👤 *Имя:* ${name}\n` +
    `📞 *Телефон:* ${phone}` +
    (message ? `\n💬 *Сообщение:* ${message}` : '') +
    `\n\n🌐 *Язык:* ${currentLang.toUpperCase()}\n` +
    `⏰ ${new Date().toLocaleString('ru-RU')}`;

  if (submitBtn) {
    submitBtn.textContent = t?.sending || (currentLang === 'uz' ? 'Юборилмокда...' : 'Отправка...');
    submitBtn.disabled = true;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'Markdown' })
    });

    const data = await res.json();

    if (data.ok) {
      // Сбрасываем форму
      if (nameEl)    nameEl.value    = '';
      if (phoneEl)   phoneEl.value   = PHONE_PREFIX;
      if (messageEl) messageEl.value = '';

      // Показываем успех — поддерживаем оба варианта
      const successEl = document.getElementById('form-success');
      const formEl    = document.getElementById('contact-form');
      const modalEl   = document.getElementById('modal');

      if (successEl && formEl) {
        // Второй сайт — скрываем форму, показываем блок
        formEl.style.display    = 'none';
        successEl.style.display = 'block';
      } else if (modalEl) {
        // Первый сайт — открываем модалку
        modalEl.classList.add('open');
      }
    } else {
      console.error('Telegram API error:', data);
      alert(t?.alert_error || 'Ошибка отправки. Позвоните: +998 90 888-44-66');
      if (submitBtn) {
        submitBtn.textContent = t?.form_btn || (currentLang === 'uz' ? 'Юбориш' : 'Отправить');
        submitBtn.disabled    = false;
      }
    }
  } catch (e) {
    console.error('Network error:', e);
    alert(t?.alert_net || 'Ошибка соединения. Позвоните: +998 90 888-44-66');
    if (submitBtn) {
      submitBtn.textContent = t?.form_btn || (currentLang === 'uz' ? 'Юбориш' : 'Отправить');
      submitBtn.disabled    = false;
    }
  }
}

// Для первого сайта (onclick="submitForm()")
function submitForm() { sendToTelegram(); }

// ============================================================
// МОДАЛЬНОЕ ОКНО (первый сайт)
// ============================================================
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('open');
}

// ============================================================
// FAQ — поддерживает оба варианта вёрстки
// ============================================================

// Вариант 1: div.faq-q + div.faq-a (первый сайт)
function toggleFaq(el) {
  const item   = el.closest ? el.closest('.faq-item') : el.parentElement;
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Вариант 2: button.faq-question + div.faq-answer (второй сайт)
function initFaqButtons() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    if (btn.dataset.faqInit) return;
    btn.dataset.faqInit = '1';
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const isOpen = this.classList.contains('open');

      document.querySelectorAll('.faq-question').forEach(b => b.classList.remove('open'));
      document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));

      if (!isOpen) {
        this.classList.add('open');
        if (answer) answer.classList.add('open');
      }
    });
  });
}

// ============================================================
// МОБИЛЬНОЕ МЕНЮ (второй сайт с бургером, если появится)
// ============================================================
function toggleMobileMenu() {
  const navRight = document.getElementById('navRight');
  const burger   = document.getElementById('navBurger');
  if (navRight) navRight.classList.toggle('open');
  if (burger)   burger.classList.toggle('open');
}

function closeMobileMenu() {
  const navRight = document.getElementById('navRight');
  const burger   = document.getElementById('navBurger');
  if (navRight) navRight.classList.remove('open');
  if (burger)   burger.classList.remove('open');
}

// ============================================================
// ПЛАВНЫЙ СКРОЛЛ
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ============================================================
// GOOGLE TRANSLATE INIT (для страниц, где используется)
// ============================================================
function googleTranslateElementInit() {
  if (typeof google === 'undefined') return;
  new google.translate.TranslateElement({
    pageLanguage: 'ru',
    includedLanguages: 'ru,uz,en',
    autoDisplay: false
  }, 'google_translate_element');
}

// ============================================================
// АВТО-ОПРЕДЕЛЕНИЕ ЯЗЫКА ПО IP (второй сайт)
// ============================================================
const NO_TRANSLATE = ['RU','UZ','KZ','KG','TJ','TM','BY','UA','AZ','AM','GE','MD'];
const COUNTRY_LANG = {
  US:'en', GB:'en', AU:'en', CA:'en', DE:'de', FR:'fr',
  CN:'zh-CN', JP:'ja', KR:'ko', SA:'ar', AE:'ar', TR:'tr',
  IN:'hi', IT:'it', ES:'es', PL:'pl', NL:'nl', BR:'pt'
};

async function autoTranslateByIP() {
  if (document.cookie.indexOf('googtrans') !== -1) return;
  if (sessionStorage.getItem('blc_auto_done')) return;
  try {
    const res  = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    const cc   = (data.country_code || '').toUpperCase();
    if (NO_TRANSLATE.includes(cc)) return;
    const lang = COUNTRY_LANG[cc];
    if (!lang) return;
    sessionStorage.setItem('blc_auto_done', '1');
    applyGoogleTranslate(lang);
  } catch(e) {}
}

function applyGoogleTranslate(langCode) {
  let waited = 0;
  const timer = setInterval(() => {
    waited += 150;
    const sel = document.querySelector('.goog-te-combo');
    if (sel) {
      clearInterval(timer);
      sel.value = langCode;
      sel.dispatchEvent(new Event('change'));
    } else if (waited >= 5000) {
      clearInterval(timer);
      document.cookie = 'googtrans=/ru/' + langCode + '; path=/';
    }
  }, 150);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  // Телефонные поля
  initAllPhoneInputs();

  // FAQ кнопки
  initFaqButtons();

  // Плавный скролл
  initSmoothScroll();

  // Устанавливаем язык (сохранённый или ru)
  setLang(currentLang);

  // Модальное окно — клик по оверлею
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }

  // Закрытие мобильного меню по клику вне
  document.addEventListener('click', function (e) {
    const nav = document.querySelector('nav');
    if (nav && !nav.contains(e.target)) closeMobileMenu();
  });

  // IP авто-перевод (только если включён Google Translate)
  if (document.getElementById('gte') || document.getElementById('google_translate_element')) {
    autoTranslateByIP();
  }
});
