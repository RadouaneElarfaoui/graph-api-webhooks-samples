// changeHandler.js

/**
 * Fonction pour traiter les changements reçus dans les webhooks
 * @param {Object} change - L'objet de changement à traiter
 */
function handleChange(change) {
  console.log('Handling change:', JSON.stringify(change, null, 2));
  
  // Exemple de traitement des changements
  if (change.field === 'posts') {
    console.log('New post added:', change.value);
    // Ajouter ici le code pour traiter un nouveau post
  }

  // Ajoutez ici plus de logique de traitement selon vos besoins
}

module.exports = handleChange;
