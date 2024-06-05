const axios = require('axios');

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

  if (change.value.verb === "edited") {
    const postId = change.value.post_id;
    const message = change.value.message;

    console.log(`Message: ${message}`);
    console.log(`Post ID: ${postId}`);

    console.log(`Le post avec l'ID ${postId} a été modifié.`);

    try {
      const accessToken = process.env.PAGE_ACCESS_TOKEN; // Assurez-vous que votre access token est défini dans les variables d'environnement
      const newMessage = "Le post a été modifié automatiquement.";
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${postId}`,
        { message: newMessage },
        { params: { access_token: accessToken } }
      );
      console.log(`Post modifié avec succès : ${response.data}`);
    } catch (error) {
      console.error(`Erreur lors de la modification du post : ${error.message}`);
    }
  } else {
    console.log('Le changement reçu ne concerne pas une édition de post.');
  }
}

module.exports = handleChange;
