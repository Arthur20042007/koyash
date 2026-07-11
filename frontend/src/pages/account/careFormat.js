// Formatting helpers shared by the cosmetic bag and the replacement screen.

export function formatPrice(rub) {
  const n = Math.round(rub || 0);
  return `${n.toLocaleString('ru-RU')}₽`;
}

// "Шаг 1 из 5 — Очищение | Ежедневно"
export function stepLine(item) {
  const role = item?.justification?.role || '';
  const freq = item?.product?.frequency || '';
  return [role, freq].filter(Boolean).join(' | ');
}

export function descLine(item) {
  return (item?.justification?.what_it_does || []).join(' + ');
}

export function whyLine(item) {
  const j = item?.justification || {};
  return j.summary_ru || (j.why_for_you || []).join('. ');
}
