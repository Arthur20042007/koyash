import sceneCleanse from '../../assets/quiz/skintype_cleanse.png';
import scenePore from '../../assets/quiz/skintype_pore.png';
import sceneHours from '../../assets/quiz/skintype_hours.png';
import sceneWeather from '../../assets/quiz/skintype_weather.png';
import sceneResult from '../../assets/quiz/skintype_result.png';

// Skin-type sub-quiz — Figma Prototype "Тип кожи для истории/короткой анкеты".
// 4 scored questions → the skin type with the most points is shown as the
// result, then returned to the main quiz's skin-type question (pre-selected).
// Each option's `value` is the skin type it scores a point for.
export const SKIN_QUESTIONS = [
  {
    id: 'sq1',
    type: 'single',
    note: 'После умывания кожа говорит о себе честнее всего.',
    noteBody:
      '— Первый шаг — понять, как кожа ведёт себя без крема и макияжа. Так мы увидим, чего ей не хватает: влаги, баланса или более мягкого ухода.',
    question: 'Что ты чувствуешь сразу после умывания?',
    options: [
      { label: 'Свежесть и комфорт', value: 'normal' },
      { label: 'Через короткое время появляется блеск', value: 'oily' },
      { label: 'Есть сухость и стянутость', value: 'dry' },
      { label: 'Щиплет, краснеет и зудит', value: 'sensitive' },
      { label: 'Щёки сухие, а Т-зона чувствует себя нормально', value: 'combination' },
    ],
    scene: sceneCleanse,
    fig: {
      scene: { x: 544, y: 106, w: 671, h: 671 },
      notePill: { x: 71, y: 115, w: 567 },
      narr: { x: 71, y: 180, w: 604 },
      head: { x: 71, y: 278, w: 660 },
      opts: { x: 77, y: 415, rowGap: 27 },
      back: { x: 53, y: 650 },
      next: { x: 432, y: 650 },
    },
  },
  {
    id: 'sq2',
    type: 'single',
    note: 'Зеркало замечает то, что мы часто пропускаем.',
    noteBody:
      '— Поры лучше рассматривать при дневном свете, без тонального средства и фильтров. Особенно обрати внимание на нос, лоб и область щёк.',
    question: 'Как выглядят поры на твоей коже?',
    options: [
      { label: 'Заметны по всему лицу', value: 'oily' },
      { label: 'Больше всего заметны в Т-зоне', value: 'combination' },
      { label: 'Почти незаметны', value: 'normal' },
      { label: 'Мелкие, но кожа кажется тонкой и сухой', value: 'dry' },
      { label: 'Иногда поры видны, но я не могу оценить точно', value: 'sensitive' },
    ],
    scene: scenePore,
    fig: {
      scene: { x: 664, y: 100, w: 630, h: 550 },
      notePill: { x: 71, y: 108, w: 567 },
      narr: { x: 71, y: 177, w: 558 },
      head: { x: 71, y: 293, w: 820 },
      opts: { x: 77, y: 400, rowGap: 27 },
      back: { x: 53, y: 650 },
      next: { x: 432, y: 650 },
    },
  },
  {
    id: 'sq3',
    type: 'single',
    note: 'Чистая кожа быстро подаёт сигналы о своих потребностях.',
    noteBody:
      '— Сразу после очищения можно понять, хватает ли коже влаги и насколько бережно подобран уход.',
    question: 'Что происходит через 2–3 часа после умывания?',
    options: [
      { label: 'Всё лицо начинает блестеть', value: 'oily' },
      { label: 'Блестит только лоб, нос и подбородок', value: 'combination' },
      { label: 'Кожа остаётся спокойной', value: 'normal' },
      { label: 'Появляется сухость или стянутость', value: 'dry' },
      { label: 'Кожа краснеет, щиплет или зудит', value: 'sensitive' },
    ],
    scene: sceneHours,
    fig: {
      scene: { x: 561, y: 67, w: 696, h: 696 },
      notePill: { x: 71, y: 111, w: 567 },
      narr: { x: 71, y: 183, w: 567 },
      head: { x: 71, y: 275, w: 660 },
      opts: { x: 77, y: 415, rowGap: 27 },
      back: { x: 53, y: 650 },
      next: { x: 432, y: 650 },
    },
  },
  {
    id: 'sq4',
    type: 'single',
    note: 'Чувствительность любит мягкость и спокойствие.',
    noteBody:
      '— Реакция на новые средства, ветер и холод помогает понять, есть ли у кожи склонность к чувствительности.',
    question: 'Как кожа реагирует на новый уход или погоду?',
    options: [
      { label: 'Часто краснеет, щиплет или быстро раздражается', value: 'sensitive' },
      { label: 'Иногда отвечает высыпаниями и жирным блеском', value: 'oily' },
      { label: 'Становится сухой, может шелушиться', value: 'dry' },
      { label: 'Обычно реагирует спокойно', value: 'normal' },
      { label: 'Щёки реагируют сильнее, чем Т-зона', value: 'combination' },
    ],
    scene: sceneWeather,
    fig: {
      scene: { x: 599, y: 120, w: 658, h: 549 },
      notePill: { x: 71, y: 120, w: 567 },
      narr: { x: 71, y: 191, w: 607 },
      head: { x: 71, y: 273, w: 660 },
      opts: { x: 77, y: 415, rowGap: 27 },
      back: { x: 53, y: 650 },
      next: { x: 432, y: 650 },
    },
  },
];

// result screens keyed by skin type
export const SKIN_RESULTS = {
  combination: {
    heading: 'Твой тип кожи — комбинированная',
    narr: '— По твоим ответам видно, что кожа сочетает разные потребности: в одних зонах ей нужен баланс, а в других — больше мягкости и увлажнения.',
    bullets: [
      'Т-зона может блестеть',
      'Щёки могут быть более сухими',
      'Коже нужен мягкий баланс без перегрузки',
    ],
    headW: 660,
  },
  oily: {
    heading: 'Твой тип кожи — жирная',
    narr: '— По твоим ответам видно, что кожа активно вырабатывает себум и быстрее начинает блестеть. Ей нужен уход, который помогает сохранить свежесть, не пересушивая и не нарушая баланс.',
    bullets: [
      'Кожа может быстро начинать блестеть',
      'Поры могут быть более заметными',
      'Важно мягко очищать и не перегружать кожу',
    ],
    headW: 489,
  },
  dry: {
    heading: 'Твой тип кожи — сухая',
    narr: '— По твоим ответам видно, что коже часто не хватает влаги и липидов. Ей особенно важны мягкость, питание и уход, который снимает стянутость и помогает удерживать увлажнение.',
    bullets: [
      'После умывания может появляться стянутость',
      'Кожа может шелушиться и казаться тонкой',
      'Нужен насыщенный, но деликатный уход',
    ],
    headW: 443,
  },
  sensitive: {
    heading: 'Твой тип кожи — чувствительная',
    narr: '— По твоим ответам видно, что кожа может остро реагировать на новые средства, погоду и активные компоненты. Ей нужен особенно бережный уход, который успокаивает и поддерживает защитный барьер.',
    bullets: [
      'Может появляться покраснение, щипание или зуд',
      'Кожа может быстро реагировать на внешние факторы',
      'Ей важны мягкость, спокойствие и защита',
    ],
    headW: 660,
  },
  normal: {
    heading: 'Твой тип кожи — нормальная',
    narr: '— По твоим ответам видно, что кожа в целом находится в хорошем балансе: ей хватает влаги, а реактивность и жирный блеск проявляются умеренно. Главная задача — поддерживать её естественное состояние.',
    bullets: [
      'Кожа чаще ощущается комфортной',
      'Блеск и сухость выражены умеренно',
      'Важно сохранять баланс и регулярность ухода',
    ],
    headW: 569,
  },
};

export const RESULT_SCENE = sceneResult;
export const RESULT_NOTE = 'Koyash проанализировал ответы.';

// tie-break priority when several types score equally
const PRIORITY = ['combination', 'oily', 'dry', 'sensitive', 'normal'];

export function scoreSkinType(answers) {
  const counts = {};
  Object.values(answers).forEach((v) => {
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  let best = null;
  let bestN = -1;
  PRIORITY.forEach((type) => {
    const n = counts[type] || 0;
    if (n > bestN) {
      bestN = n;
      best = type;
    }
  });
  return best || 'normal';
}
