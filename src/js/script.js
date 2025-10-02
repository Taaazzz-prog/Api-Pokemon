/* 
 * Utilitaires globaux pour le site Pokémon
 * Ce fichier contient des fonctions utilitaires partagées
 */

// Fonction pour afficher les indicateurs de chargement
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Chargement des Pokémon...</p>
            </div>
        `;
    }
}

// Fonction pour masquer les indicateurs de chargement
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loading = container.querySelector('.loading-spinner');
        if (loading) {
            loading.remove();
        }
    }
}

// Fonction pour gérer les erreurs d'API
function handleApiError(error, containerId) {
    console.error('Erreur API:', error);
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Erreur de chargement</h3>
                <p>Impossible de charger les données Pokémon.</p>
                <p>Veuillez vérifier votre connexion internet et réessayer.</p>
                <button onclick="location.reload()" class="retry-btn">Réessayer</button>
            </div>
        `;
    }
}

// Fonction pour formater les noms de Pokémon
function formatPokemonName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Normaliser les noms de types (minuscules et sans accents)
function normalizeTypeName(name) {
    if (!name) {
        return '';
    }
    return name
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

const TYPE_ALIASES = {
    feu: ['fire'], fire: ['feu'],
    eau: ['water'], water: ['eau'],
    plante: ['grass'], grass: ['plante'],
    electrik: ['electric'], electric: ['electrik'],
    glace: ['ice'], ice: ['glace'],
    roche: ['rock', 'stone'], rock: ['roche'], stone: ['roche'],
    sol: ['ground'], ground: ['sol'],
    vol: ['flying'], flying: ['vol'],
    insecte: ['bug'], bug: ['insecte'],
    spectre: ['ghost'], ghost: ['spectre'],
    acier: ['steel'], steel: ['acier'],
    combat: ['fighting'], fighting: ['combat'],
    psy: ['psychic'], psychic: ['psy'],
    tenebres: ['dark'], dark: ['tenebres'],
    dragon: ['dragon'],
    fee: ['fairy'], fairy: ['fee'],
    poison: ['poison'],
    normal: ['normal']
};

function expandTypeAliases(normalized) {
    if (!normalized) {
        return [];
    }

    const aliases = TYPE_ALIASES[normalized] || [];
    const unique = new Set([normalized, ...aliases.map(alias => normalizeTypeName(alias))]);
    return Array.from(unique);
}

window.normalizeTypeName = normalizeTypeName;
window.expandTypeAliases = expandTypeAliases;
