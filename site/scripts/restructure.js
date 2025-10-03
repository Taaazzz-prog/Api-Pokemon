#!/usr/bin/env node

/**
 * Script de restructuration automatique du projet Pokédx
 * @description Automatise la réorganisation des fichiers et met à jour les références
 * @usage npm run restructure ou node scripts/restructure.js
 */

const fs = require('fs').promises;
const path = require('path');

class ProjectRestructurer {
  constructor() {
    this.projectRoot = process.cwd();
    this.moved = [];
    this.errors = [];
  }

  /**
   * Lance la restructuration complète
   */
  async restructure() {
    console.log('🚀 Début de la restructuration du projet...\n');

    try {
      await this.createDirectoryStructure();
      await this.moveFiles();
      await this.updateReferences();
      await this.cleanupTestFiles();
      await this.generateReport();
      
      console.log('✅ Restructuration terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la restructuration:', error.message);
      process.exit(1);
    }
  }

  /**
   * Crée la nouvelle structure de dossiers
   */
  async createDirectoryStructure() {
    console.log('📁 Création de la structure de dossiers...');
    
    const directories = [
      'src',
      'src/css',
      'src/js',
      'src/js/modules',
      'src/js/utils',
      'assets',
      'assets/images',
      'assets/icons',
      'pages',
      'docs',
      'scripts'
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`  ✓ ${dir}/`);
      } catch (error) {
        console.log(`  ⚠️  ${dir}/ (déjà existant)`);
      }
    }
  }

  /**
   * Déplace les fichiers selon la nouvelle structure
   */
  async moveFiles() {
    console.log('\n📦 Déplacement des fichiers...');

    const moves = [
      // CSS
      { from: 'style.css', to: 'src/css/style.css' },
      { from: 'styles.css', to: 'src/css/styles.css' },
      
      // Images et assets
      { from: 'image', to: 'assets/images/ui' },
      { from: 'logo', to: 'assets/icons/logo' },
      { from: 'pokemon_images', to: 'assets/images/pokemon_images' },
      
      // JavaScript modules
      { from: 'favorites.js', to: 'src/js/modules/favorites.js' },
      { from: 'pokemon-comparator.js', to: 'src/js/modules/pokemon-comparator.js' },
      { from: 'search-history.js', to: 'src/js/modules/search-history.js' },
      { from: 'advanced-search.js', to: 'src/js/modules/advanced-search.js' },
      { from: 'theme-manager.js', to: 'src/js/modules/theme-manager.js' },
      { from: 'pwa-manager.js', to: 'src/js/modules/pwa-manager.js' },
      
      // JavaScript utils
      { from: 'lazy-load.js', to: 'src/js/utils/lazy-load.js' },
      { from: 'image-optimizer.js', to: 'src/js/utils/image-optimizer.js' },
      { from: 'validator.js', to: 'src/js/utils/validator.js' },
      { from: 'cdn-manager.js', to: 'src/js/utils/cdn-manager.js' },
      { from: 'asset-minifier.js', to: 'src/js/utils/asset-minifier.js' },
      { from: 'pagination.js', to: 'src/js/utils/pagination.js' },
      { from: 'accessibility.js', to: 'src/js/utils/accessibility.js' },
      
      // JavaScript core (reste à la racine de src/js)
      { from: 'script.js', to: 'src/js/script.js' },
      { from: 'asyncAwait.js', to: 'src/js/asyncAwait.js' },
      { from: 'app-initializer.js', to: 'src/js/app-initializer.js' },
      { from: 'menu.js', to: 'src/js/menu.js' },
      { from: 'mobile-menu.js', to: 'src/js/mobile-menu.js' },
      { from: 'options-panel.js', to: 'src/js/options-panel.js' },
      { from: 'pokemon-fallback-data.js', to: 'src/js/pokemon-fallback-data.js' },
      { from: 'rechercher.js', to: 'src/js/rechercher.js' },
      { from: 'generation.js', to: 'src/js/generation.js' },
      { from: 'telecharger.js', to: 'src/js/telecharger.js' },
      
      // Pages
      { from: 'generation.html', to: 'pages/generation.html' },
      { from: 'liste.html', to: 'pages/liste.html' },
      { from: 'nouvelles-fonctionnalites.html', to: 'pages/nouvelles-fonctionnalites.html' },
      
      // Documentation
      { from: 'DEPLOYMENT-GUIDE.md', to: 'docs/DEPLOYMENT-GUIDE.md' },
      { from: 'CDN-SETUP.md', to: 'docs/CDN-SETUP.md' },
      { from: 'analyse-site-pokemon.md', to: 'docs/analyse-site-pokemon.md' },
      { from: 'NOUVELLES-FONCTIONNALITES.md', to: 'docs/NOUVELLES-FONCTIONNALITES.md' }
    ];

    for (const move of moves) {
      await this.moveFile(move.from, move.to);
    }
  }

  /**
   * Déplace un fichier ou dossier
   */
  async moveFile(from, to) {
    const fromPath = path.join(this.projectRoot, from);
    const toPath = path.join(this.projectRoot, to);

    try {
      const stats = await fs.stat(fromPath);
      
      if (stats.isDirectory()) {
        await fs.rename(fromPath, toPath);
      } else {
        // Créer le dossier parent si nécessaire
        await fs.mkdir(path.dirname(toPath), { recursive: true });
        await fs.rename(fromPath, toPath);
      }
      
      this.moved.push({ from, to });
      console.log(`  ✓ ${from} → ${to}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`  ⚠️  ${from} (erreur: ${error.message})`);
        this.errors.push({ file: from, error: error.message });
      }
    }
  }

  /**
   * Met à jour les références dans les fichiers
   */
  async updateReferences() {
    console.log('\n🔗 Mise à jour des références...');

    const files = [
      'index.html',
      'pages/generation.html',
      'pages/liste.html',
      'pages/nouvelles-fonctionnalites.html'
    ];

    for (const file of files) {
      await this.updateFileReferences(file);
    }
  }

  /**
   * Met à jour les références dans un fichier spécifique
   */
  async updateFileReferences(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      let content = await fs.readFile(fullPath, 'utf8');
      const isSubPage = filePath.startsWith('pages/');
      const prefix = isSubPage ? '../' : '';

      // Mise à jour des liens CSS
      content = content.replace(/href="styles\.css"/g, `href="${prefix}src/css/styles.css"`);
      content = content.replace(/href="style\.css"/g, `href="${prefix}src/css/style.css"`);

      // Mise à jour des images
      content = content.replace(/src="\.\/image\//g, `src="${prefix}assets/images/ui/`);
      content = content.replace(/href="image\//g, `href="${prefix}assets/images/ui/`);

      // Mise à jour des scripts JavaScript
      const jsUpdates = {
        'script.js': `${prefix}src/js/script.js`,
        'theme-manager.js': `${prefix}src/js/modules/theme-manager.js`,
        'favorites.js': `${prefix}src/js/modules/favorites.js`,
        'pokemon-comparator.js': `${prefix}src/js/modules/pokemon-comparator.js`,
        'search-history.js': `${prefix}src/js/modules/search-history.js`,
        'advanced-search.js': `${prefix}src/js/modules/advanced-search.js`,
        'pwa-manager.js': `${prefix}src/js/modules/pwa-manager.js`,
        'lazy-load.js': `${prefix}src/js/utils/lazy-load.js`,
        'image-optimizer.js': `${prefix}src/js/utils/image-optimizer.js`,
        'pagination.js': `${prefix}src/js/utils/pagination.js`,
        'accessibility.js': `${prefix}src/js/utils/accessibility.js`,
        'asyncAwait.js': `${prefix}src/js/asyncAwait.js`,
        'app-initializer.js': `${prefix}src/js/app-initializer.js`
      };

      for (const [oldPath, newPath] of Object.entries(jsUpdates)) {
        content = content.replace(new RegExp(`src="${oldPath}"`, 'g'), `src="${newPath}"`);
      }

      // Mise à jour des liens de navigation pour les sous-pages
      if (isSubPage) {
        content = content.replace(/href="\.\/index\.html"/g, 'href="../index.html"');
      }

      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`  ✓ ${filePath}`);
    } catch (error) {
      console.log(`  ⚠️  ${filePath} (erreur: ${error.message})`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Supprime les fichiers de test inutiles
   */
  async cleanupTestFiles() {
    console.log('\n🧹 Nettoyage des fichiers de test...');

    const testFiles = [
      'test.html',
      'test-features.html',
      'test-debug.html',
      'test-comparateur.html',
      'demo.html',
      'html-test.html',
      'offline-test.html',
      'src/js/search-tests.js'
    ];

    for (const file of testFiles) {
      await this.deleteFile(file);
    }
  }

  /**
   * Supprime un fichier
   */
  async deleteFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    
    try {
      await fs.unlink(fullPath);
      console.log(`  ✓ Supprimé: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`  ⚠️  ${filePath} (erreur: ${error.message})`);
      }
    }
  }

  /**
   * Génère un rapport de restructuration
   */
  async generateReport() {
    console.log('\n📊 Génération du rapport...');

    const report = `# Rapport de Restructuration

## Résumé
- **Fichiers déplacés**: ${this.moved.length}
- **Erreurs**: ${this.errors.length}
- **Date**: ${new Date().toISOString()}

## Fichiers déplacés
${this.moved.map(m => `- \`${m.from}\` → \`${m.to}\``).join('\n')}

${this.errors.length > 0 ? `## Erreurs
${this.errors.map(e => `- \`${e.file}\`: ${e.error}`).join('\n')}` : ''}

## Structure finale
\`\`\`
Pokemon/
├── src/
│   ├── css/
│   └── js/
│       ├── modules/
│       └── utils/
├── assets/
│   ├── images/
│   └── icons/
├── pages/
└── docs/
\`\`\`
`;

    await fs.writeFile(path.join(this.projectRoot, 'docs/RESTRUCTURATION-REPORT.md'), report, 'utf8');
    console.log('  ✓ Rapport généré: docs/RESTRUCTURATION-REPORT.md');
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const restructurer = new ProjectRestructurer();
  restructurer.restructure();
}

module.exports = ProjectRestructurer;