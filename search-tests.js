// Tests pour valider le système de recherche avancée
class SearchValidator {
  constructor() {
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Début des tests de recherche avancée...');
    
    // Attendre que les données soient chargées
    await this.waitForData();
    
    // Tests unitaires
    this.testNameSearch();
    this.testTypeFilter();
    this.testGenerationFilter();
    this.testIdRangeFilter();
    this.testStatsFilter();
    this.testCombinedFilters();
    
    // Afficher les résultats
    this.displayResults();
  }

  async waitForData() {
    return new Promise((resolve) => {
      const checkData = () => {
        if (window.advancedSearchManager && window.advancedSearchManager.pokemons.length > 0) {
          resolve();
        } else {
          setTimeout(checkData, 100);
        }
      };
      checkData();
    });
  }

  testNameSearch() {
    const testCases = [
      { input: 'pikachu', expected: true, description: 'Recherche exacte' },
      { input: 'Pika', expected: true, description: 'Recherche partielle' },
      { input: 'xyz', expected: false, description: 'Pokémon inexistant' }
    ];

    testCases.forEach(test => {
      const filters = { name: test.input };
      const results = window.advancedSearchManager.applyFilters(filters);
      const found = results.some(p => p.name.toLowerCase().includes(test.input.toLowerCase()));
      
      this.testResults.push({
        test: `Recherche par nom: ${test.description}`,
        passed: found === test.expected,
        details: `Recherche "${test.input}" - Trouvé: ${found}`
      });
    });
  }

  testTypeFilter() {
    const filters = { types: ['electric'] };
    const results = window.advancedSearchManager.applyFilters(filters);
    const allElectric = results.every(p => 
      p.apiTypes.some(type => type.name.toLowerCase() === 'electric')
    );

    this.testResults.push({
      test: 'Filtre par type (Électrique)',
      passed: allElectric && results.length > 0,
      details: `${results.length} Pokémons électriques trouvés`
    });
  }

  testGenerationFilter() {
    const filters = { generation: '1' };
    const results = window.advancedSearchManager.applyFilters(filters);
    const allGen1 = results.every(p => 
      p.pokedexId >= 1 && p.pokedexId <= 151
    );

    this.testResults.push({
      test: 'Filtre par génération (1)',
      passed: allGen1 && results.length > 0,
      details: `${results.length} Pokémons de la génération 1 trouvés`
    });
  }

  testIdRangeFilter() {
    const filters = { idMin: '1', idMax: '10' };
    const results = window.advancedSearchManager.applyFilters(filters);
    const inRange = results.every(p => 
      p.pokedexId >= 1 && p.pokedexId <= 10
    );

    this.testResults.push({
      test: 'Filtre par plage d\'ID (1-10)',
      passed: inRange && results.length > 0,
      details: `${results.length} Pokémons dans la plage trouvés`
    });
  }

  testStatsFilter() {
    const filters = { 
      stats: {
        hp: { min: '100', max: '' },
        attack: { min: '', max: '50' }
      }
    };
    const results = window.advancedSearchManager.applyFilters(filters);
    const validStats = results.every(p => 
      p.stats.HP >= 100 && p.stats.attack <= 50
    );

    this.testResults.push({
      test: 'Filtre par statistiques (HP ≥ 100, Attaque ≤ 50)',
      passed: validStats,
      details: `${results.length} Pokémons correspondant aux critères`
    });
  }

  testCombinedFilters() {
    const filters = {
      name: 'char',
      types: ['fire'],
      generation: '1'
    };
    const results = window.advancedSearchManager.applyFilters(filters);
    const validCombined = results.every(p => 
      p.name.toLowerCase().includes('char') &&
      p.apiTypes.some(type => type.name.toLowerCase() === 'fire') &&
      p.pokedexId >= 1 && p.pokedexId <= 151
    );

    this.testResults.push({
      test: 'Filtres combinés (nom + type + génération)',
      passed: validCombined,
      details: `${results.length} Pokémons correspondant à tous les critères`
    });
  }

  displayResults() {
    console.log('\n📊 Résultats des tests de recherche:');
    console.log('=' .repeat(50));
    
    let passed = 0;
    let total = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      console.log(`   ${result.details}`);
      if (result.passed) passed++;
    });

    console.log('=' .repeat(50));
    console.log(`Tests réussis: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 Tous les tests sont passés avec succès!');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérification nécessaire.');
    }
  }
}

// Exécuter les tests automatiquement quand la page est chargée
window.addEventListener('load', () => {
  setTimeout(() => {
    const validator = new SearchValidator();
    validator.runTests();
  }, 2000); // Attendre 2 secondes pour que tout soit initialisé
});

// Export pour utilisation manuelle
window.searchValidator = new SearchValidator();