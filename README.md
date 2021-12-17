# Test Technique Happypal Front & Back

## Préambule:

Ce test a pour but de tester différents aspects que vous serez amené à rencontrer tous les jours. Vous avez carte blanche quant aux détails d'implémentations, il s'agit ici de tester votre projection dans un produit (simple) et les solutions que vous apportez.

Nous allons ici réaliser un mini clone d'amazon composées de 3 pages (au plus si vous le souhaitez).

La page d'accueil qui listera les produits mis en vente sous forme de cartes
La page produit qui affichera le détail de ces produits
La page vendeur qui, similaire à la page d'accueil affiche des produits, qui eux seront liés à un vendeur précisément

Un jeu de données vous ait fourni pour réaliser ce test, vous pouvez bien entendu le modifier, voire refaire le vôtre.

Tout code fourni est bon à utiliser et à modifier, n'hésitez pas à changer les méthodes mises en places pour convenir à vos besoins.

## Consignes:
Les points d'évaluations ci-dessous vous donne une indication de ce qui est attendu mais il n'est en aucun nécessaire de répondre à toutes les demandes, à vous de choisir de développer les points que vous souhaitez.

Vous pouvez (et êtes encouragez) à sortir des sentiers battus et à nous proposer des solutions supplémentaires.

J'insiste encore une fois sur le sujet que l'évaluation ci-dessous n'est présente qu'a titre d'information pour vous guider. Ce test est le même peu importe votre niveau technique et nous accordons plus d'importance à votre réflexion plus qu'à votre implémentation.

Le livrable à fournir est une application React (ou React Native à vous de voir) qui communique avec l'API via GraphQL (nous utilisons ApolloClient en interne avec un codegen `codegen.yml`).

Evaluation:
- [ ] Page d'accueil
  - [ ] Lister les produits en lignes
  - [ ] Pagination
  - [ ] Recherche sur le nom d'un produit
  - [ ] BONUS: Implémenter un système de marque rattaché au produit
  - [ ] BONUS: Implémenter un système de filtre sur les marques
- [ ] Page produit
  - [ ] Afficher les images produits
  - [ ] Afficher le vendeur
  - [ ] BONUS: Utiliser blurhash pour l'affichage progressif de l'image (le champs est exposé via GraphQL)
- [ ] Page vendeur
  - [ ] Lister les produits mis en ventes par un vendeur
- [ ] Panier
  - [ ] BONUS: Faire un système de panier client-side
  - [ ] BONUS: Faire un système de panier server-side
- [ ] Administration
  - [ ] BONUS: Permettre de supprimer un produit
  - [ ] BONUS: Permettre de mettre à jour un produit
- [ ] API
  - [ ] Implémenter un validateur de format de currency

## Setup

Installation des dépendencies de l'API
```sh
pnpm install --frozen-lockfile
```

Démarrage de la base de données
```sh
docker compose up -d
```

Seed de la base de données
```sh
pnpm run seed
```

Démarrage de l'API
```sh
pnpm run dev
```

## Picture Upload

To upload a picture you need to send a POST request to `/picture/upload` and then use the resulting id in your mutation.

```js
const data = new FormData();
data.append("picture", "PATH_TO_YOUR_PICTURE");

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://localhost:4000/picture/upload");

xhr.send(data); // Contains the picture object with its id
```

## Authentication

### Login

```js
import axios from "axios";

const options = {
  method: 'POST',
  url: 'http://localhost:4000/auth/login',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  data: {
    email: 'user1@test.com',
    password: 'password'
  }
};

axios.request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });
```