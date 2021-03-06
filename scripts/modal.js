(function ($) {     
    
    /*=================== Options par défaut ===================*/
    var defaultSettings = {
        shadow: false,
        position: "absolute",
        originalWidth: "300px",
        redim: false,
        redimWidth: "800px",
        redimLinkText: "Le communiqué dans son intégralité", 
        redimLinkType: "link",
        redimLinkStyle: {},
        url: "/templates/defaultTemplate.html",
        animationSpeed: 500
    }
    /*=================== FIN Options par défaut ===================*/
    


    var typeOptions = [
        { options: ["position", "originalWidth", "redimLinkText", "redimLinkType", "redimWidth", "url", "background", "padding", "margin"], type: "string" },
        { options: ["animationSpeed", "borderRadius"], type: "number" },
        { options: ["redim", "shadow", "closable"], type: "boolean" },
        { options: ["redimLinkStyle"], type: "object" }
    ];
    var widthOptions = ["originalWidth", "redimWidth"];
    var regexFormatWidth = new RegExp(/^[0-9]+(px|pt|pc|in|cm|mm|em|ex|ch|rem|vw|vh|vmin|vmax|%)$|^calc\(.+\)$/); // Pour valider ou non option de largeur
    var regexCSScalc = new RegExp(/^calc\(.+\)$/); // pour savoir si la propr. 'calc()' est utilisée dans option 'redimWidth'               
    


    /*=================== Pour empecher de scroller ===================*/
    function disableScroll() {
        // Coordonnées de la position de l'ascenceur de la page position
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        // Si l'utilisateur scroll, positionne l'ascenceur toujours au même endroit
        window.addEventListener('scroll', noScroll = function() { window.scrollTo(scrollLeft, scrollTop); });
    }
    function enableScroll() {
        window.removeEventListener('scroll', noScroll);
    }
    /*=================== FIN Pour empecher de scroller ===================*/



    /*=================== Objet Overlay ===================*/
    var Overlay = {
        DOMelement : null,
        init: function() {
            var body = $('body');
            if(this.DOMelement == null) {  // Si la balise DOM pour overlay n'existe pas encore (1er appel de Overlay.init())...                      
                this.DOMelement = $(document.createElement('div')).addClass('overlay');
                if(body.find(this.DOMelement).length == 0){ body.append(this.DOMelement) };
            }
            this.display(true);
        },
        display: function(val) {
            $(this.DOMelement)[val ? "addClass" : "removeClass"]('display');
        }
    }
    /*================== FIN Objet Overlay ====================*/


    /*================== Objet dont 'OriginalModal' et 'CloneModal' héritent ==================*/
    function Modal() {
        this.DOMtag = null,
        this.settings = null,
        this.dimensions = {
            height: 0,
            width: 0
        }
        this.positions = {
            top: 0,
            left: 0
        }
    }


    // Pour prélever Hauteur et Largeur en valeur absolue ou relative
    Modal.prototype.getSize = function(goodSettingsRedimWidth, key) {
        //== Hauteur ==//
        this.dimensions.height = this.DOMtag.outerHeight();
        //== Largeur ==//
        // S'il s'agit de l'encart original ou bien
        // si 'calc()' utilisé pour déterminer 'width' pour encart redimensionné: Bug avec jQuery '.animate()' donc on est obligé de prendre la largeur en 'px'...
        if(!(this.DOMtag.is("#clone_modal_" + key)) || regexCSScalc.test(goodSettingsRedimWidth)) {
            this.dimensions.width = this.DOMtag.outerWidth(); // 'this.dimensions.width' obligatoirement en px
        // ...Et s'il s'agit de l'encart cloné...
        } else if(this.DOMtag.is("#clone_modal_" + key)) {
            this.dimensions.width = goodSettingsRedimWidth; // ...'this.dimensions.width' avec valeur 'width' entrée par l'utilisateur, qu''elle soit exprimée en unité relative (ex: %) ou absolue (ex: px)
        }
    }


    // Pour obtenir position en px d'un encart
    Modal.prototype.getPosition = function() {
        this.positions.left = this.DOMtag.offset().left;
        this.positions.top = this.DOMtag.offset().top - $(document).scrollTop();
    }


    // Pour scoper le CSS dans les templates : Ajout dynamique de l'id unique d'un div parent pour chaque règles CSS du template
    Modal.prototype.scopeCSS = function(html, key, suffixe) {
        // Création tableau des noeuds d'un Template + identification de celui/ceux correspondant(s) à '<STYLE>'
        var nodes = []; var ct = 0; var idx = [];
        $.parseHTML(html).filter(function(el) {
            // Si le noeud DOM n'est pas un commentaire(=> 8) ou un string(=> 3) vide
            if(el.nodeType != 8 && (el.nodeType != 3 || (el.nodeType == 3 && el.textContent.trim() != ""))) { 
                if(el.nodeName == "STYLE") { idx.push(ct) }; // Stocke les index des balises STYLE
                nodes.push(el); 
                ct++;
            }
        });
        if(idx.length == 0) { return html }; // Si pas de balise 'STYLE': sortie

        // Remplacement de la balise '<STYLE>' par le style modifié à terme
        var DOM_templateMod = "";
        var STYLE_templateMod = [];
        for(var x=0; x < nodes.length; x++) {
            if(idx.indexOf(x) == -1) { // Si balise autre que STYLE...
                // Si texte, on prend le contenu (texte), sinon on prend le contenant (balise DOM) et le contenu (texte)
                DOM_templateMod += (nodes[x].nodeType == 3 ? nodes[x].textContent : nodes[x].outerHTML);
            } else { // ...Sinon si balise 'STYLE'...
                var tempoSTYLE = nodes[x]
                                    .innerHTML  // Récupération contenu de la balise STYLE
                                    .replace(/\/\*[\s\S]*?\*\/.*$/gm, "") // Retrait commentaire (tout ce qui est entre "/*" et "*/") 
                                    .split("}")  // Insertion ds un tableau avec comme sparateur "}"
                                    .map(el => el = "#" + key + suffixe + " " + el.trim() + "}"); // Ajout 'id' à chaque élément pour scoper le CSS + ajout caractère "}" à la fin
                tempoSTYLE.splice(STYLE_templateMod.length-1, 1); // Retrait dernier élément car caractère "}" tt seul
                
                STYLE_templateMod = STYLE_templateMod.concat(tempoSTYLE);
            }
        }
        STYLE_templateMod = "<style>" + STYLE_templateMod.join(" ") + "</style>";
            
        return STYLE_templateMod + DOM_templateMod;
    }
    /*================== FIN Objet dont 'OriginalModal' et 'CloneModal' héritent ====================*/


    /*================== Encart original ====================*/
    function OriginalModal() {
        Modal.call(this); // Héritage de l'objet 'Modal'

        this.redimBt = "",
        this.classShadow = "",
        this.templatesText = null,
        this.key = null
    }
    OriginalModal.prototype = Object.create(Modal.prototype); // Pour hériter des méthodes de l'objet 'Modal'

    
    OriginalModal.prototype.init = function(DOMtag, goodSettings) {
        this.DOMtag = $(DOMtag);

        this.settings = goodSettings;

        // Construction texte HTML pour encart
        var modalHtmlTags = "\
            <i class='fas fa-times " + (this.settings.closable ? "" : "hidden") + "' id='closeShortMsg'></i>\
            <div class='TexteInfoFocus' " + ('padding' in this.settings ? "style='padding: " + this.settings.padding + "'" : "") + " >\
                <div class='TexteInfoFocusContenu'></div>\
            </div>";

        // Option 'background-color', 'margin'
        var stylesToAdd = { "width" : this.settings.originalWidth }; // Pour fixer largeur encart si dans paramètres de l'utilisateur
        if('background' in this.settings){ stylesToAdd["background"] = this.settings.background };  
        if('margin' in this.settings){ stylesToAdd["margin"] = this.settings.margin };   
        if('boxShadow' in this.settings){ stylesToAdd["box-shadow"] = this.settings.boxShadow };   

        // Option 'border-radius'
        if('borderRadius' in this.settings){ 
            this.classShadow = "br-" + this.settings.borderRadius.toString();
        };

        this.DOMtag
            .removeAttr("style") // Avant intégration option(s), retrait css ajouts potentiels par utilisateur pour ne pas interférer 
            .attr("data-modal", true)
            .html(modalHtmlTags)
            .css(stylesToAdd)
            .addClass(this.classShadow);


        // Affectation de la propriété 'position' en fction du paramètre saisi ou pas par l'utilisateur lors de l'initialisation du modal 
        // Pour affecter la propriété CSS 'position'
        var pos = this.settings.position;
        if(pos.substring(0, 5) == "float") {
            this.DOMtag.addClass(pos === "floatLeft" ? "float left" : (pos === "floatRight" ? "float right" : ""));
        } else if(pos == "fixed") {
            this.DOMtag.addClass(pos);
        }
        
        // Gestion fermeture encart
        var self = this;
        this.DOMtag.on('click', '#closeShortMsg:not(.hidden)', function() { self.onClose() } );
        
        // Chargement contenu texte
        this.loadData(); 
    }

    
    OriginalModal.prototype.onClose = function() {
        this.DOMtag.removeClass('display');
    }


    // Chargement données dans Template
    OriginalModal.prototype.loadData = function() {
        var self = this; // Ici obligé de passer par une variable pour faire référence à 'this' dans l'appel Ajax '$.get', sinon 'this' ne fait pas référence à l'objet 'OriginalModal' mais à l'objet jquery ajax 

        // Récupération contenu à partir du fichier .html de template
        $.get(this.settings.url, function (templates) {
            // Creation clé aléatoire pour 'scoper' le css dans le template uploadé
            self.key = self.createKey();

            var template = $(templates).filter('#tpl_default').text(); // ou var template = $(templates).filter('#tpl').html(); les 2 fonctionnent                   
            //var html = ejs.render(template, { clef: self.key });
            var html = ejs.render(template);
            
            // Pour scoper le CSS au niveau de chaque Template et éviter les conflits
            var suffix = "_default";
            html = self.scopeCSS(html, self.key, suffix);
            
            
            self.templatesText = templates;
            self.setLinkToRedim();

            // Insertion texte + optionnellement le lien pour afficher l'intégralité du message dans l'encart Big
            self.DOMtag
                .find('.TexteInfoFocusContenu')
                .attr('id', self.key + suffix) // Pour scoper le CSS du template
                .html(html)
                .append(self.redimBt);

            self.DOMtag.addClass('display'); // Apparition encart Original                     
        });
    }



    // Affichage encart original et apparition ou non shadow, lorsque redimensionnement
    OriginalModal.prototype.display = function(val) {
        if(this.settings.shadow == true) { 
            if(val) {
                this.DOMtag
                    .removeClass("setShadow") // Disparition couleur fond + Disparition contenu de l'encart autre que shadow
                    .find(".shadow").remove(); // Suppression div pour shadow
            } else {
                this.DOMtag
                    .addClass("setShadow") // Disparition couleur fond + Disparition contenu de l'encart autre que shadow
                    .prepend("<div class='shadow " + this.classShadow + "'></div>")   // Ajout dynamique div pour shadow
            }
        } else {
            // On cache ou pas l'encart original
            this.DOMtag[val ? "removeClass" : "addClass"]('Hidden');
        }
    } 


    // Création clé unique pour scoper CSS de chaque template
    OriginalModal.prototype.createKey = function() {
        var randomNumber = Math.round(Math.random() * 1000);
        var letters = "abcdefghijklmnopqrstuvwxyz";
        var indiceLetter = Math.floor(letters.length * Math.random());
        if(indiceLetter == letters.length) {indiceLetter = letters.length - 1 };
        var ramdomLetter = letters.substr(indiceLetter, 1);
        //console.log("randomNumber : " + randomNumber + " | indiceLetter : " + indiceLetter + " | ramdomLetter : " + ramdomLetter);
        return ramdomLetter + randomNumber;
    }


    // Création lien qui transforme encart en fenêtre modale
    OriginalModal.prototype.setLinkToRedim = function() {
        if(this.settings.redim) { // Si option redim à 'true'
            var classType = this.settings.redimLinkType == 'link' ? 'linkToRedimModal' : (this.settings.redimLinkType == 'button' ? 'fakeButtonToRedimModal' : '');
            this.redimBt = $(document.createElement('a'))
                                .addClass(classType)
                                .css(this.settings.redimLinkStyle)
                                .text(this.settings.redimLinkText);

            // Création évènement dessus pour création modale (clone de l'encart normal)
            var self = this;
            this.redimBt.on('click', function() { self.getDataModalRedim() }); 
        }
    }


    // Qd click sur lien : Création du modal avec contenu passé en paramètre
    OriginalModal.prototype.getDataModalRedim = function() {
        var templates = this.templatesText;
        if($(templates).filter('#tpl_redim').length > 0) {
            var templateForRedim = $(templates).filter('#tpl_redim').text();                             
            this.createCloneModal(templateForRedim);
        }
    }    


    OriginalModal.prototype.createCloneModal = function(text) {
        var clone = new CloneModal();
        clone.init(this, text);
    }
    /*================== FIN Encart original ====================*/


    /*================== Objet de l'encart cloné ====================*/
    function CloneModal() {
        Modal.call(this); // Héritage de l'objet 'Modal'
    }
    CloneModal.prototype = Object.create(Modal.prototype); // Pour hériter des méthodes de l'objet 'Modal'
    


    CloneModal.prototype.init = function(originalModal, text) {
        var settings = originalModal.settings;
        var key = originalModal.key;
    
        // Apparition overlay    
        Overlay.init();

        // Clonage de l'encart Original (--> Création encart à redimensionner)
        this.DOMtag = originalModal.DOMtag
                                        .clone()
                                        .attr('id', 'clone_modal_' + key) // Ajout clé à l'id pour le rendre unique et éviter ainsi bug si utilisateur venait à créer un tag avec l'id 'clone_modal' 
                                        .css("margin", "") // Retrait margin potentielle ajoutée dans option
                                        .removeClass("float right left fixed display")
                                        .addClass("setCentralPosition"); // Ajout CSS pour centrage vertical et horizontal

        
        // Pour scoper le CSS au niveau de chaque Template et éviter les conflits
        var suffix = "_redim";
        text = this.scopeCSS(text, key, suffix);

        // Intégration dans le DOM + largeur + insertion texte
        this.DOMtag
            .appendTo('body') // On clone l'encart et on le sort de son parent et on le met en dernier dans le body dans le DOM, afin de permettre l'animation qui suit
            .css({ width: settings.redimWidth })
            .find('.TexteInfoFocusContenu')
            .attr('id', key + suffix) // Pour scoper le CSS du template
            .html(ejs.render(text));

        // Modification sur l'icone qui ferme à l'origine l'encart original, et création event dessus
        this.btGetSmall = this.DOMtag
            .find('#closeShortMsg')
            .removeClass()
            .addClass('fas fa-compress-arrows-alt')
            .attr({ id: 'IconeResizeSmall', title: 'Réduire cette fenêtre' });
        
        // Evenement sur bouton pour redimensionner l'encart 
        var self = this;
        this.btGetSmall.on('click', function() { self.redimToOriginalSize(originalModal) });


        // Shadow sur encart originel si paramétré de la sorte, sinon encart disparait
        originalModal.display(false);

        // Récup. des données 'positions' et 'dimensions' de l'encart redimensionné avec contenu adéquat (mais pas encore visible) 
        // qui vont servir ensuite pour l'animation qui suit (de l'état 'par défaut' vers l'état 'redimensionné')
        this.getPosition();
        this.getSize(settings.redimWidth, key); // Récupération des dimensions de l'encart cloné avec largeur en valeur relative ou absolue selon saisie de l'utilisateur dans option

        originalModal.getPosition(); // Récupération de la position de l'encart original
        originalModal.getSize(settings.redimWidth, key); // Récupération des dimensions de l'encart original avec largeur en valeur absolue (px)

        // On affiche l'encart cloné avec les dimensions et positions de l'encart original, et on cache son contenu 
        this.DOMtag
            .outerHeight(originalModal.dimensions.height)
            .outerWidth(originalModal.dimensions.width) // Ici si largeur était exprimée en valeur relative (pourcentage/vw,...), est remplacé par une valeur en px
            .css({ 'top': originalModal.positions.top, 'left': originalModal.positions.left })
            .removeClass('Hidden setCentralPosition')
            .children().addClass('Hidden'); // Contenu caché

        // Animation de transition
        this.DOMtag
            .addClass('transition') 
            .animate(
                { 
                    left: this.positions.left, 
                    top: this.positions.top, 
                    width: this.dimensions.width,
                    height: this.dimensions.height
                }, // Coordonnées et taille de l'encart redimensionné pour l'animation
                settings.animationSpeed,
                function () {
                    $(this)
                        .css({ top: "", left: "", height: ""}) // Retrait des propriétés CSS qui servaient juste à ce que la transition se fasse correctement
                        .addClass('setCentralPosition')  // Ajout class CSS pour positionnement central
                        .children()
                        .removeClass('Hidden'); // Affichage du contenu de l'encart une fois redimensionné
                    
                    // Si 'calc()' pour option 'redimWidth', on remplace largeur exprimée en valeur absolue pour que '.animate()' fonctionne par valeur saisie par utilisateur
                    if(regexCSScalc.test(settings.redimWidth)) {
                        $(this).css({ width: settings.redimWidth});
                    }                    
                }
            );

    }



    // lorsque click sur modal cloné pour retourner au modal original
    CloneModal.prototype.redimToOriginalSize = function(originModal) {
        // Ascenceur de la fenetre inactif durant transition
        disableScroll();
        
        // Récupération positions de l'encart cloné
        this.getPosition();

        // Modif CSS sur l'encart cloné avant début transition afin que celle-ci puisse se faire
        this.DOMtag
            .removeClass('setCentralPosition')
            .css({ 
                top: this.positions.top, 
                left: this.positions.left 
            })
            .children().addClass('Hidden'); // Encart redimensionné : Pour sa transition, on masque son contenu

        var settings = originModal.settings;

        // Récupérations des coordonnées (positions et dimensions) de l'encart original : 
        // Recalcul car peut avoir changée entre 1er click pour redimensionner l'encart et celui-ci pour le réduire 
        // (ex: scroll sur la page peut avoir changé la position, ou/et changement taille de la fenetre peut avoir changé la taille si est exprimée en pourcentage par ex.) 
        originModal.getPosition(); 
        originModal.getSize(settings.redimWidth, originModal.key); // Ici récupération de la Largeur en valeur absolue (px) et non relative, même si l'utilisateur a rempli l'option 'originalWidth' en valeur relative (%, vw, em,...) car l'encart à redimensionner est un enfant direct du tag 'body', ce qui n'est p-ê pas le cas de l'encart original dont il doit prendre les dimensions en fin de transition


        // Retour aux dimensions et positions de l'encart original
        this.DOMtag.animate(
            { 
                left: originModal.positions.left,
                top: originModal.positions.top,
                width: originModal.dimensions.width, 
                height: originModal.dimensions.height
            }, 
            settings.animationSpeed,
            function () {
                // Disparition de l'overlay
                Overlay.display(false);
                // FadeOut de la fenêtre modale une fois redimensionné, puis suppression
                $(this).fadeOut('300', function () { $(this).remove(); });
                // Réapparition encart original
                originModal.display(true);
                // Fin inactivité de l'ascenceur de la fenêtre
                enableScroll();
            }
        );

    }
    /*================== FIN Objet de l'encart cloné ====================*/
    

    
    $.fn.setModal = function(customSettings) {
        //console.warn(this); //TEST

        var DOM_elems = this;   
        if (!('fonts' in document)) { throw Error("Votre navigateur n'est pas compatible avec cette librairie. Veuillez utiliser un navigateur plus récent.")  }
        // Il faut attendre que le chargement des fonts soit fait, car jouent un role dans le calcul des dimensions des encarts.
        document.fonts.ready.then(function() { 

        
            // Boucle pour passer en revue tous les éléments du DOM retournés par le sélecteur faisant appel à 'setModal' (par ex. si sélecteur est $('span'), va boucler sur les span)
            DOM_elems.each(function() {

                // Fusion de la config par défaut et de celle passée en paramètre par l'utilisateur
                var goodSettings = Object.assign({}, defaultSettings, customSettings);

                
                /*=================== Gestion des erreurs sur les options de 'setModal()' =================*/
                try {
                    // Test sur respect du type pour chaque option
                    for(var to of typeOptions) {
                        for(var option of to.options) {
                            if(typeof goodSettings[option] !== "undefined" && typeof goodSettings[option] !== to.type) throw new Error("La valeur pour déterminer l'option '" + option + "' doit être de type '" + to.type + "' !!");
                        }
                    }

                    // Test sur format pour options qui déterminent largeur des encarts
                    for(option of widthOptions) {
                        if(regexFormatWidth.test(goodSettings[option]) == false) throw new Error("L'option '" + option + "' est incorrect (valeur erronée => " + goodSettings[option] + ")");   
                    }

                    // Tests spécifiques pour certaines options
                    if(goodSettings.position !== "block" && goodSettings.position !== "absolute" && goodSettings.position !== "fixed" && goodSettings.position !== "floatLeft" && goodSettings.position !== "floatRight") throw new Error("Les valeurs possibles pour l'option 'position' sont: 'block', 'absolute', 'fixed, 'floatLeft' et 'floatRight'");
                    if(goodSettings.redimLinkType !== "link" && goodSettings.redimLinkType !== "button") throw new Error("Les valeurs possibles pour l'option 'redimLinkType' sont 'link' ou 'button'");
                    if(goodSettings.borderRadius < 1 || goodSettings.borderRadius > 25) throw new Error("La valeur pour l'option 'borderRadius' doit être comprise entre 1 et 25");
                } catch (error) {
                    console.error(this, `setModal() => ERREUR dans la configuration de l'encart : ${error.message}`);
                }
                /*=================== FIN : Gestion des erreurs sur les options de 'setModal' =================*/
                


                // Instantiation et Initialisation de l'objet
                var originModal = new OriginalModal();
                originModal.init(this, goodSettings); // this : Elément DOM compris dans le sélecteur

            });


        }); // Fin accolade chargement des fonts


    }


})(jQuery);