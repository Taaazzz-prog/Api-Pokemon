const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scriptPath = path.resolve(__dirname, '..', 'src', 'js', 'script.js');
const script = fs.readFileSync(scriptPath, 'utf8');

const context = {
  window: {},
  console,
};

vm.runInNewContext(script, context);

const { normalizeTypeName, expandTypeAliases } = context.window;

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

expect(typeof normalizeTypeName === 'function' && typeof expandTypeAliases === 'function', 'Fonctions disponibles');
expect(normalizeTypeName('Électrik') === 'electrik', 'Normalisation accent');
expect(normalizeTypeName('  Fée ') === 'fee', 'Trim + lowercase + accent');

const elect = expandTypeAliases('electrik');
expect(Array.isArray(elect), 'expandTypeAliases retourne un tableau');
expect(elect.includes('electrik'), 'Alias contient la forme de base');
expect(elect.includes('electric'), 'Alias contient la forme anglaise');

const groundAliases = expandTypeAliases('sol');
expect(groundAliases.includes('ground'), 'Alias "sol" contient "ground"');
expect(expandTypeAliases('ground').includes('sol'), 'Alias inverses (ground -> sol)');

const dragonAliases = expandTypeAliases('dragon');
expect(new Set(dragonAliases).size === dragonAliases.length, 'Alias dragon sans doublon');

console.log('Tests OK (7 assertions)');
