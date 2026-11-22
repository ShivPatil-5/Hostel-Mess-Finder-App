// Small helper functions used by the screens.

// 15 -> "3 PM"
export function formatHour(h) {
  const suffix = h >= 12 && h < 24 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return hour12 + ' ' + suffix;
}

// Text such as "Lunch 12 PM-3 PM, Dinner 7 PM-10 PM"
export function mealsText(m) {
  const parts = [];
  if (m.lunchEnd > 0) parts.push('Lunch ' + formatHour(m.lunchStart) + '-' + formatHour(m.lunchEnd));
  if (m.dinnerEnd > 0) parts.push('Dinner ' + formatHour(m.dinnerStart) + '-' + formatHour(m.dinnerEnd));
  return parts.join(', ');
}

// true if the mess is serving a meal right now
export function isOpenNow(m) {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const lunch = m.lunchEnd > 0 && hour >= m.lunchStart && hour < m.lunchEnd;
  const dinner = m.dinnerEnd > 0 && hour >= m.dinnerStart && hour < m.dinnerEnd;
  return lunch || dinner;
}
