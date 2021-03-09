(function ($) {     
    
    var defaultSettings = {
        shadow: false,
        position: "absolute",
        originalWidth: "200px",
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
        //this.each(function() { // Mis en comm. le 08/03/21
        DOM_elems.each(function() {  // Ajouté le 08/03/21

            var _ = this; // Chaque élément DOM compris dans le sélecteur
            //console.warn(_); //TEST

            // Fusion de la config par défaut et de celle passée en paramètre par l'utilisateur
            var goodSettings = Object.assign({}, defaultSettings, customSettings);
            
           
            /*=================== Objet dont 'OriginalModal' et 'CloneModal' héritent ===================*/
            function Modal() {
                this.dimensions = {
                    width: 0,
                    height: 0
                }
                this.positions = {
                    top: 0,
                    left: 0
                }
            }

            // Pour prélever Hauteur et Largeur de l'élément passé en paramètre
            Modal.prototype.getSize = function(el) {
                this.dimensions.height = el.outerHeight(); 
                this.dimensions.width = el.outerWidth();
                //console.warn("this.dimensions.height : " + el.outerHeight() + " | this.dimensions.width : " + el.outerWidth()); //TEST 
            }

            // Voir si utile
            Modal.prototype.checkParamWidthFromUser = function(el, typeModal) {
                var widthSettings = (typeModal == 'original' ? goodSettings.originalWidth : (typeModal == 'clone' ? goodSettings.redimWidth : null));
                if(widthSettings == null) {
                    throw new Error("Erreur de paramétrage à propos de la largeur de l'encart");
                }
                el.css({ width: widthSettings });
            }

            // Peut-être à bouger dans OriginalModal
            Modal.prototype.getPosition = function(el) {
                this.positions.left = el.offset().left;
                //this.positions.top = (goodSettings.position != "fixed" ? (el.offset().top - $(document).scrollTop()) : el.offset().top);
                this.positions.top = el.offset().top - $(document).scrollTop();
                console.log(this); //TEST
                console.log('positions.left ====> ' + this.positions.left + ' | positions.top ====> ' + this.positions.top); //TEST
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

                this.DOMshadow = null,
                this.DOMmodal = null,
                this.redimBt = "",
                this.templatesText = null,
                this.key = null
            }
            OriginalModal.prototype = Object.create(Modal.prototype); // Pour hériter des méthodes de l'objet 'Modal'


            OriginalModal.prototype.init = function() {  
                //console.log(_); console.log(this); // TEST

                var el = $(_);
                el
                    .attr("data-modal", true)
                    .html("<div class='shadow'></div>\
                            <div class='modal'>\
                                <i class='fas fa-times' id='closeShortMsg'></i>\
                                <div class='TexteInfoFocus'>\
                                    <div class='TexteInfoFocusContenu'></div>\
                                </div>\
                            </div>");

                this.DOMmodal = el.find('.modal');
                this.DOMshadow = el.find('.shadow');

                // Pour fixer largeur encart si dans paramètres de l'utilisateur
                //this.DOMmodal.css({ width: goodSettings.originalWidth }); // 
                this.checkParamWidthFromUser(this.DOMmodal, 'original');
                
                var self = this;
                el.on('click', '#closeShortMsg', function() {self.onClose(el)} ); // Gestion fermeture encart
                
                this.loadData(); // Chargement contenu texte
            }



            OriginalModal.prototype.onClose = function(el) {
                el.removeClass('display');
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
                    self.DOMmodal
                        .find('.TexteInfoFocusContenu')
                        .attr('id', self.key + suffix) // Pour scoper le CSS du template
                        .html(html)
                        .append(self.redimBt);


                    $(_).addClass('display'); // Apparition encart Original                     
         
                    // On relève les dimensions de l'encart Original
                    self.getSize(self.DOMmodal);
                    
                    // On affecte la hauteur du calque en dessous de l'encart
                    self.setSize(self.DOMshadow);
        
                    // Affectation de la propriété 'position' en fction du paramètre saisi ou pas par l'utilisateur lors de l'initialisation du modal
                    self.setCSSPositionProperty();
                });
            }

            // Option shadow
            OriginalModal.prototype.setShadow = function() {
                if(goodSettings.shadow == true) { this.DOMshadow.addClass("visible") }
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

            
            OriginalModal.prototype.setSize = function(el) {
                el
                    .outerHeight(this.dimensions.height)
                    .outerWidth(this.dimensions.width);
            }


            // Pour affecter la propriété CSS 'position'
            OriginalModal.prototype.setCSSPositionProperty = function() {
                var el = $(_);
                var pos = goodSettings.position;
                var isFloat = (pos.substring(0, 5) == "float");

                if(isFloat) {
                    this.setSize(el);
                    el.addClass(pos === "floatLeft" ? "float left" : (pos === "floatRight" ? "float right" : ""));
                } else {
                    el.addClass(pos);
                }
            }

            /*V2*/
            OriginalModal.prototype.createCloneModal = function(text) {
                var clone = new CloneModal();
                clone.init(this.DOMmodal, text, this.key);
            }

            OriginalModal.prototype.redimOrNot = function() {
                if(goodSettings.redim) { // Si option redim à 'true'
                    this.getLinkToRedim(); // Affectation valeur à lien pour redimensionner
                } 
            }

            // gestion lien pour agrandir encart
            OriginalModal.prototype.getLinkToRedim = function() {
                var settings = goodSettings;
                this.redimBt = $(document.createElement('a'))
                                    .addClass('linkToRedimModal')
                                    .text(settings.redimLink != "" ? settings.redimLink : "Le communiqué dans son intégralité");

                // Création évènement dessus pour créer encart Big (clone de l'encart normal)
                var self = this;
                this.redimBt.on('click', function() { self.redim_Big() }); 
            }

            // Pour agrandir l'encart qd click sur lien
            OriginalModal.prototype.redim_Big = function() {
                var templates = this.templatesText;
                if($(templates).filter('#tpl_redim').length > 0) {
                    var templateForRedim = $(templates).filter('#tpl_redim').text(); // ou var template = $(templates).filter('#tpl').html(); les 2 fonctionnent          
                    
                    this.setShadow();

                    this.getPosition(this.DOMmodal);
                    
                    // 2 façons d'appeler l'objet CloneModal à partir de cet objet ('OriginalModal') :
                    this.createCloneModal(templateForRedim); /*V1 et V2*/
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

                // Clonage de l'encart Original (--> Création Encart Big)
                this.DOMelement = modalToClone.clone().attr('id', 'clone_modal');

                //console.warn(text); //TEST
                // Pour scoper le  CSS au niveau de chaque Template et éviter les conflits
                var suffix = "_redim";
                text = this.scopeCSS(text, key, suffix);

                // Intégration dans le DOM + largeur + insertion texte
                this.checkParamWidthFromUser(this.DOMelement, 'clone');
                this.DOMelement
                    .appendTo('body') // On clone l'encart et on le sort de son parent et on le met en dernier dans le body dans le DOM, afin de permettre l'animation qui suit
                    //.css({width: (goodSettings.redimWidth != null ? goodSettings.redimWidth : '')})    // Pour déterminer largeur qd encart est redimensionné : Si largeur custom demandée via l'attribut 'data-redim-width', elle s'applique, sinon retrait d'une potentielle largeur custom  via l'attribut 'data-original-width'
                    .find('.TexteInfoFocusContenu')
                    .attr('id', key + suffix) // Pour scoper le CSS du template
                    .html(ejs.render(text));

                // Affectation d'un identifiant unique pour l'icone qui ferme l'encart Big..., et création event dessus
                this.btGetSmall = this.DOMelement
                    .find('#closeShortMsg')
                    .removeClass()
                    .addClass('fas fa-compress-arrows-alt')
                    .attr({ id: 'IconeResizeSmall', title: 'Réduire cette fenêtre' });
                
                // Evenement sur bt pour redimensionner l'encart 
                var self = this;
                this.btGetSmall.on('click', function() { self.redim_Small() });


                // Centrage de l'encart Big 
                this.getCentralPosition(this.DOMelement);
                
                var self = this;
                $(window).resize(function () {
                    self.getCentralPosition(self.DOMelement);
                    self.DOMelement.css({
                        'top': self.positions.top, 
                        'left': self.positions.left 
                    });                 
                });

                // On cache le 'modal' original
                theModal.DOMmodal.addClass('Hidden');

                // Pour connaitre dimensions de l'encart Big pour l'animation qui suit
                this.getSize(this.DOMelement);

                // On affiche l'encart cloné avec les dimensions et positions de l'encart original,  et on cache son contenu 
                this.DOMelement
                    .outerHeight(theModal.dimensions.height)
                    .outerWidth(theModal.dimensions.width)
                    .css({ 'top': theModal.positions.top, 'left': theModal.positions.left })
                    .removeClass('Hidden')
                    .children().addClass('Hidden');

                // On fait l'animation de transition
                this.DOMelement
                    .addClass('transition') 
                    .animate(
                        { 
                            left: this.positions.left, 
                            top: this.positions.top, 
                            width: this.dimensions.width,
                            height: this.dimensions.height
                        }, // Coordonnées et taille de l'encart big pour l'animation
                        goodSettings.animationSpeed,
                        function () {
                            $(this)
                            .children()
                            .removeClass('Hidden'); // Affichage du contenu de l'encart Big
                        }
                    );

            }


            // Pour prélever position de l'élément passé en paramètre
            CloneModal.prototype.getCentralPosition = function(el) {
                this.positions.left = ($(window).width() - el.outerWidth()) / 2;
                this.positions.top = ($(window).height() - el.outerHeight()) / 2;
            }



            // lorsque click sur modal cloné pour retourner au modal original
            CloneModal.prototype.redim_Small = function() {
                var originalModalDOMelement = theModal.DOMmodal; 
                //console.log(theModal); //TEST
                //console.log(theModal.DOMmodal); //TEST

                htmlTag.addClass('noscroll'); // Retrait de l'ascenceur de la fenetre durant transition

                $(this.DOMelement).children().addClass('Hidden'); // Encart Big : Pour sa transition, on masque son contenu

                // Recalcul de la position car peut avoir changée (scroll entre click pour agrandir l'encart et ce click pour le réduire) 
                //this.getPosition(originalModalDOMelement); /*V2*/
                theModal.getPosition(originalModalDOMelement); /*V1*/

                // Retour aux dimensions et positions de l'encart original
                this.DOMelement.animate(
                    { 
                        left: theModal.positions.left, //V1
                        top: theModal.positions.top, //V1
                    /* left: this.positions.left,   //V2
                        top: this.positions.top,   //V2
                         */width: theModal.dimensions.width, 
                        height: theModal.dimensions.height 
                    }, 
                    goodSettings.animationSpeed,
                    function () {
                        Mask.display(false);  // Disparition du masque

                        // FadeOut sur l'encart Big une fois redimensionné, puis suppression
                        $(this).fadeOut('300', function () { $(this).remove(); });

                        //this.checkParamWidthFromUser(theModal.DOMmodal, 'original');
                        theModal.DOMmodal
                            .css({ width: goodSettings.originalWidth }) // pour largeur encart original
                            .removeClass('Hidden')
                            .removeAttr('id');

                            htmlTag.removeClass('noscroll');
                    }
                );

            }
            /*================== FIN Objet de l'encart cloné ====================*/




            // Instantiation et Initialisation de l'objet
            var theModal = new OriginalModal();
            theModal.init();

        });


});// Ajouté le 08/03/21


    }


})(jQuery);