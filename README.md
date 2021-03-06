# jQuery - fenêtre modale avec options


## Présentation

Ce widget permet d'intégrer facilement des encarts qui peuvent au besoin se transformer en fenêtres modales. Le but ? Donner la possibilité à l'utilisateur d'afficher une grande quantité de contenu sans empiéter sur celui de la page principale. Vous pouvez l'utiliser pour une publicité, une information à mettre en avant, une alerte,... Les applications sont multiples, à vous d'imaginer ce que vous pouvez faire.  
[Cliquez ici pour voir quelques exemples](https://modal-jquery.web.app/exemple/index.html).
Le code se trouve dans un répertoire dédié à la racine du projet.

Ce qu'il est possible de faire :   

* Agrandir (ou non) l'encart lorsque l'on clique sur le lien prévu à cet effet, et faire apparaitre un autre contenu
* Paramétrer le positionnement de l'encart, au dessus du contenu de la page principale (position: absolute ou fixed) ou bien dans le flux (block, float left ou right)
* Faire apparaitre en pointillé la position initiale de l'encart lorsqu'il est agrandi
* Choisir la largeur de l'encart dans sa configuration initiale, et lorsqu'il est agrandi
* Définir plusieurs propriétés CSS relatives à l'encart : Sa couleur de fond, le border-radius de ses angles, ses espacements (padding et margin), son ombre portée
* Template concernant le contenu et sa mise en forme CSS situé par défaut dans un répertoire dédié, mais qui peut être situé ailleurs, auquel cas ce chemin doit être signifié dans les paramètres (propriété "url")
* Paramétrer la vitesse de transition entre l'état de l'encart initial et lorsqu'il est redimensionné
* Afficher ou non une icone de fermeture de l'encart
* Paramétrer l'intitulé et le design du lien qui permet de redimensionner l'encart

## Installation

#### 1 - Fichiers requis
A l'intérieur des balises `<head></head>`, intégrez le CSS suivant : 
* Le lien faisant appel à la font "fontawesome", 
* Le fichier "modal.css" ou sa version minifiée (dans ce projet, répertoire "/styles")  

et les fichiers javascript suivants :
* La librairie jQuery,  
* ejs.min.js (dans ce projet, répertoire "/scripts/lib"), 
* modal.js ou sa version minifiée (dans ce projet, répertoire "/scripts")

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
 Placez votre script javascript juste avant la balise de fermeture `</body>`.  
Exemple de code:
```
$('.selector').setModal({
    // Configurer avec les options ici
    position: "floatRight", 
    originalWidth: "300px",
    redim: true,
    redimLinkText: "Tout le texte ici",
    redimWidth: "600px",
    animationSpeed: 2000
    ...
});
```
#### 4 - Contenu de la fenêtre modale
Le contenu et le style CSS du contenu de l'encart comme de la fenêtre modale doivent être placés dans un fichier HTML à part (Dans ce projet, il est par défaut */templates/defaultTemplate.html*).  
Si vous intégrez plusieurs fenêtres modales avec pour chacune des contenus distincts, il faudra alors un fichier HTML par fenêtre modale.  

Le code du fichier HTML doit avoir une balise `<script>` par état (état par défaut, état lorsque redimensionné), dont les id sont respectivement 'tpl_default', et 'tpl_redim'.

Note : Si la fenêtre modale n'est pas configurée pour être redimensionnée, il n'y a pas besoin de la balise 'script' avec l'id 'tpl_redim'.

Structure du code du template pour le contenu d'une fenêtre modale :
 ```
<!-- Contenu et style pour encart - état par défaut (obligatoire) -->
<script id="tpl_default" type="text/html">

    <!-- Code CSS (facultatif) -->
    <style>
        span { color: red; font-size: 14px; }
    </style>

    <!-- Code HTML -->
    <span>Texte de l'encart</span>

</script>

<!-- Contenu et style pour fenêtre modale - encart redimensionné (facultatif) -->
<script id="tpl_redim" type="text/html">

    <!-- Code CSS (facultatif) -->
    <style>
        span { color: green; font-size: 16px; font-weight: bold; }
    </style>

    <!-- Code HTML -->
    <span>Texte du modal</span>

 </script>
 ```


## Options

### position
**Type**: *string*  
**Valeur par défaut**: *"absolute"*

Définit la propriété CSS 'display' de l'encart, donc détermine son positionnement par rapport au reste du contenu de la page.  
Valeurs possibles : *"block"*, *"absolute"*, *"fixed"*, *"floatLeft"*, *"floatRight"*

```
$('.selector').setModal({
    position: "fixed"
});
```

### originalWidth
**Type**: *string*  
**Valeur par défaut**: *"300px"*

Définit la propriété CSS 'width' de l'encart dans sa configuration originale (avant d'être redimensionné).  
Toutes les unités pour dimensionner l'encart sont inteprétées: unités absolues (px, pt, in,...) comme unités relatives (%, vw, em,...).  
La fonction *calc()* est aussi interprétée.

```
$('.selector').setModal({
    originalWidth: "50%"
});
```

### redim
**Type**: *boolean*  
**Valeur par défaut**: *false*

Conditionne la possibilité de redimensionner ou non l'encart.  
Si cette option est à *false*, le lien pour transformer l'encart en fenêtre modale ne s'affiche pas.

```
$('.selector').setModal({
    redim: true
});
```

### animationSpeed
**Type**: *number*  
**Valeur par défaut**: *500*

Vitesse en millisecondes à laquelle se déroule les transitions entre l'état initial de l'encart (avec ses dimensions originelles) et son état après redimentionnement.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

```
$('.selector').setModal({
    animationSpeed: 300
});
```

### redimLinkText
**Type**: *string*  
**Valeur par défaut**: *"Le communiqué dans son intégralité"*

Intitulé du lien/bouton qui permet lorsque l'on clique dessus de redimensionner l'encart.   
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

```
$('.selector').setModal({
    redimLinkText: "Cliquez ici pour en savoir plus"
});
```

### redimLinkType
**Type**: *string*  
**Valeur par défaut**: *"link"*

Détermine si l'élément qui permet de redimensionner l'encart prend la forme d'un lien hypertexte ou d'un bouton.  
Valeurs possibles : *"link"*,*"button"*  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

```
$('.selector').setModal({
    redimLinkType: "button"
});
```

### redimLinkStyle
**Type**: *object*  
**Valeur par défaut**: *{}*

Objet permettant d'appliquer une ou plusieurs propriétés CSS pour donner un style au lien/bouton qui déclenche le redimensionnement de l'encart.  
Ces propriétés doivent être sous forme de texte (pour l'intitulé de la propriété CSS comme pour sa valeur), séparées par deux points. les couples propriétés/valeurs seront séparés par une virgule, et seront à placer entre des accolades ouvrantes et fermantes :  
```
$('.selector').setModal({
    redimLinkStyle: {
                "background-color": "#fff", 
                "color": "blue",
                ...
            }
});
```

### redimWidth
**Type**: *string*  
**Valeur par défaut**: *"800px"*

Définit la propriété CSS 'width' de l'encart lorsqu'il est redimensionné.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.  
Toutes les unités pour dimensionner l'encart sont inteprétées: unités absolues (px, pt, in,...) comme unités relatives (%, vw, em,...).  
La fonction *calc()* est aussi interprétée.

```
$('.selector').setModal({
    redimWidth: "calc(100% - 80px)"
});
```

### shadow
**Type**: *boolean*  
**Valeur par défaut**: *false*

Affiche sous forme de pointillé les dimensions d'origine de l'encart lorsque celui-ci est redimensionné.  
Note: Cette option n'a d'intérêt que si l'option "redim" est à *true*.

```
$('.selector').setModal({
    shadow: true
});
```

### url
**Type**: *string*  
**Valeur par défaut**: *"/templates/defaultTemplate.html"*

URL relative des templates accueillant le contenu HTML et la mise en forme CSS de la fenêtre modale dans son état original, et optionnellement lorsqu'elle est redimensionnée (si la fenêtre modale est configurée à cet effet).

```
$('.selector').setModal({
    url: "/someFile/someTemplate.html"
});
```

### closable
**Type**: *boolean*  
**Valeur par défaut**: *false*

Affiche une icône en haut à droite de la fenêtre modale dans son état initial (pas redimensionné). Lorsque l'on clique dessus, la fenêtre en question se ferme. 

```
$('.selector').setModal({
    closable: true
});
```

### background
**Type**: *string*  
**Valeur par défaut**: *"#efefef"*

Détermine la propriété CSS 'background' de l'encart.
Elle permet donc d'appliquer des dégradés ou une couleur, de jouer sur son opacité (ex: *rgba(255, 255, 255, 0.5)*), ou bien encore d'intégrer une image de fond (ex: *url("test.jpg") repeat-y;*).

```
$('.selector').setModal({
    background: "red"
});
```

### padding
**Type**: *string*  
**Valeur par défaut**: *"25px"*

Définit la propriété CSS 'padding' de l'encart, dans son état original comme lorsqu'il est redimensionné.  
Comme pour la propriété CSS native, il est possible de déterminer le padding de chacun des cotés de l'encart indépendamment des autres en utilisant la syntaxe appropriée de type *"padding-top padding-right padding-bottom padding-left"*

```
$('.selector').setModal({
    padding: "10px 0 20px 5px"
});
```

### margin
**Type**: *string*  
**Valeur par défaut**: *"0px"*

Définit la propriété CSS 'margin' de l'encart, dans son état original comme lorsqu'il est redimensionné.  
Comme pour la propriété CSS native, il est possible de déterminer le margin de chacun des cotés de l'encart indépendamment des autres en utilisant la syntaxe appropriée de type *"margin-top margin-right margin-bottom margin-left"*

```
$('.selector').setModal({
    margin: "7px 0 20em 15px"
});
```

### boxShadow
**Type**: *string*  
**Valeur par défaut**: *Aucune*  
Définit la propriété CSS 'box-shadow' de l'encart, dans son état original comme lorsqu'il est redimensionné.  
Comme pour la propriété CSS native, il est possible de cumuler les box-shadow lorsqu'ils sont séparés par une virgule.

```
$('.selector').setModal({
    boxShadow: "0 0 6px rgba(0, 0, 0, 0.6), inset 0 0 0 3px #ff0000"
});
```


### borderRadius
**Type**: *number*  
**Valeur par défaut**: *0*

Définit la propriété CSS 'border-radius' de l'encart, dans son état original comme lorsqu'il est redimensionné.  
Cette valeur doit être exprimée avec un nombre entier compris entre 1 et 25. Il s'agit du nombre de px utilisé pour appliquer le border-radius. Il n'est pour l'instant pas possible d'appliquer des valeurs distinctes de border-radius selon les angles : Le border-radius s'applique avec la meme valeur sur les 4 angles.

```
$('.selector').setModal({
    borderRadius: 12
});
```