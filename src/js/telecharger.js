const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Fonction principale
const downloadPokemonImages = async () => {
  try {
    // Récupérer les données depuis l'API
    const response = await axios.get('https://pokebuildapi.fr/api/v1/pokemon');
    const pokemons = response.data;

    // Créer un dossier principal pour les images
    const baseDir = path.join(__dirname, 'pokemon_images');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }

    // Parcourir chaque Pokémon
    for (const pokemon of pokemons) {
      // Créer des dossiers pour chaque type de Pokémon
      for (const type of pokemon.apiTypes) {
        const typeDir = path.join(baseDir, type.name);
        if (!fs.existsSync(typeDir)) {
          fs.mkdirSync(typeDir);
        }

        // Télécharger l'image du Pokémon
        const imagePath = path.join(typeDir, `${pokemon.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
        const writer = fs.createWriteStream(imagePath);

        const imageResponse = await axios({
          url: pokemon.image,
          method: 'GET',
          responseType: 'stream',
        });

        imageResponse.data.pipe(writer);

        // Attendre la fin du téléchargement
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        console.log(`Image téléchargée : ${imagePath}`);
      }
    }

    console.log('Téléchargement terminé.');
  } catch (error) {
    console.error('Erreur lors du téléchargement des images :', error.message);
  }
};

// Lancer la fonction
downloadPokemonImages();