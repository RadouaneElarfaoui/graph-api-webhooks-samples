const axios = require('axios');

/**
 * Fonction pour rechercher un titre sur Wikipédia
 * @param {string} title - Le titre à rechercher sur Wikipédia
 * @returns {Promise} - Une promesse contenant les résultats de la recherche
 */
async function searchWikipedia(title) {
  try {
    const response = await axios.get('https://fr.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: title,
        format: 'json'
      }
    });

    if (response.data && response.data.query && response.data.query.search) {
      return response.data.query.search;
    } else {
      throw new Error('Aucun résultat trouvé pour la recherche.');
    }
  } catch (error) {
    throw new Error('Erreur lors de la recherche sur Wikipédia : ' + error.message);
  }
}

/**
 * Fonction pour modifier le post sur Facebook avec les résultats de la recherche
 * @param {string} postId - L'ID du post à modifier
 * @param {Array} results - Les résultats de la recherche sur Wikipédia à inclure dans le post
 */
async function updateFacebookPost(postId, results) {
  try {
    const accessToken = process.env.PAGE_ACCESS_TOKEN; // Obtenez votre access token Facebook à partir des variables d'environnement
    let message = `Résultats de la recherche sur Wikipédia :\n`;

    results.forEach(result => {
      message += `\n- Titre : ${result.title}\n`;
      message += `  Résumé : ${result.snippet}\n`;
      message += `  Lien : https://fr.wikipedia.org/wiki/${encodeURIComponent(result.title)}\n\n`;
    });

    const response = await axios.post(
      `https://graph.facebook.com/v12.0/${postId}`,
      { message: message },
      { params: { access_token: accessToken } }
    );

    console.log(`Post Facebook mis à jour avec succès : ${response.data}`);
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du post Facebook : ${error.message}`);
  }
}

/**
 * Fonction pour traiter les changements reçus dans les webhooks
 * @param {Object} change - L'objet de changement à traiter
 */
async function handleChange(change) {
  console.log('Handling change:', JSON.stringify(change, null, 2));

  if (!change.value) {
    console.log('No value in change object');
    return;
  }

  if (change.value.verb === "add") {
    const message = change.value.message;

    console.log(`Message: ${message}`);

    try {
      // Recherche sur Wikipédia en utilisant le message ajouté
      const searchResults = await searchWikipedia(message);

      console.log(`Résultats de la recherche pour "${message}":`);
      searchResults.forEach(result => {
        console.log(`- Titre : ${result.title}`);
        console.log(`  Résumé : ${result.snippet}`);
        console.log(`  Lien : https://fr.wikipedia.org/wiki/${encodeURIComponent(result.title)}`);
      });

      // Modifier le post sur Facebook avec les résultats de la recherche
      await updateFacebookPost(change.value.post_id, searchResults);

      // Ici, vous pouvez ajouter du code pour poster sur d'autres plateformes comme Instagram, etc.
    } catch (error) {
      console.error(error.message);
      // Gérer les erreurs
    }
  } else {
    console.log('Le changement reçu ne concerne pas une édition de post.');
  }
}

module.exports = handleChange;
