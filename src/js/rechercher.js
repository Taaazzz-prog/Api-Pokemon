/* Commentaire genere pour pablo */
/*
 * Utilitaire de recherche de Pokémons
 * Ce fichier contient la classe Recherche qui permet:
 * - De rechercher un Pokémon par son nom dans l'API
 * - D'afficher les résultats dans la console
 */

class Recherche {
    // Constructeur initialisant l'URL de l'API
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    // Méthode pour rechercher un Pokémon par son nom
    async rechercherParNom(nom) {
        try {
            // Récupérer tous les Pokémons depuis l'API
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            // Chercher un Pokémon dont le nom correspond (insensible à la casse)
            const resultat = data.find(pokemon => pokemon.name.toLowerCase() === nom.toLowerCase());
            
            // Afficher le résultat
            if (resultat) {
                console.log(`Pokémon trouvé :`, resultat);
            } else {
                console.log(`Aucun Pokémon trouvé avec le nom "${nom}".`);
            }
        } catch (error) {
            // Gérer les erreurs
            console.error('Erreur lors de la recherche:', error);
        }
    }
}

// Exemple d'utilisation de la classe Recherche
const recherche = new Recherche('https://pokebuildapi.fr/api/v1/pokemon');
recherche.rechercherParNom('Pikachu');
