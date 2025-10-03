const RELATION_MULTIPLIERS = {
  twice_vulnerable: 4,
  vulnerable: 2,
  neutral: 1,
  resistant: 0.5,
  twice_resistant: 0.25,
  immune: 0,
};

export function getTypeMultiplier(attackTypeName, defender) {
  if (!attackTypeName) {
    return 1;
  }

  const resistance = defender.resistances?.find(entry => normalizeName(entry.name) === normalizeName(attackTypeName));
  if (!resistance) {
    return 1;
  }

  if (typeof resistance.damage_multiplier === 'number') {
    return resistance.damage_multiplier;
  }

  return RELATION_MULTIPLIERS[resistance.damage_relation] ?? 1;
}

function normalizeName(name) {
  return (name ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
