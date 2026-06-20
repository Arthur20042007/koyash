import sceneAge from '../../assets/quiz/scene-age.png';
import sceneSkinType from '../../assets/quiz/scene-skin-type.png';
import sceneSpf from '../../assets/quiz/scene-spf.png.png';
import sceneIssues from '../../assets/quiz/scene-issues.png';
import sceneBudget from '../../assets/quiz/scene-budget.png';
import sceneCleanser from '../../assets/quiz/scene-cleanser.png';
import sceneAllergens from '../../assets/quiz/scene-allergens.png';
import sceneImportance from '../../assets/quiz/scene-importance.png';
import sceneActives from '../../assets/quiz/scene-actives.png';
import sceneExperience from '../../assets/quiz/scene-experience.png';
import sceneProblems from '../../assets/quiz/scene-problems.png';

// Every screen is laid out on the fixed 1280×750 Figma stage.
// `fig` holds the exact pixel geometry pulled from the Figma file so the
// React build matches the design 1:1. scene = {x,y,w,h}; content = {x,w}.

export const STEPS = [
  {
    id: 'age',
    disabled: true, // экран скрыт — убери эту строку, чтобы вернуть его
    type: 'input',
    questionStep: 1,
    note: 'Солнечный луч скользит по чашке с чаем.',
    noteBody:
      '— Большинство людей начинают замечать изменения кожи после 33. Но сам процесс начинается гораздо раньше: кожа постепенно медленнее восстанавливается и удерживает влагу. Поэтому возраст помогает мне понять, на какие механизмы стоит обратить внимание в первую очередь.',
    question: 'Сколько тебе лет?',
    placeholder: 'Введите возраст',
    scene: sceneAge,
    fig: { scene: { x: 11, y: 135, w: 670, h: 586 }, content: { x: 625, w: 585 }, headY: 415, fieldY: 517 },
  },
  {
    id: 'skin_type',
    disabled: true, // экран скрыт — убери эту строку, чтобы вернуть его
    type: 'single',
    questionStep: 2,
    note: 'Солнце подсвечивает маленькое зеркало на столе.',
    noteBody:
      '— Жирная кожа может быть обезвоженной, а сухая — одновременно чувствительной. Поэтому по ощущениям не всегда понятно, что ей действительно нужно. Чтобы не гадать и не советовать универсальные средства, сначала определим твой тип кожи.',
    question: 'Какая у тебя кожа?',
    options: [
      { label: 'Жирная — блестит, поры заметны', value: 'oily' },
      { label: 'Сухая — бывает стянутость, шелушение', value: 'dry' },
      { label: 'Комбинированная — Т-зона жирная, щёки сухие', value: 'combination' },
      { label: 'Нормальная — в целом всё хорошо', value: 'normal' },
      { label: 'Чувствительная — легко реагирует на новые средства', value: 'sensitive' },
      { label: 'Не знаю — не уверена', value: 'unknown' },
    ],
    scene: sceneSkinType,
    fig: { scene: { x: 630, y: 128, w: 596, h: 513 }, content: { x: 71, w: 545 }, headY: 360, optsY: 426 },
  },
  {
    id: 'tip_spf',
    type: 'tip',
    noteLabel: 'Вот тебе интересный факт',
    title: 'SPF — каждый день ♡',
    body: 'Даже если за окном облачно, ультрафиолет всё равно влияет на кожу. Крем с SPF 30–50 помогает защищать кожу от фотостарения, пигментации и поддерживать ровный тон.',
    highlight: 'Наноси SPF последним шагом утреннего ухода',
    scene: sceneSpf,
    fig: { scene: { x: 52, y: 167, w: 492, h: 515 }, content: { x: 627, w: 560 }, noteY: 181, titleY: 262, bodyY: 345, hiY: 497 },
  },
  {
    id: 'concerns',
    type: 'multi',
    max: 3,
    questionStep: 3,
    note: 'Солнечный луч листает открытую тетрадь с заметками.',
    noteBody:
      '— Кожа редко решает одну проблему. Например, обезвоженность может обострять жирный блеск, а воспаления — делать поры заметнее. Поэтому давай наметим сразу несколько задач: какой уход может быть наиболее полезным именно сейчас.',
    question: 'Выбери до трёх:',
    options: [
      { label: 'Акне и высыпания', value: 'acne' },
      { label: 'Жирный блеск', value: 'oiliness' },
      { label: 'Расширенные поры', value: 'pores' }, // → oiliness (см. CONCERN_MAP)
      { label: 'Сухость и шелушение', value: 'dryness' },
      { label: 'Пигментация и тёмные пятна', value: 'pigmentation' },
      { label: 'Морщины и потеря упругости', value: 'aging' },
      { label: 'Чувствительность и покраснение', value: 'sensitivity' },
      { label: 'Ничего конкретного — просто хочу базовый уход', value: null },
    ],
    scene: sceneIssues,
    fig: { scene: { x: 686, y: 140, w: 557, h: 557 }, content: { x: 71, w: 585 }, headY: 332, optsY: 384 },
  },
  {
    id: 'budget',
    type: 'single',
    questionStep: 4,
    note: 'Солнце мягко освещает стол, чашку и аккуратно разложенные баночки.',
    noteBody:
      '— Любопытно, что стоимость средства часто определяется не ингредиентами, а упаковкой, маркетингом и брендом. Один и тот же актив может встречаться и в аптечном креме, и в люксовом. Поэтому бюджет помогает мне сузить поиск, а не оценить качество ухода.',
    question: 'На сколько ориентируемся?',
    subQuestion: '(стоимость одной косметички, хватит на 2–3 месяца)',
    options: [
      { label: 'До 3 500 ₽ — бюджетно и практично', value: 'low' },
      { label: '3 500 – 8 000 ₽ — средний сегмент', value: 'mid' },
      { label: 'От 8 000 ₽ — готова к более дорогим средствам', value: 'high' },
    ],
    scene: sceneBudget,
    fig: { scene: { x: 530, y: 123, w: 785, h: 589 }, content: { x: 71, w: 445 }, headY: 398, subY: 450, optsY: 500 },
  },
  {
    id: 'tip_cleanser',
    type: 'tip',
    noteLabel: 'Вот тебе ещё один полезный совет',
    title: 'Очищение без скраба ♡',
    body: 'Слишком агрессивное очищение может нарушить защитный барьер кожи. Лучше выбирать мягкие средства, которые убирают загрязнения, но не оставляют ощущения стянутости.',
    highlight: 'Если после умывания хочется срочно нанести крем — очищение, скорее всего, слишком жёсткое',
    scene: sceneCleanser,
    fig: { scene: { x: 716, y: 168, w: 502, h: 537 }, content: { x: 71, w: 615 }, noteY: 181, titleY: 258, bodyY: 335, hiY: 475 },
  },
  {
    id: 'allergens',
    type: 'multi',
    questionStep: 5,
    note: 'Солнце медленно просматривает список ингредиентов в тетради.',
    noteBody:
      '— Большинство нежелательных реакций вызывает не сам уход, а отдельные компоненты в составе. Причём чувствительность может появиться даже к тому, что человек раньше спокойно использовал годами. Поэтому этот вопрос важно не пропустить.',
    question: 'Есть что-то, чего точно стоит избегать?',
    options: [
      { label: 'Отдушки', value: 'fragrance' },
      { label: 'Спирт в составе', value: 'alcohol' },
      { label: 'Силиконы', value: 'silicone' },
      { label: 'Кислоты (АНА/ВНА)', value: 'acid' },
      { label: 'Нет, аллергий нет', value: null },
    ],
    scene: sceneAllergens,
    fig: { scene: { x: 710, y: 265, w: 500, h: 500 }, content: { x: 71, w: 610 }, headY: 330, optsY: 405 },
  },
  {
    id: 'values',
    type: 'multi',
    questionStep: 6,
    note: 'На столе появляются разные баночки — минималистичные и не очень.',
    noteBody:
      '— Исследования показывают, что люди гораздо реже пропускают уход, если он состоит из небольшого количества простых шагов. Поэтому минимализм в уходе — это не лень, а то, к чему действительно стоит стремиться.',
    question: 'Что важно при выборе?',
    subQuestion: '(можно несколько)',
    options: [
      { label: 'Минимализм — только самое основное', value: 'minimalism' },
      { label: 'Веган', value: 'vegan' },
      { label: 'Без тестов на животных', value: 'cruelty_free' },
    ],
    scene: sceneImportance,
    fig: { scene: { x: 850, y: 248, w: 400, h: 500 }, content: { x: 71, w: 600 }, headY: 323, subY: 373, optsY: 430 },
  },
  {
    id: 'tip_actives',
    type: 'tip',
    noteLabel: 'Ещё один полезный совет по уходу',
    title: 'Активы — постепенно ♡',
    body: 'Ретинол, кислоты и витамин С лучше вводить не все сразу. Начинай с одного активного средства, используй его 2–3 раза в неделю и наблюдай за реакцией кожи.',
    highlight: 'Новые средства лучше тестировать по одному — так легче понять, что действительно подходит',
    scene: sceneActives,
    fig: { scene: { x: -57, y: 145, w: 682, h: 511 }, content: { x: 634, w: 560 }, noteY: 190, titleY: 268, bodyY: 345, hiY: 500 },
  },
  {
    id: 'experience',
    disabled: true, // экран скрыт — убери эту строку, чтобы вернуть его
    type: 'single',
    questionStep: 7,
    note: 'Солнечные лучи падают на полку с аккуратно расставленными баночками.',
    noteBody:
      '— Некоторые ингредиенты работают по принципу тренировки: например, к ретинолу или кислотам нужно время, чтобы привыкнуть. Поэтому один и тот же уход может быть отличным выбором для опытного человека и слишком активным для новичка.',
    question: 'Как давно занимаешься уходом?',
    options: [
      { label: 'Недавно начала — базовый уход или почти ничего', value: 'beginner' },
      { label: 'Уже разбираюсь — есть основной уход', value: 'intermediate' },
      { label: 'Давно и осознанно — читаю составы, знаю о чём к чему', value: 'expert' },
    ],
    scene: sceneExperience,
    fig: { scene: { x: 819, y: 290, w: 378, h: 472 }, content: { x: 71, w: 700 }, headY: 346, optsY: 444 },
  },
  {
    id: 'conditions',
    disabled: true, // экран скрыт — убери эту строку, чтобы вернуть его
    type: 'multi',
    questionStep: 8,
    note: 'Солнце становится мягче и внимательнее, будто прикрывает свет.',
    noteBody:
      '— И последнее. Иногда коже нужен особый подход, и тогда я должна быть осторожнее в рекомендациях.',
    question: 'Есть ли что-то из этого?',
    options: [
      { label: 'Беременность или кормление', value: 'pregnancy' },
      { label: 'Розацеа или купероз', value: 'rosacea' },
      { label: 'Дерматит или псориаз', value: 'dermatitis' },
      { label: 'Ничего из перечисленного', value: null },
    ],
    scene: sceneProblems,
    fig: { scene: { x: 689, y: 138, w: 503, h: 629 }, content: { x: 71, w: 600 }, headY: 346, optsY: 430 },
  },
];

// Only the screens that aren't disabled are actually shown. The progress bar
// and step counting derive from this list, so hiding a screen (disabled: true)
// never breaks numbering or navigation.
export const ALL_STEPS = STEPS;
export const ACTIVE_STEPS = STEPS.filter((s) => !s.disabled);
export const TOTAL_QUESTION_STEPS = ACTIVE_STEPS.filter((s) => s.questionStep).length;

// UI concern values that need remapping to a backend canonical tag.
// Backend tags: acne, oiliness, pigmentation, aging, dryness, sensitivity.
const CONCERN_MAP = {
  pores: 'oiliness', // расширенные поры лечим как жирность
};

// Allergen presets expand to the exact tokens stored in products.allergens_norm,
// because the backend filter matches whole tokens (case-insensitive), not substrings.
const ALLERGEN_TOKENS = {
  fragrance: ['Fragrance'],
  alcohol: ['Alcohol', 'Alcohol Denat.', 'Benzyl Alcohol', 'Dichlorobenzyl Alcohol', 't-Butyl Alcohol'],
  silicone: [
    'Silicones', 'Dimethicone', 'Cyclopentasiloxane', 'Cyclotetrasiloxane',
    'Vinyl Dimethicone', 'Methyl Trimethicone', 'Caprylyl Methicone', 'Phenyl Trimethicone',
  ],
  acid: ['AHA+BHA', 'Glycolic Acid', 'Lactic Acid', 'Salicylic Acid', 'Mandelic Acid', 'Capryloyl Salicylic Acid'],
};

export function buildRequest(answers) {
  const concerns = [
    ...new Set((answers.concerns || []).filter(Boolean).map((c) => CONCERN_MAP[c] || c)),
  ];
  const allergens = [
    ...new Set((answers.allergens || []).filter(Boolean).flatMap((a) => ALLERGEN_TOKENS[a] || [a])),
  ];
  const values = answers.values || [];
  return {
    budget: answers.budget || 'low',
    concerns,
    vegan: values.includes('vegan'),
    cruelty_free: values.includes('cruelty_free'),
    minimalism: values.includes('minimalism'),
    allergens,
  };
}
