// قائمة الهاتف، الظهور التدريجي، والتحقق من نموذج التواصل.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (menuButton && nav) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const form = document.querySelector('#contact-form');
if (form) {
  const status = form.querySelector('.form-status');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isEnglish = document.documentElement.lang === 'en';
  const messages = isEnglish ? {
    name: 'Please enter your name (at least 2 characters).',
    email: 'Please enter a valid email address.',
    subject: 'Please add a subject.',
    message: 'Please write a message (at least 10 characters).'
  } : {
    name: 'يرجى إدخال الاسم (حرفان على الأقل).',
    email: 'يرجى إدخال بريد إلكتروني صحيح.',
    subject: 'يرجى إدخال عنوان للرسالة.',
    message: 'يرجى كتابة رسالة من 10 أحرف على الأقل.'
  };
  const validate = field => {
    const value = field.value.trim();
    let valid = value.length > 0;
    if (field.name === 'name') valid = value.length >= 2;
    if (field.name === 'email') valid = emailPattern.test(value);
    if (field.name === 'message') valid = value.length >= 10;
    const error = field.closest('.field').querySelector('.field-error');
    field.setAttribute('aria-invalid', String(!valid));
    error.textContent = valid ? '' : messages[field.name];
    return valid;
  };
  form.querySelectorAll('[data-validate]').forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
      if (status.dataset.state) { status.textContent = ''; status.removeAttribute('data-state'); }
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('[data-validate]')];
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      status.textContent = isEnglish ? 'Please review the highlighted fields and try again.' : 'يرجى مراجعة الحقول المحددة والمحاولة مرة أخرى.';
      status.dataset.state = 'error';
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    status.textContent = isEnglish
      ? 'Your details are valid. Connect a form service to start receiving messages.'
      : 'تم التحقق من البيانات. لبدء استقبال الرسائل، يلزم ربط النموذج بخدمة إرسال.';
    status.dataset.state = 'success';
  });
}

// BMI is shown as an adult screening reference only; it is not a prescribed target.
const goalCalculator = document.querySelector('#goal-calculator-form');
if (goalCalculator) {
  const result = document.querySelector('#goal-calculator-result');
  const bmiValue = result.querySelector('[data-bmi-value]');
  const bmiCategory = result.querySelector('[data-bmi-category]');
  const weightRange = result.querySelector('[data-weight-range]');
  const goalGuidance = result.querySelector('[data-goal-guidance]');
  const english = document.documentElement.lang === 'en';

  goalCalculator.addEventListener('submit', event => {
    event.preventDefault();
    if (!goalCalculator.reportValidity()) return;

    const age = Number(goalCalculator.elements.age.value);
    const weight = Number(goalCalculator.elements.weight.value);
    const heightCm = Number(goalCalculator.elements.height.value);
    const goal = goalCalculator.elements.goal.value;

    result.hidden = false;
    if (age < 20) {
      bmiValue.textContent = english ? 'Not calculated' : 'لا يُحسب';
      bmiCategory.textContent = english ? 'Adults 20+' : 'للبالغين 20+';
      weightRange.textContent = english
        ? 'This calculator uses adult BMI references and is not designed for people under 20.'
        : 'هذه الحاسبة تستخدم مراجع BMI للبالغين وليست مخصصة لمن هم دون 20 عامًا.';
      goalGuidance.textContent = english
        ? 'BMI for younger people uses age-specific growth references. Ask a healthcare professional for an appropriate assessment.'
        : 'يُقيّم BMI للأعمار الأصغر باستخدام مراجع نمو خاصة بالعمر. ويُنصح باستشارة مختص صحي لإجراء تقييم مناسب.';
      return;
    }

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const category = bmi < 18.5
      ? (english ? 'Below adult reference range' : 'أقل من النطاق المرجعي للبالغين')
      : bmi < 25
        ? (english ? 'Within adult reference range' : 'ضمن النطاق المرجعي للبالغين')
        : bmi < 30
          ? (english ? 'Above adult reference range' : 'أعلى من النطاق المرجعي للبالغين')
          : (english ? 'Higher BMI screening range' : 'ضمن نطاق BMI المرتفع للفرز');

    bmiValue.textContent = bmi.toFixed(1);
    bmiCategory.textContent = category;
    const low = (18.5 * heightM * heightM).toFixed(1);
    const high = (24.9 * heightM * heightM).toFixed(1);
    weightRange.textContent = english
      ? `For your height, the adult BMI reference interval corresponds roughly to ${low}–${high} kg. This is a population reference, not your personal target.`
      : `لطولك، يعادل نطاق BMI المرجعي للبالغين وزنًا تقريبيًا ${low}–${high} كجم. هذا نطاق مرجعي عام وليس هدفك الشخصي.`;

    const guidance = {
      muscle: english
        ? 'For muscle gain, BMI cannot separate muscle from fat. Track strength and how you feel; a coach can tailor training and a dietitian can help with food needs.'
        : 'لبناء العضلات، لا يميّز BMI بين العضلات والدهون. يمكن متابعة مؤشرات القوة والشعور العام، مع الاستعانة بالمدرب لضبط التدريب واختصاصي التغذية للإرشاد الغذائي.',
      gain: english
        ? 'For weight gain, use a gradual, personalized approach. If your weight is low or changed without trying, discuss it with a healthcare professional.'
        : 'لزيادة الوزن، يُفضّل اتباع نهج تدريجي وشخصي. عند انخفاض الوزن أو تغيّره دون قصد، يُنصح بمناقشة ذلك مع مختص صحي.',
      'fat-loss': english
        ? 'BMI is only a screening measure. Avoid crash diets; if weight loss is appropriate for you, set a gradual plan with a qualified professional.'
        : 'BMI أداة فرز فقط. يُنصح بتجنب الحميات القاسية؛ وإذا كان خفض الوزن مناسبًا، يمكن وضع خطة تدريجية مع مختص مؤهل.',
      maintain: english
        ? 'For maintenance, focus on sustainable activity, sleep and varied meals. You do not need to change your weight just to reach a BMI number.'
        : 'للثبات، يُنصح بحركة منتظمة ونوم جيد ووجبات متنوعة؛ ولا تستدعي قراءة BMI وحدها تغيير الوزن.'
    };
    goalGuidance.textContent = guidance[goal];
  });
}

const goalMealOptions = english => english ? {
    muscle: [
      { title: 'Breakfast', text: 'Oats with milk or yogurt and fruit, with eggs or beans as a protein option.' },
      { title: 'Lunch', text: 'Chicken, fish, eggs or legumes with rice, bulgur or potatoes and vegetables.' },
      { title: 'Snack', text: 'Yogurt or milk with fruit; nuts can be added if suitable.' },
      { title: 'Dinner', text: 'Tuna, eggs, cheese or lentils with wholegrain bread and salad.' }
    ],
    gain: [
      { title: 'Breakfast', text: 'Oats with milk, banana and tahini or nut butter, if suitable.' },
      { title: 'Lunch', text: 'Chicken, fish or legumes with rice or potatoes, vegetables and a source of healthy fats.' },
      { title: 'Snack', text: 'Yogurt with fruit and nuts, or a cheese sandwich.' },
      { title: 'Dinner', text: 'Eggs, beans or cheese with bread, vegetables and yogurt.' }
    ],
    'fat-loss': [
      { title: 'Breakfast', text: 'Eggs or beans with wholegrain bread, vegetables and a piece of fruit.' },
      { title: 'Lunch', text: 'Chicken, fish or lentils with vegetables, salad and a grain or potato.' },
      { title: 'Snack', text: 'Fruit with yogurt, or vegetables with hummus.' },
      { title: 'Dinner', text: 'Lentil soup, tuna or eggs with salad and bread.' }
    ],
    maintain: [
      { title: 'Breakfast', text: 'Eggs or yogurt with oats or bread, vegetables and fruit.' },
      { title: 'Lunch', text: 'Fish, chicken, beans or lentils with rice or potatoes and vegetables.' },
      { title: 'Snack', text: 'Fruit, yogurt or a small handful of nuts.' },
      { title: 'Dinner', text: 'Cheese, beans, tuna or eggs with bread and salad.' }
    ]
  } : {
    muscle: [
      { title: 'الإفطار', text: 'شوفان بالحليب أو الزبادي مع فاكهة، مع البيض أو الفول كمصدر للبروتين.' },
      { title: 'الغداء', text: 'دجاج أو سمك أو بيض أو بقول، مع أرز أو برغل أو بطاطس وخضار.' },
      { title: 'وجبة خفيفة', text: 'زبادي أو حليب مع فاكهة؛ ويمكن إضافة المكسرات عند ملاءمتها.' },
      { title: 'العشاء', text: 'تونة أو بيض أو جبن أو عدس، مع خبز من الحبوب الكاملة وسلطة.' }
    ],
    gain: [
      { title: 'الإفطار', text: 'شوفان بالحليب مع موز وطحينة أو زبدة مكسرات، عند ملاءمتها.' },
      { title: 'الغداء', text: 'دجاج أو سمك أو بقول، مع أرز أو بطاطس وخضار ومصدر للدهون غير المشبعة.' },
      { title: 'وجبة خفيفة', text: 'زبادي مع فاكهة ومكسرات، أو ساندويتش جبن.' },
      { title: 'العشاء', text: 'بيض أو فول أو جبن، مع خبز وخضار وزبادي.' }
    ],
    'fat-loss': [
      { title: 'الإفطار', text: 'بيض أو فول مع خبز من الحبوب الكاملة وخضار وقطعة فاكهة.' },
      { title: 'الغداء', text: 'دجاج أو سمك أو عدس، مع خضار وسلطة ومصدر نشويات مثل الأرز أو البطاطس.' },
      { title: 'وجبة خفيفة', text: 'فاكهة مع زبادي، أو خضار مع حمص.' },
      { title: 'العشاء', text: 'شوربة عدس أو تونة أو بيض، مع سلطة وخبز.' }
    ],
    maintain: [
      { title: 'الإفطار', text: 'بيض أو زبادي مع شوفان أو خبز وخضار وفاكهة.' },
      { title: 'الغداء', text: 'سمك أو دجاج أو فاصوليا أو عدس، مع أرز أو بطاطس وخضار.' },
      { title: 'وجبة خفيفة', text: 'فاكهة أو زبادي أو كمية صغيرة من المكسرات.' },
      { title: 'العشاء', text: 'جبن أو فول أو تونة أو بيض، مع خبز وسلطة.' }
    ]
  };

// Turn the home-page profile into a goal-focused schedule without sending or saving personal details.
const homePlanner = document.querySelector('#home-goal-planner');
if (homePlanner) {
  const english = document.documentElement.lang === 'en';
  const result = document.querySelector('#personal-plan');
  const summary = document.querySelector('#profile-summary');
  const daysHost = document.querySelector('#personal-plan-days');
  const bmiNote = document.querySelector('#planner-bmi-note');
  const mealSection = document.querySelector('#personal-meals');
  const mealCardsHost = document.querySelector('#personal-meal-cards');
  const error = document.querySelector('#planner-error');
  const sprite = english ? '../assets/exercise-illustrations.svg' : 'assets/exercise-illustrations.svg';
  const labels = {
    goals: {
      muscle: english ? 'Build muscle' : 'بناء عضل',
      gain: english ? 'Gain weight' : 'زيادة وزن',
      'fat-loss': english ? 'Lose fat' : 'خسارة دهون',
      maintain: english ? 'Maintain fitness' : 'ثبات ولياقة'
    },
    tracks: {
      women: english ? '3-day full-body schedule' : 'جسم كامل · 3 أيام',
      men: english ? '4-day upper/lower schedule' : 'علوي وسفلي · 4 أيام'
    },
    levels: {
      beginner: english ? 'Beginner' : 'مستوى مبدئي',
      intermediate: english ? 'Intermediate' : 'مستوى متوسط',
      advanced: english ? 'Advanced' : 'مستوى متقدم'
    },
    bmi: english
      ? ['Below the adult reference range', 'Within the adult reference range', 'Above the adult reference range', 'Higher adult BMI screening range']
      : ['أقل من النطاق المرجعي للبالغين', 'ضمن النطاق المرجعي للبالغين', 'أعلى من النطاق المرجعي للبالغين', 'ضمن نطاق BMI المرتفع للفرز']
  };


  const mealIdeas = goalMealOptions(english);

  const moves = {
    squat: {
      symbol: 'squat', ar: 'سكوات بوزن الجسم', en: 'Bodyweight squat',
      tipAr: 'يُنفذ السكوات بمدى مريح مع توجيه الركبتين باتجاه القدمين.', tipEn: 'Use a comfortable range and keep your knees aligned with your feet.',
      video: 'https://players.brightcove.net/79855382001/EkC1XU82e_default/index.html?videoId=1763919389001', source: 'NHS'
    },
    sit: {
      symbol: 'sit-to-stand', ar: 'جلوس وقيام من كرسي', en: 'Chair sit-to-stand',
      tipAr: 'يُستخدم كرسي ثابت مع النهوض والجلوس ببطء وتحكم.', tipEn: 'Use a stable chair and stand up and sit down slowly with control.',
      video: 'https://players.brightcove.net/79855382001/EkC1XU82e_default/index.html?videoId=1763916272001', source: 'NHS'
    },
    push: {
      symbol: 'wall-pushup', ar: 'ضغط على الحائط', en: 'Wall push-up',
      tipAr: 'تساعد الحركة على الحفاظ على استقامة الجسم مع تقريب الصدر من الحائط.', tipEn: 'Keep your body in a straight line and lower your chest toward the wall.',
      video: 'https://players.brightcove.net/79855382001/EkC1XU82e_default/index.html?videoId=1763919379001', source: 'NHS'
    },
    bridge: {
      symbol: 'bridge', ar: 'جسر الحوض', en: 'Glute bridge',
      tipAr: 'يُرفع الحوض بسلاسة مع إبقاء القدمين والكتفين على الأرض.', tipEn: 'Lift your hips smoothly while keeping your feet and shoulders on the floor.',
      video: 'https://www.youtube-nocookie.com/embed/PPNCe7nX3Fc', source: 'NHFT'
    },
    lunge: {
      symbol: 'lunge', ar: 'اندفاع خلفي مدعوم', en: 'Supported reverse lunge',
      tipAr: 'تُستخدم خطوة قصيرة للخلف، مع الاستناد إلى كرسي للتوازن عند الحاجة.', tipEn: 'Take a short step back and hold a chair for balance if needed.',
      video: 'https://www.youtube-nocookie.com/embed/UVuoO1OtZCs', source: 'Barts Health'
    },
    row: {
      symbol: 'row', ar: 'سحب حقيبة أو زجاجات ماء', en: 'Backpack or water-bottle row',
      tipAr: 'تُستخدم مقاومة خفيفة وآمنة مع الحفاظ على ثبات الظهر والتحكم بالحركة.', tipEn: 'Use a light, secure load and keep your back steady as you move.',
      video: 'https://player.vimeo.com/video/230718413', source: 'Physitrack'
    },
    hinge: {
      symbol: 'hinge', ar: 'مفصل الورك (Hip hinge)', en: 'Hip hinge',
      tipAr: 'تُدفع الوركان للخلف مع ثبات الظهر، ويمكن البدء دون أوزان.', tipEn: 'Push your hips back with a steady back; start without added weight.',
      video: 'https://www.youtube-nocookie.com/embed/1jjrOWwbCOo', source: 'Barts Health'
    }
  };

  const routines = {
    women: [
      { ar: 'اليوم الأول · جسم كامل A', en: 'Day 1 · Full body A', moves: ['squat', 'push', 'bridge', 'row'] },
      { ar: 'اليوم الثاني · جسم كامل B', en: 'Day 2 · Full body B', moves: ['sit', 'lunge', 'push', 'row'] },
      { ar: 'اليوم الثالث · جسم كامل C', en: 'Day 3 · Full body C', moves: ['squat', 'hinge', 'bridge', 'push'] }
    ],
    men: [
      { ar: 'اليوم الأول · علوي A', en: 'Day 1 · Upper A', moves: ['push', 'row'] },
      { ar: 'اليوم الثاني · سفلي A', en: 'Day 2 · Lower A', moves: ['squat', 'hinge', 'bridge', 'sit'] },
      { ar: 'اليوم الثالث · علوي B', en: 'Day 3 · Upper B', moves: ['row', 'push'] },
      { ar: 'اليوم الرابع · سفلي B', en: 'Day 4 · Lower B', moves: ['lunge', 'sit', 'hinge', 'bridge'] }
    ]
  };

  const foodNotes = {
    muscle: english
      ? 'Pair consistent strength training with varied meals and protein-containing foods. A registered dietitian can personalize food guidance.'
      : 'يُستحسن دعم تمارين القوة المنتظمة بوجبات متنوعة تتضمن مصادر للبروتين. ويمكن لاختصاصي تغذية تقديم إرشادات ملائمة.',
    gain: english
      ? 'Choose regular, varied meals and build strength gradually. If you are underweight or losing weight without trying, speak with a healthcare professional.'
      : 'تساعد الوجبات المنتظمة والمتنوعة مع تمارين القوة المتدرجة على دعم هذا الهدف. عند انخفاض الوزن أو تراجعه دون قصد، يُنصح باستشارة مختص صحي.',
    'fat-loss': english
      ? 'Focus on sustainable movement and balanced meals; avoid crash diets. A qualified dietitian can help set a safe personal approach.'
      : 'يُستحسن التركيز على الحركة المنتظمة والوجبات المتوازنة وتجنب الحميات القاسية. ويمكن لاختصاصي تغذية مؤهل المساعدة في وضع نهج مناسب.',
    maintain: english
      ? 'Keep a routine you can sustain, with varied meals, regular movement and enough recovery.'
      : 'يساعد الروتين القابل للاستمرار، مع تنوع الوجبات والحركة المنتظمة والتعافي الكافي، على الحفاظ على اللياقة.'
  };

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const addProfileItem = (label, value) => {
    const item = make('div', 'profile-item');
    item.append(make('span', '', label), make('strong', '', value));
    summary.append(item);
  };

  const makeExercise = (key, index, sets, reps) => {
    const move = moves[key];
    const card = make('article', 'personal-exercise');
    const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    art.setAttribute('class', 'plan-exercise-art');
    art.setAttribute('viewBox', '0 0 320 180');
    art.setAttribute('role', 'img');
    art.setAttribute('aria-label', english ? `${move.en} illustration` : `رسم توضيحي: ${move.ar}`);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `${sprite}#${move.symbol}`);
    art.append(use);

    const content = make('div', 'personal-exercise-content');
    const title = make('h4', '', english ? move.en : move.ar);
    const tip = make('p', 'exercise-tip', english ? move.tipEn : move.tipAr);
    const dose = make('div', 'exercise-dose');
    dose.append(make('span', '', english ? `${sets} sets` : `${sets} مجموعات`), make('span', '', `${reps} ${english ? 'reps' : 'تكرار'}`));
    const details = document.createElement('details');
    details.className = 'exercise-video-details';
    const summaryLine = make('summary', '', english ? '▶ Watch movement video' : '▶ مشاهدة الفيديو التوضيحي');
    const videoWrap = make('div', 'planner-video-wrap');
    details.append(summaryLine, videoWrap);
    details.addEventListener('toggle', () => {
      if (!details.open || details.dataset.loaded) return;
      const frame = document.createElement('iframe');
      frame.src = move.video;
      frame.title = english ? `${move.en} demonstration` : `شرح حركة ${move.ar}`;
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      videoWrap.append(frame);
      const source = make('a', 'planner-video-source', english ? `Open video source · ${move.source} ↗` : `مصدر الفيديو · ${move.source} ↗`);
      source.href = move.video.replace('/embed/', '/watch?v=');
      if (move.source === 'NHS') source.href = 'https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/';
      if (move.source === 'Physitrack') source.href = 'https://player.vimeo.com/video/230718413';
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      videoWrap.append(source);
      details.dataset.loaded = 'true';
    });

    content.append(title, tip, dose, details);
    card.append(art, content);
    return card;
  };

  const renderPlan = ({ age, weight, height, gender, goal, level }) => {
    const sets = age < 18 ? 2 : level === 'beginner' ? 2 : level === 'intermediate' ? 3 : goal === 'maintain' ? 3 : 4;
    const reps = goal === 'fat-loss' ? '10–15' : '8–12';
    const trackName = labels.tracks[gender];
    document.querySelector('#personal-plan-subtitle').textContent = english
      ? `${labels.goals[goal]} · ${trackName}. Start with a light, comfortable resistance and focus on form.`
      : `${labels.goals[goal]} · ${trackName}. تكون البداية بمقاومة خفيفة ومريحة، مع التركيز على جودة الحركة.`;

    summary.replaceChildren();
    const heightM = height / 100;
    const bmi = age >= 20 ? weight / (heightM * heightM) : null;
    const categoryIndex = bmi === null ? null : bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;
    addProfileItem(english ? 'Age' : 'العمر', `${age} ${english ? 'years' : 'سنة'}`);
    addProfileItem(english ? 'Sex' : 'الجنس', gender === 'women' ? (english ? 'Female' : 'أنثى') : (english ? 'Male' : 'ذكر'));
    addProfileItem(english ? 'Weight' : 'الوزن', `${weight} ${english ? 'kg' : 'كجم'}`);
    addProfileItem(english ? 'Height' : 'الطول', `${height} ${english ? 'cm' : 'سم'}`);
    addProfileItem(english ? 'Goal' : 'الهدف', labels.goals[goal]);
    addProfileItem(english ? 'Training level' : 'مستوى التدريب', labels.levels[level]);
    addProfileItem(english ? 'Schedule' : 'التقسيمة', trackName);
    addProfileItem(english ? 'BMI reference' : 'مؤشر BMI', bmi === null ? (english ? 'Not calculated under 20' : 'لا يُحسب دون 20 عامًا') : `${bmi.toFixed(1)} · ${labels.bmi[categoryIndex]}`);

    if (age >= 20) {
      bmiNote.textContent = english
        ? `Adult BMI screening reference: ${bmi.toFixed(1)} · ${labels.bmi[categoryIndex]}. BMI is a screening measure only; it does not set a target weight or diagnose health.`
        : `مؤشر كتلة الجسم المرجعي للبالغين: ${bmi.toFixed(1)} · ${labels.bmi[categoryIndex]}. المؤشر أداة فرز عامة فقط، ولا يحدد وزنًا مستهدفًا أو يشخّص حالة صحية.`;
    } else {
      bmiNote.textContent = english
        ? 'BMI is not calculated here for people under 20. BMI references for this age group use age- and sex-specific growth charts; this workout schedule is a general example.'
        : 'لا نحسب BMI لمن هم دون 20 عامًا؛ فمراجعه لهذه المرحلة تعتمد مخططات نمو خاصة بالعمر والجنس. جدول التمارين هنا نموذج عام.';
    }
    const bmiReference = make('a', 'planner-bmi-link', age >= 20
      ? (english ? 'CDC adult BMI categories ↗' : 'مرجع تصنيفات BMI للبالغين — CDC ↗')
      : (english ? 'CDC child and teen BMI reference ↗' : 'مرجع BMI للأطفال والمراهقين — CDC ↗'));
    bmiReference.href = age >= 20
      ? 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html'
      : 'https://www.cdc.gov/bmi/child-teen-calculator/';
    bmiReference.target = '_blank';
    bmiReference.rel = 'noopener noreferrer';
    bmiNote.append(document.createElement('br'), bmiReference);

    daysHost.replaceChildren();
    routines[gender].forEach((day, index) => {
      const section = make('section', 'personal-day-card');
      const header = make('div', 'personal-day-heading');
      header.append(make('span', 'day-number', String(index + 1).padStart(2, '0')), make('h3', '', english ? day.en : day.ar));
      const sub = make('p', '', english ? 'Rest at least one day between sessions when possible.' : 'يُفضّل ترك يوم راحة على الأقل بين الجلسات متى أمكن.');
      const list = make('div', 'personal-exercise-list');
      day.moves.forEach((key, moveIndex) => list.append(makeExercise(key, moveIndex, sets, reps)));
      section.append(header, sub, list);
      daysHost.append(section);
    });
    document.querySelector('#goal-food-guidance').textContent = foodNotes[goal];
    const mealSummary = document.querySelector('#meal-plan-summary');
    const mealNote = document.querySelector('#meal-personal-note');
    mealSummary.textContent = english
      ? `${labels.goals[goal]} · Current measurements: ${weight} kg and ${height} cm${bmi === null ? '. Adult BMI is not used under age 20.' : ` · BMI ${bmi.toFixed(1)} (${labels.bmi[categoryIndex]}).`}`
      : `الهدف: ${labels.goals[goal]} · الوزن الحالي: ${weight} كجم · الطول: ${height} سم${bmi === null ? ' · لا يُستخدم مرجع BMI للبالغين دون 20 عامًا.' : ` · BMI: ${bmi.toFixed(1)} (${labels.bmi[categoryIndex]}).`}`;
    mealCardsHost.replaceChildren();
    mealIdeas[goal].forEach(idea => {
      const card = make('article', 'nutrition-card personal-meal-card');
      card.append(make('span', 'plan-tag', labels.goals[goal]), make('h3', '', idea.title), make('p', '', idea.text));
      mealCardsHost.append(card);
    });
    mealNote.textContent = age < 18
      ? (english ? 'For anyone under 18, food needs change during growth. These are broad examples only; involve a parent or guardian and a qualified healthcare or nutrition professional.' : 'للأعمار دون 18 عامًا، تختلف الاحتياجات خلال النمو. هذه أمثلة عامة فقط، ويُنصح بإشراك ولي أمر ومختص صحي أو اختصاصي تغذية.')
      : (english ? 'Weight, height and BMI are shown for context. BMI is a screening reference only; weight and height alone are not enough to prescribe calorie targets or exact portions. Adjust food choices to appetite, activity, health needs and professional guidance.' : 'تظهر بيانات الوزن والطول ومؤشر BMI للسياق العام. BMI مرجع فرز فقط؛ والوزن والطول وحدهما لا يكفيان لتحديد سعرات أو حصص دقيقة. تُضبط الخيارات وفق الشهية والنشاط والحالة الصحية وإرشاد المختص عند الحاجة.');
    mealSection.hidden = false;
    result.hidden = false;
  };

  homePlanner.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    if (!homePlanner.reportValidity()) return;
    const form = homePlanner.elements;
    const profile = {
      age: Number(form.age.value), weight: Number(form.weight.value), height: Number(form.height.value),
      gender: form.gender.value, goal: form.goal.value, level: form.level.value
    };
    renderPlan(profile);
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelector('#edit-plan').addEventListener('click', () => {
    document.querySelector('#goal-planner').scrollIntoView({ behavior: 'smooth', block: 'center' });
    homePlanner.elements.age.focus({ preventScroll: true });
  });
}

const nutritionGoalSelect = document.querySelector('#nutrition-goal');
if (nutritionGoalSelect) {
  const english = document.documentElement.lang === 'en';
  const mealIdeas = goalMealOptions(english);
  const cardsHost = document.querySelector('#goal-meal-cards');
  const note = document.querySelector('#nutrition-goal-note');
  const labels = english
    ? { muscle: 'Build muscle', gain: 'Gain weight', 'fat-loss': 'Lose fat', maintain: 'Maintain fitness' }
    : { muscle: 'بناء العضلات', gain: 'زيادة الوزن', 'fat-loss': 'خسارة الدهون', maintain: 'الثبات واللياقة' };
  const guidance = english ? {
    muscle: 'These examples pair a protein source with carbohydrates and vegetables to support strength training. Adjust portions to appetite and activity.',
    gain: 'Regular meals and optional energy-dense additions can support this goal. Unintended weight loss should be discussed with a health professional.',
    'fat-loss': 'These examples emphasize filling meals with vegetables and a protein source, without strict diets or preset calorie targets.',
    maintain: 'Balanced options can be swapped to suit preferences, routine and activity.'
  } : {
    muscle: 'تجمع هذه الأمثلة بين مصدر بروتين ونشويات وخضار لدعم تمارين القوة. تُضبط الكميات وفق الشهية والنشاط.',
    gain: 'يمكن للوجبات المنتظمة وإضافات مغذية أعلى بالطاقة دعم هذا الهدف. يُنصح بمراجعة مختص عند انخفاض الوزن دون قصد.',
    'fat-loss': 'تركز هذه الأمثلة على وجبات مشبعة تضم خضارًا ومصدرًا للبروتين، دون حميات قاسية أو سعرات محددة مسبقًا.',
    maintain: 'خيارات متوازنة قابلة للتبديل حسب التفضيلات والروتين ومستوى النشاط.'
  };
  const renderGoalMeals = () => {
    const goal = nutritionGoalSelect.value;
    cardsHost.replaceChildren();
    mealIdeas[goal].forEach(idea => {
      const card = document.createElement('article');
      card.className = 'nutrition-card personal-meal-card';
      const tag = document.createElement('span');
      tag.className = 'plan-tag';
      tag.textContent = labels[goal];
      const title = document.createElement('h3');
      title.textContent = idea.title;
      const description = document.createElement('p');
      description.textContent = idea.text;
      card.append(tag, title, description);
      cardsHost.append(card);
    });
    note.textContent = guidance[goal];
  };
  nutritionGoalSelect.addEventListener('change', renderGoalMeals);
  renderGoalMeals();
}

