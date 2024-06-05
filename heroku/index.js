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

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || 'token';
var received_updates = [];

app.get('/', function(req, res) {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == token
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);
  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  // Process the Facebook updates here
// Parcourir les entrées dans le corps de la requête
  if (req.body.entry) {
    req.body.entry.forEach(function(entry) {
      console.log('Entry:', entry);
      
      // Vérifiez si l'entrée a des changements
      if (entry.changes) {
        entry.changes.forEach(function(change) {
          // Afficher les changements dans la console
          console.log('Change:', JSON.stringify(change, null, 2));
          
          // Exemple : Si le changement concerne un post ajouté
          if (change.field === 'feed' && change.value.item === 'post' && change.value.verb === 'add') {
            var postId = change.value.post_id;

            // Modifier le post en utilisant l'API Graph
            var newMessage = 'Votre message modifié';
            var url = `https://graph.facebook.com/${postId}`;

            request({
              url: url,
              qs: { access_token: pageAccessToken },
              method: 'POST',
              json: { message: newMessage }
            }, function(error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log('Post modified successfully');
              } else {
                console.error('Failed to modify the post:', error || body);
              }
            });
          }
        });
      }
    });
  }
  //==============================================

  
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen();
