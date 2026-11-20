# BddMapper

> [!NOTE]
> J'ai commencé ce projet en web vanilla, puis, au bout d'un jour de code, j'ai migré vers du Réact. Comme j'y connaisait rien, j'ai demandé à une IA de porter le projet. Si cette version est en prod, c'est que j'ai reussi à comprendre le code et à le modifier, donc tous vas bien !
> Bon par contre je vais prendre des cours de poteries je pense... 
>
> Plus serieusement, ce projet n'a pas voquation à être vibe-codé !


Application React pour créer et modifier un schéma de base de données.

## Lancer l’application

```sh
npm install
npm run dev
```

Les commandes `npm run build` et `npm run preview` servent respectivement à
générer et à prévisualiser la version de production.

## Organisation du code

- `src/main.jsx` crée le point d’entrée React et fournit le contexte du schéma.
- `src/App.jsx` assemble l’écran et gère les dialogues, le menu et les actions
  d’import/export et de sauvegarde.
- `src/context/SchemaContext.jsx` rend les données du schéma accessibles aux
  composants qui en ont besoin.
- `src/hooks/useSchema.js` contient l’état du schéma et les opérations qui le
  modifient. Une mise à jour reçoit l’état courant et en retourne une nouvelle
  version ; elle ne modifie pas directement l’objet existant.
- `src/components/Zone/Zone.jsx` affiche l’espace de travail et gère la création
  des relations.
- `src/components/Table/Table.jsx` affiche une table et gère son déplacement et
  ses colonnes.
- `src/components/Links/Links.jsx` calcule et affiche les courbes des relations.

## Quelques notions React utilisées

- Un composant est une fonction qui retourne du JSX, la syntaxe utilisée pour
  décrire les éléments affichés.
- Les **props** sont les valeurs et fonctions qu’un composant parent transmet à
  un composant enfant.
- `useState` conserve une valeur entre les affichages. Il faut utiliser sa
  fonction de mise à jour plutôt que de modifier directement cette valeur.
- `useRef` conserve une référence vers un élément HTML ou une valeur technique
  qui ne doit pas déclencher un nouvel affichage.
- Le contexte (`SchemaProvider` et `useSchemaStore`) partage le schéma entre
  composants sans devoir transmettre les mêmes props à chaque niveau.

Les gestionnaires d’événements et les fonctions de transformation sont nommés
et écrits avec la syntaxe `function` afin que leur rôle soit plus facile à
repérer.
