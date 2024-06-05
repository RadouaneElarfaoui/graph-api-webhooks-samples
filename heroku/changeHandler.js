// changeHandler.js

/**
 * Fonction pour traiter les changements reçus dans les webhooks
 * @param {Object} change - L'objet de changement à traiter
 */
function handleChange(change) {
  console.log('Handling change:', JSON.stringify(change, null, 2));
    if (change.value && change.value.verb === "edited") { // Vérifie si le changement concerne une édition
      // Extrait les informations pertinentes du changement
      const postId = change.value.post_id;
      const message = change.value.message;
  
      // Affiche le message et l'ID du post
      console.log(`Message: ${message}`);
      console.log(`Post ID: ${postId}`);
      
      // Affiche un message indiquant que le post a été modifié
      //console.log(`Le post avec l'ID ${postId} a été modifié.`);
    }
  
 
  // Ajoutez ici plus de logique de traitement selon vos besoins
}

module.exports = handleChange;
