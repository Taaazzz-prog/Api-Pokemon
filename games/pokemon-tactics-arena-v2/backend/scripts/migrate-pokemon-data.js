#!/usr/bin/env node

/**
 * Script de migration des données Pokemon
 * Usage: npm run migrate:pokemon
 */

import { runMigration } from '../src/services/pokemonDataMigration.js';

console.log('🎮 Pokemon Tactics Arena v2 - Migration des données Pokemon');
console.log('===============================================');

runMigration()
  .then(() => {
    console.log('✅ Migration terminée avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  });