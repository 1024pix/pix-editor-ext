# Pix-editor extension

Une extension pour Firefox qui permet d'ouvrir une épreuve Pix directement dans Pix-editor. 
Si vous n'êtes pas éditeur ou éditrice de contenu pour Pix, cette extension ne sera pas utile.

## Installation

### 1. Cloner le projet
```
git clone https://github.com/1024pix/pix-editor-ext.git
cd pix-auto-answer
```

### 2. Installer le plugin pour Firefox

- Aller dans `Firefox > Outils > Module complémentaire`
- Dans `Extension`
- Cliquer sur l'icône `Paramètre`
- Choisir `Installer un module depuis un fichier`
- Aller dans le dossier `pix-editor-ext/web-ext-artefacts`
- Choisir `web-ext-artefacts/pix_editor_YYY-XXX.xpi`


## Lancer en mode développement

Il est possible de rafraîchir l'extension après une modification.
Pour cela, il faut installer le plugin de manière temporaire :

```sh
npm run dev:firefox
```

ou

```sh
npm run dev:chrome
```

Après chaque modification, l'extension est rechargée automatiquement.

## Créer une nouvelle version empaquetée de l'extension

Génère un nouveau plugin "OK" signé (nécessite les identifiants Mozilla, _api-key_ & _api-secret_)
```sh
MOZILLA_API_KEY=#api-key# MOZILLA_SECRET=#api-secret# npm run generate-signed
```
