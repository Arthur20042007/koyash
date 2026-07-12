// Russian labels for the raw profile enum values stored by the backend
// (mirrors the option lists in ../Quiz/quizConfig.js). Used to render the
// profile card in the personal cabinet.

export const SKIN_TYPE = {
  oily: 'Жирная',
  dry: 'Сухая',
  combination: 'Комбинированная',
  normal: 'Нормальная',
  sensitive: 'Чувствительная',
};

export const CONCERNS = {
  acne: 'Акне и высыпания',
  aging: 'Морщины и потеря упругости',
  oiliness: 'Жирный блеск',
  pigmentation: 'Пигментация и неровный тон',
  dryness: 'Сухость и шелушение',
  sensitivity: 'Чувствительность и покраснения',
  pores: 'Расширенные поры',
};

export const BUDGET = {
  low: 'Бюджетно',
  mid: 'Средний',
  high: 'Премиум',
};

export const ALLERGENS = {
  fragrance: 'Отдушки',
  alcohol: 'Спирт в составе',
  silicone: 'Силиконы',
  acid: 'Кислоты (AHA/BHA)',
};

export const CONDITIONS = {
  pregnancy: 'Беременность',
  rosacea: 'Розацеа или купероз',
  dermatitis: 'Дерматит или псориаз',
};

const joinLabels = (values, dict) =>
  (values || [])
    .filter(Boolean)
    .map((v) => dict[v] || v)
    .join(', ');

// Turn a ProfileOut payload into the label rows shown in the profile card.
export function profileRows(profile) {
  if (!profile) return [];
  const prefs = [];
  if (profile.minimalism) prefs.push('Минимализм');
  if (profile.vegan) prefs.push('Веган');
  if (profile.cruelty_free) prefs.push('Без тестов на животных');

  return [
    { label: 'Возраст', value: profile.age ? `${profile.age} лет` : '—' },
    { label: 'Тип кожи', value: SKIN_TYPE[profile.skin_type] || '—' },
    { label: 'Проблемы', value: joinLabels(profile.concerns, CONCERNS) || 'Нет' },
    { label: 'Аллергии', value: joinLabels(profile.allergens, ALLERGENS) || 'Нет' },
    { label: 'Бюджет', value: BUDGET[profile.budget] || '—' },
    { label: 'Предпочтения', value: prefs.join(', ') || 'Нет' },
    { label: 'Важные условия', value: joinLabels(profile.conditions, CONDITIONS) || 'Нет' },
  ];
}

// Same data keyed by label, for the profile card which renders a fixed row set.
export function profileValues(profile) {
  return Object.fromEntries(profileRows(profile).map((r) => [r.label, r.value]));
}
