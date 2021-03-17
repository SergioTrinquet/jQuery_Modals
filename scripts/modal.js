(function ($) {     
    
    var defaultSettings = {
        shadow: false,
        position: "absolute",
        originalWidth: "300px",
        redim: false,
        redimLink: "Le communiqué dans son intégralité",
        redimWidth: "800px",
        url: "templates/defaultTemplate.html",
        animationSpeed: 500
    }

    var htmlTag = $('html');

    /*=================== Objet masque ===================*/
    var Mask = {
        DOMelement : null,
        init: function() {  //console.log("Mask.init() => " + this.DOMelement); //TEST
            var body = $('body');
            if(this.DOMelement == null) {  // Si la balise DOM du masque n'existe pas encore (1er appel de Mask.init())...                      
                this.DOMelement = $(document.createElement('div')).addClass('msk');
                if(body.find(this.DOMelement).length == 0){ body.append(this.DOMelement) };
            }
            this.display(true);
        },
        display: function(val) {
            $(this.DOMelement)[val ? "addClass" : "removeClass"]('display');
        }
    }
    /*================== FIN Objet masque ====================*/
    
    $.fn.setModal = function(customSettings) {
        //console.warn(this); //TEST

// Ajouté le 08/03/21
var DOM_elems = this;   
if (!('fonts' in document)) { throw Error("Votre navigateur n'est pas compatible avec cette librairie. Veuillez utiliser un navigateur plus récent.")  }
// Quand chargement des fonts est fait...
document.fonts.ready.then(function() { 
// FIN Ajout le 08/03/21

    
        // Pour passer en revue les différents éléments du DOM susceptibles d'être retournés par le sélecteur (Tag du DOM qui font appel à '.setModal')
        DOM_elems.each(function() {

            var _ = this; // Chaque élément DOM compris dans le sélecteur
            //console.warn(_); //TEST

            // Fusion de la config par défaut et de celle passée en paramètre par l'utilisateur
            var goodSettings = Object.assign({}, defaultSettings, customSettings);
            
           
            /*=================== Objet dont 'OriginalModal' et 'CloneModal' héritent ===================*/
            function Modal() {
                this.DOMtag = null,
                this.dimensions = {
                    width: 0,
                    height: 0
                }
                this.positions = {
                    top: 0,
                    left: 0
                }
            }

            /* // Pour prélever Hauteur et Largeur en px de l'élément passé en paramètre
            Modal.prototype.getSize = function(el) {
                this.dimensions.height = el.outerHeight(); 
                this.dimensions.width = el.outerWidth();
                console.warn("this.dimensions.height : " + el.outerHeight() + " | this.dimensions.width : " + el.outerWidth()); //TEST 
            } */


            
            Modal.prototype.getSize_V2 = function(el, typeModal) {
                this.dimensions.height = el.outerHeight(); 
                this.dimensions.width = (typeModal == 'original' ? goodSettings.originalWidth : (typeModal == 'clone' ? goodSettings.redimWidth : null));
                console.warn(this);
                console.warn("this.dimensions.height : " + el.outerHeight() + " | this.dimensions.width : " + this.dimensions.width); //TEST 
            }

            // ESSAI
            Modal.prototype.getSize_V3 = function() {
                console.log(this.DOMtag.is("#clone_modal") ? "getSize sur le clone" : "getSize sur l'original"); //TEST
                this.dimensions.height = this.DOMtag.outerHeight();
                this.dimensions.width = this.DOMtag.is("#clone_modal") ? goodSettings.redimWidth : goodSettings.originalWidth;
                console.warn("this.dimensions.height : " + this.dimensions.height + " | this.dimensions.width : " + this.dimensions.width); //TEST 
            }
           

            // Pour obtenir position en px d'un encart
            Modal.prototype.getPosition = function() {
                this.positions.left = this.DOMtag.offset().left;
                this.positions.top = this.DOMtag.offset().top - $(document).scrollTop();
                console.log(this.DOMtag.attr("id"), '| positions.left ====> ' + this.positions.left + ' | positions.top ====> ' + this.positions.top); //TEST
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
                //console.log("nodes >>>>>>>>"); console.log(nodes); 
                //console.log("ct =>" + ct + " | idx => "+ idx.join(" - ")) //TEST
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
                    
                //console.log("FINAL >>>>>>>>"); console.log(STYLE_templateMod + DOM_templateMod); //TEST
                return STYLE_templateMod + DOM_templateMod;
            }
            /*================== FIN Objet dont 'OriginalModal' et 'CloneModal' héritent ====================*/



            /*================== Encart original ====================*/
            function OriginalModal() {
                Modal.call(this); // Héritage de l'objet 'Modal'

                this.redimBt = "",
                this.templatesText = null,
                this.key = null
            }
            OriginalModal.prototype = Object.create(Modal.prototype); // Pour hériter des méthodes de l'objet 'Modal'


            OriginalModal.prototype.init = function() {
                //console.warn("==========================="); console.log(_); console.log(this); // TEST
                this.DOMtag = $(_);

                // Construction texte HTML pour encart
                var modalHtmlTags = "\
                    <i class='fas fa-times " + (goodSettings.closable ? "" : "hidden") + "' id='closeShortMsg'></i>\
                    <div class='TexteInfoFocus' " + ('padding' in goodSettings ? "style='padding: " + goodSettings.padding + "'" : "") + " >\
                        <div class='TexteInfoFocusContenu'></div>\
                    </div>";

                this.DOMtag
                    .attr("data-modal", true)
                    .html(modalHtmlTags)
                    .css({ width: goodSettings.originalWidth }); // ou 'this.DOMtag.outerWidth(goodSettings.originalWidth);' => Pour fixer largeur encart si dans paramètres de l'utilisateur : Ajouté le 12/03/21

                // Option 'background-color', 'margin' et'border-radius'
                if('bgColor' in goodSettings){ this.DOMtag.css({"background-color": goodSettings.bgColor}) };   
                if('margin' in goodSettings){ this.DOMtag.css({"margin": goodSettings.margin }) };
                if('borderRadius' in goodSettings){ this.DOMtag.css({"border-radius": goodSettings.borderRadius }) };


                // Affectation de la propriété 'position' en fction du paramètre saisi ou pas par l'utilisateur lors de l'initialisation du modal 
                // Pour affecter la propriété CSS 'position'
                var pos = goodSettings.position;
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
                $.get(goodSettings.url, function (templates) {
                    // Creation clé aléatoire pour 'scoper' le css dans le template uploadé
                    self.key = self.createKey();     //console.warn("KEY GENERATION : " + self.key); //TEST

                    var template = $(templates).filter('#tpl_default').text(); // ou var template = $(templates).filter('#tpl').html(); les 2 fonctionnent                   
                    //var html = ejs.render(template, { clef: self.key });
                    var html = ejs.render(template);
                    
                    // Pour scoper le  CSS au niveau de chaque Template et éviter les conflits
                    var suffix = "_default";
                    html = self.scopeCSS(html, self.key, suffix);
                    
                    
                    self.templatesText = templates;
                    self.redimOrNot();

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
                if(typeof val === "undefined") { throw new Error("L'argument permettant l'apparition ou non de l'encart à l'état original ou bien sa shadow n'existe pas!"); }
                if(typeof val !== "boolean") { throw new Error("L'argument permettant l'apparition ou non de l'encart à l'état original ou bien sa shadow doit être un booléen"); }

                if(goodSettings.shadow == true) { 
                    if(val) {
                        this.DOMtag
                            .removeClass("setShadow") // Disparition couleur fond + Disparition contenu de l'encart autre que shadow
                            .find(".shadow").remove(); // Suppression div pour shadow
                    } else {
                        this.DOMtag
                            .addClass("setShadow") // Disparition couleur fond + Disparition contenu de l'encart autre que shadow
                            .prepend("<div class='shadow'></div>")   // Ajout dynamique div pour shadow
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


            
            OriginalModal.prototype.createCloneModal = function(text) {
                var clone = new CloneModal();
                clone.init(this.DOMtag, text, this.key);
            }

            OriginalModal.prototype.redimOrNot = function() {
                if(goodSettings.redim) { // Si option redim à 'true'
                    this.getLinkToRedim(); // Affectation valeur à lien pour redimensionner
                } 
            }

            // gestion lien pour agrandir encart
            OriginalModal.prototype.getLinkToRedim = function() {
                this.redimBt = $(document.createElement('a'))
                                    .addClass('linkToRedimModal')
                                    .text(goodSettings.redimLink);

                // Création évènement dessus pour créer encart Big (clone de l'encart normal)
                var self = this;
                this.redimBt.on('click', function() { self.getDataModalRedim() }); 
            }

            // Pour agrandir l'encart qd click sur lien
            OriginalModal.prototype.getDataModalRedim = function() {
                var templates = this.templatesText;
                if($(templates).filter('#tpl_redim').length > 0) {
                    var templateForRedim = $(templates).filter('#tpl_redim').text(); // ou var template = $(templates).filter('#tpl').html(); les 2 fonctionnent                             
                    this.createCloneModal(templateForRedim);
                }
            }
            /*================== FIN Encart original ====================*/



            /*================== Objet de l'encart cloné ====================*/
            function CloneModal() {
                Modal.call(this); // Héritage de l'objet 'Modal'
            }
            CloneModal.prototype = Object.create(Modal.prototype); // Pour hériter des méthodes de l'objet 'Modal'



            CloneModal.prototype.init = function(modalToClone, text, key) {
                // Apparition masque    
                Mask.init();

                // Clonage de l'encart Original (--> Création encart à redimensionner)
                this.DOMtag = modalToClone
                                    .clone()
                                    .attr('id', 'clone_modal')
                                    .css("margin", "") // Retrait margin
                                    .removeClass()
                                    .addClass("setCentralPosition"); // Ajout CSS pour centrage vertical et horizontal

                
                // Pour scoper le CSS au niveau de chaque Template et éviter les conflits
                var suffix = "_redim";
                text = this.scopeCSS(text, key, suffix);

                // Intégration dans le DOM + largeur + insertion texte
                this.DOMtag
                    .appendTo('body') // On clone l'encart et on le sort de son parent et on le met en dernier dans le body dans le DOM, afin de permettre l'animation qui suit
                    .css({ width: goodSettings.redimWidth })
                    .find('.TexteInfoFocusContenu')
                    .attr('id', key + suffix) // Pour scoper le CSS du template
                    .html(ejs.render(text));

                // Affectation d'un identifiant unique pour l'icone qui ferme l'encart Big..., et création event dessus
                this.btGetSmall = this.DOMtag
                    .find('#closeShortMsg')
                    .removeClass()
                    .addClass('fas fa-compress-arrows-alt')
                    .attr({ id: 'IconeResizeSmall', title: 'Réduire cette fenêtre' });
                
                // Evenement sur bt pour redimensionner l'encart 
                var self = this;
                this.btGetSmall.on('click', function() { self.redim_Small() });


                // Shadow sur encart originel si paramétré de la sorte, sinon encart disparait
                originModal.display(false);


                // Ici récup. des données 'positions' et 'dimensions' de l'encart redimensionné avec contenu adéquat (mais pas encore visible) 
                // qui vont servir ensuite pour l'animation qui suit (de l'état 'par défaut' vers l'état 'redimensionné')
                this.getPosition();
                //this.getSize_V2(this.DOMtag, 'clone');
                this.getSize_V3();
                console.log("ALLER >>>>> this.positions", this.positions); console.log("ALLER >>>>> this.dimensions", this.dimensions);  //TEST


                // Récupération de la position du modal original avec le contenu chargé
                originModal.getPosition();
                // Récupération des dimensions du modal original avec le contenu chargé
                //originModal.getSize_V2(originModal.DOMtag, 'original');
                originModal.getSize_V3();

                // On affiche l'encart cloné avec les dimensions et positions de l'encart original, et on cache son contenu 
                this.DOMtag
                    .outerHeight(originModal.dimensions.height)
                    .outerWidth(originModal.DOMtag.outerWidth()) // Permet de remplacer le Pourcentage de la largeur si c'est le cas, par une valeur en px
                    .css({ 'top': originModal.positions.top, 'left': originModal.positions.left })
                    .removeClass('Hidden setCentralPosition')
                    .children().addClass('Hidden');

                
                // On fait l'animation de transition
                this.DOMtag
                    .addClass('transition') 
                    .animate(
                        { 
                            left: this.positions.left, 
                            top: this.positions.top, 
                            width: this.dimensions.width,
                            height: this.dimensions.height
                        }, // Coordonnées et taille de l'encart redimensionné pour l'animation
                        goodSettings.animationSpeed,
                        function () {
                            $(this)
                            .css({ top: "", left: "", height: ""}).addClass('setCentralPosition') // Retrait des propriétés CSS qui serveaient juste à ce que la transition se fasse correctement + ajout class CSS pour positionnement central
                            .children()
                            .removeClass('Hidden'); // Affichage du contenu de l'encart une fois redimensionné
                        }
                    );

            }


            // lorsque click sur modal cloné pour retourner au modal original
            CloneModal.prototype.redim_Small = function() {

                // Retrait de l'ascenceur de la fenetre durant transition
                htmlTag.addClass('noscroll');

                
                // Récupérations des coordonnées (positions et dimensions) de l'encart cloné
                this.getPosition();
                console.log("RETOUR >>>>> (CloneModal début) this.positions", this.positions); console.log("RETOUR >>>>> (CloneModal début) this.dimensions", this.dimensions);  //TEST
                

                // Modif CSS sur l'encart cloné avant début transition afin que celle-ci puisse se faire
                this.DOMtag
                    .removeClass('setCentralPosition')
                    .css({ top: this.positions.top, left: this.positions.left })
                    .children().addClass('Hidden'); // Encart redimensionné : Pour sa transition, on masque son contenu


                // Récupérations des coordonnées (positions et dimensions) de l'encart original : 
                // Recalcul car peut avoir changée entre 1er click pour redimensionner l'encart et celui-ci pour le réduire 
                // (ex: scroll sur la page peut avoir changé la position, ou/et changement taille de la fenetre peut avoir changé la taille si est exprimée en pourcentage par ex.) 
                originModal.getPosition();
                //originModal.getSize(originModal.DOMtag); 
                console.log("RETOUR >>>>> (originalModal) originModal.positions => From", this.positions, "To", originModal.positions); // TEST
                console.log("RETOUR >>>>> (originalModal) originModal.dimensions => From", this.dimensions, "To", originModal.dimensions);  //TEST


                // Retour aux dimensions et positions de l'encart original
                this.DOMtag.animate(
                    { 
                        left: originModal.positions.left,
                        top: originModal.positions.top,
                        //width: originModal.dimensions.width, 
                        //height: originModal.dimensions.height,
                        width: originModal.DOMtag.outerWidth(), // Valeur désirée en px et non relative en % car l'encart à redimensionner est un enfant direct du tag 'body', ce qui n'est p-ê pas le cas de l'encart original dont il doit prendre les dimensions en fin de transition
                        height: originModal.DOMtag.outerHeight() 
                    }, 
                    goodSettings.animationSpeed,
                    function () {
                        Mask.display(false);  // Disparition du masque

                        // FadeOut sur l'encart Big une fois redimensionné, puis suppression
                        $(this).fadeOut('300', function () { $(this).remove(); });
                        // Réapparition encart original
                        originModal.display(true);
                        // Retrait class empechant affichage scroller
                        htmlTag.removeClass('noscroll');
                    }
                );

            }
            /*================== FIN Objet de l'encart cloné ====================*/




            // Instantiation et Initialisation de l'objet
            var originModal = new OriginalModal();
            originModal.init();

        });


});// Ajouté le 08/03/21


    }


})(jQuery);