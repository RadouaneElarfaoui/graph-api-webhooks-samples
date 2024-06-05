/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var handleChange = require('./changeHandler');

app.set('port', (process.env.PORT || 5000)); // Définit le port du serveur
app.listen(app.get('port')); // Lance le serveur sur le port défini

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET })); // Middleware pour valider les signatures des requêtes
app.use(bodyParser.json()); // Middleware pour parser les corps de requêtes en JSON

var token = process.env.TOKEN || 'token'; // Jeton de vérification pour les webhooks
var received_updates = []; // Tableau pour stocker les mises à jour reçues

// Route GET racine pour afficher les mises à jour reçues
app.get('/', function(req, res) {
  console.log(req); // Log de la requête pour le debug
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>'); // Affiche les mises à jour en format JSON
});

// Route GET pour la vérification des webhooks Facebook et Instagram
app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']); // Répond avec le challenge pour vérifier le webhook
  } else {
    res.sendStatus(400); // Répond avec un statut 400 si la vérification échoue
  }
});

// Route POST pour les mises à jour Facebook
app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');

  if (req.body.entry) {
    req.body.entry.forEach(function(entry) {
      console.log('Entry:', entry);

      if (entry.changes) {
        entry.changes.forEach(function(change) {
          console.log('Change:', JSON.stringify(change, null, 2));
          try {
            handleChange(change); // Appel de la fonction personnalisée
          } catch (error) {
            console.error('Error handling change:', error);
          }
        });
      }
    });
  }

  received_updates.unshift(req.body);
  res.sendStatus(200);
});
// Route POST pour les mises à jour Instagram
app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body); // Log du corps de la requête

  // Traitement des mises à jour Instagram
  received_updates.unshift(req.body); // Ajoute la mise à jour reçue en début de tableau
  res.sendStatus(200); // Répond avec un statut 200 pour indiquer que la requête a été traitée avec succès
});

app.listen(); // Démarre le serveur
