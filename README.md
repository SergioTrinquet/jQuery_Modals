# JQuery - fenêtre modale avec options


*Prévoir d'ajouter des options :*  
- *sur l'option shadow (dotted, slashed, plain)*
- *closable*
-  *backgroundColor*

## Présentation

Ce widget permet d'intégrer facilement une ou plusieurs fenêtres modales avec les options suivantes:   

* Possibilité lorsqu'on clique sur le lien d'agrandir l'encart et de faire apparaitre un autre message
* Possibilité de positionner l'encart au dessus du contenu (position: absolute ou fixed) ou bien dans le flux (float left ou right)
* Possibilité de laisser apparaitre en pointillé la position initiale de l'encart lorsqu'il est agrandi
* Possibilité de choisir la largeur de l'encart dans sa configuration initiale, et lorsqu'il est agrandi
* Template concernant le contenu et sa mise en forme CSS situé par défaut dans un répertoire dédié, mais qui peut être situé ailleurs, auquel cas ce chemin doit être signalé dans les paramètres (propriété "url")
* Vitesse de transition entre l'état de l'encart initial et lorsque celui-ci est redimensionné

## Installation

#### 1 - Fichiers requis
Dans la balise 'head', intégrez le CSS suivant : 
* Le lien faisant appel à la font "fontawesome", 
* Le fichier "modal.css" (dans ce projet, répertoire "/styles")  

et les fichiers javascript suivants :
* La librairie Jquery,  
* ejs.min.js (dans ce projet, répertoire "/scripts/lib"), 
* modal.js (dans ce projet, répertoire "/scripts")

Code à intégrer dans le "head":
```
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
<link rel="stylesheet" type="text/css" media="screen" href="/path/to/modal.css" />

<script type="text/javascript" src="/path/to/jquery.js"></script>
<script type="text/javascript" src="/path/to/ejs.min.js"></script>
<script type="text/javascript" src="/path/to/modal.js"></script>
```
#### 2 - Balise HTML
Intégrez une balise HTML de type conteneur (div, span, p) avec un selecteur pour créer une fenêtre modale :
```
// Peu importe le selecteur (class, id,...)
<div class="selector"></div>
```

#### 3 - Script
 Placez votre script javascript juste avant la balise de fermeture "body".  
Exemple de code:
```
$('.selector').setModal({
    // Configurer avec les options ici
    position: "floatRight", 
    originalWidth: "300px",
    redim: true,
    redimLink: "Tout le texte ici",
    redimWidth: "600px",
    animationSpeed: 2000
    ...
});
```
#### 4 - Contenu de la fenêtre modale
Le contenu et le style CSS du contenu d'une fenêtre modale doivent être placés dans un fichier HTML à part (Dans ce projet */templates/defaultTemplate.html*).  
Si vous intégrez plusieurs fenêtres modales avec pour chacune des contenus distincts, il faudra alors un fichier HTML par fenêtre modale.  

Le code du fichier HTML doit avoir une balise 'script' par état (état par défaut, état lorsque redimensionné), dont les id sont respectivement 'tpl_default', et 'tpl_redim'.

Note : Si la fenêtre modale n'est pas configurée pour être redimensionnée, il n'y a pas besoin de la balise 'script' avec l'id 'tpl_redim'.

Structure du code du template pour le contenu d'une fenêtre modale :
 ```
<!-- Contenu et style pour fenêtre modale par défaut (obligatoire) -->
<script id="tpl_default" type="text/html">

    <!-- Code CSS (facultatif) -->
    <style>
        span { color: red; font-size: 14px; }
    </style>

    <!-- Code HTML -->
    <span>Texte du modal</span>

</script>

<!-- Contenu et style pour fenêtre modale lorsqu'elle est redimensionnée (facultatif) -->
<script id="tpl_redim" type="text/html">

    <!-- Code CSS (facultatif) -->
    <style>
        span { color: green; font-size: 16px; font-weight: bold; }
    </style>

    <!-- Code HTML -->
    <span>Texte du modal redimensionné</span>

 </script>
 ```


## Options

### position
**Type**: *String*  
**Valeur par défaut**: *"absolute"*

Défini la propriété CSS 'display' de l'encart, donc détermine son positionnement par rapport au reste du contenu de la page.  
Valeurs possibles : *"absolute"*, *"fixed"*, *"floatLeft"*, *"floatRight"*

### originalWidth
**Type**: *String*  
**Valeur par défaut**: *"200px"*

Défini la propriété CSS 'width' de l'encart dans sa configuration originale (avant d'être redimensionné)

### redim
**Type**: *Booléen*  
**Valeur par défaut**: *false*

Conditionne la possibilité de redimensionner ou non l'encart.

### animationSpeed
**Type**: *Integer*  
**Valeur par défaut**: *500*

Vitesse en millisecondes à laquelle se déroule les transitions entre l'état initial de l'encart (avec ses dimensions originelles) et son état après redimentionnement.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

### redimLink
**Type**: *String*  
**Valeur par défaut**: *"Le communiqué dans son intégralité"*

Intitulé du lien qui permet lorsque l'on clique dessus de redimensionner l'encart.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

### redimWidth
**Type**: *String*  
**Valeur par défaut**: *"800px"*

Défini la propriété CSS 'width' de l'encart lorsqu'il est redimensionné.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

### shadow
**Type**: *Booléen*  
**Valeur par défaut**: *false*

Affiche sous forme de pointillé les dimensions d'origine de l'encart lorsque celui-ci est redimensionné.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

### url
**Type**: *String*  
**Valeur par défaut**: *"templates/defaultTemplate.html"*

URL relative des templates accueillant le contenu HTML et la mise en forme CSS de la fenêtre modale dans son état original, et optionnellement lorsqu'elle est redimensionnée (si la fenêtre modale est configurée à cet effet).