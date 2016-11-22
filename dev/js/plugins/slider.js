(function( $ ) {
    var defaults ={
        col: 1,
        dotted: false,
        swipe: true,
        arrows: true,
        duration: 500,
        carousel: true,
        autoslide: 2000,
        animation: 'ribbon' //ribbon, fade
    }

    var methods = {
        init: function(slider, options){
            var self = this;
            self.$slider = $(slider);
            self.settings = $.extend({}, defaults, self.$slider.data(), options);
            self.$wrapper = self.createWrapper();
            self.$slides = self.assignSlides();

            (self.$slides.length > 1) && self.setup();
            self.setActiveSlide( self.$slides.first() );
        },

        setup: function(){
            var self = this;

            self.assignSlidesOrder();

            //init arows
            if (self.settings.arrows == true){
                self.initArrows();
            }

            //init dots
            if (self.settings.dotted == true){
                self.initDots();
            }    

            //init swipe
            if (self.settings.swipe == true){
                self.initSwipe();
            }

            //init autoslide
            if (typeof self.settings.autoslide == 'number'){
                self.initAutoslide();
            }

            //disable arrows if last/first slide
            if (self.settings.carousel == false){
                self.$slider.on('activeSlideChanged', function(){
                    self.toggleArrowState();
                });
            }
        },

        initSwipe: function(){
            var self = this;

            //describe swipe event
            self.$slider.swipe = function(direction, callback){
                var $this = $(this),
                    isTouching = false,
                    start;

                $this.on('touchstart', startSwipe);  

                function startSwipe() {
                    if (event.touches.length == 1) {
                        start = event.touches[0].pageX;
                        isTouching = true;
                        $this.on('touchmove', swipe);
                    }
                }

                function endSwipe(){
                    $this.off('touchmove');
                    isTouching = false;
                    start = null;
                }   

                function swipe(){
                    if (isTouching){
                        var current = event.touches[0].pageX,
                        delta = start - current;

                        if (Math.abs(delta) >= 30){

                            if (delta > 0 && direction == 'left'){
                                callback();
                            }else if (delta < 0  && direction == 'right'){
                                callback();
                            }
                            endSwipe();
                        }
                    }
                    event.preventDefault();
                }
            }

            //bind swipes
            self.$slider.swipe('right', function(){
                self.bindDirectionClick('prev');
            });

            self.$slider.swipe('left', function(){
                self.bindDirectionClick('next');
            });
        },

        initArrows: function(){
            var self = this;
     
            self.$nextBtn = $('<button/>',{
                addClass: 'slider_next-btn',
                type: 'button'
            }).click(function(){
                self.bindDirectionClick('next');
            });

            self.$prevBtn = $('<button/>',{
                addClass: 'slider_prev-btn',
                type: 'button'
            }).click(function(){
                self.bindDirectionClick('prev');
            });

            self.$slider.append( self.$nextBtn, self.$prevBtn );
        },

        initDots: function(){
            var self = this;

            self.$dotsList = $('<div/>',{
                addClass: 'slider_dots'
            }).appendTo( self.$slider );

            //create dots
            self.$slides.each(function(index) {

                $('<button/>', {
                    addClass: 'slider_dot-btn',
                    type: 'button'
                }).data('slideIndex', index)
                    .appendTo(self.$dotsList);
            });

            self.$dots = self.$slider.find('.slider_dot-btn');

            //toggle active dot
            self.$slider.on('activeSlideChanged', function(){

                self.$dots.removeClass('-active')
                    .filter(function(){
                        return self.$activeSlide.index() == $(this).data('slideIndex');
                    }).addClass('-active');

            });

            //dot binding
            self.$dots.click(function(event) {
                self.bindDotClick( $(this) )
            });
        },

        initAutoslide: function(){
            var self = this;

            var autoslideInterval = setInterval(function(){  

                var slideIndex = self.$activeSlide.data('nextIndex');
                self.goToSlide( slideIndex, 'next' );

            }, self.settings.autoslide);

            self.$prevBtn.add(self.$nextBtn).add(self.$dots).one('click.clearInterval', function(){
                clearInterval(autoslideInterval);
            });

            self.$slider.one('touchstart.clearInterval', function(){
                clearInterval(autoslideInterval);
            })
        },

        bindDotClick: function( $dot ){
            var self = this,
                slideIndex = $dot.data('slideIndex');

            if ( slideIndex > self.$activeSlide.index() ){
                self.goToSlide(slideIndex, 'next');

            }else if ( slideIndex < self.$activeSlide.index() ){
                self.goToSlide(slideIndex, 'prev');
            }
        },

        bindDirectionClick: function(direction){
            var self = this,
                slideIndex = self.$activeSlide.data(direction+'Index');

            self.goToSlide( slideIndex, direction );
        },

        goToSlide: function(slideIndex, direction){
            var self = this;


            if (!self.isAnimate && slideIndex <= self.$slides.length){

                self.isAnimate = true;
                self.$nextSlide = self.$slides.eq( slideIndex );


                if (direction == 'next'){

                    var cssActiveLeft = "-100%",
                        cssNextLeft = "100%";

                }else if (direction == 'prev'){

                    var cssActiveLeft = "100%",
                        cssNextLeft = "-100%";
                }

                switch( self.settings.animation ){
                    case 'ribbon':
                        self.$activeSlide.css({zIndex: 1})
                            .animate({left: cssActiveLeft}, self.settings.duration);

                        self.$nextSlide.css({left: cssNextLeft, zIndex: 2})
                            .animate({left: 0}, self.settings.duration, function(){
                                self.$activeSlide.finish();
                                self.setActiveSlide( self.$nextSlide );
                                self.isAnimate = false;
                            });
                    break;
                    case 'fade':
                        self.$activeSlide.css({zIndex: 1});

                        self.$nextSlide.css({opacity: 0, zIndex: 2})
                            .animate({opacity: 1}, self.settings.diration, function(){
                                self.setActiveSlide( self.$nextSlide );
                                self.isAnimate = false;
                            });
                    break;
                }
            }
        },

        setActiveSlide: function( slide ){
            var self = this,
                $slide = $(slide);

            self.$slides.removeClass('-active').removeAttr('style');
            self.$activeSlide = $slide.addClass('-active');
            self.$slider.trigger('activeSlideChanged', [self.$activeSlide]);
        },

        toggleArrowState: function(){
            var self = this;

            if (typeof self.$nextSlide == 'undefined'){
                self.$prevBtn.prop('disabled', true);
                return false;
            }

            (self.$nextSlide.is( self.$slides.last() ) )
                ? self.$nextBtn.prop('disabled', true)
                : self.$nextBtn.prop('disabled', false);
            

            (self.$nextSlide.is( self.$slides.first() ) )
                ? self.$prevBtn.prop('disabled', true)
                : self.$prevBtn.prop('disabled', false);
        },

        assignSlides: function(){
            var self = this;

            if (self.settings.col != 1){

                var $elements = self.$wrapper.children('*');

                for( var i = 0; i < $elements.length; i += self.settings.col ) {
                    $elements.slice(i, i + self.settings.col ).wrapAll("<div class='slide'></div>");
                }
            }

            return self.$wrapper.children('.slide');
        },

        assignSlidesOrder: function(){
            var self = this;

            self.$slides.each(function(index, slide) {
                var $slide = $(slide);

                (index == self.$slides.length - 1)
                    ? $slide.data('nextIndex', 0)
                    : $slide.data('nextIndex', index + 1);

                (index == 0)
                    ? $slide.data('prevIndex', self.$slides.length - 1)
                    : $slide.data('prevIndex', index - 1);

            });
        },

        createWrapper: function(className){
            var self = this;
            self.$slider.wrapInner('<div class="slider_wrapper"></div>');

            return self.$slider.find('.slider_wrapper');
        },

        reinit: function(params){
            var slider = $(this);

            // if (slider.length){
            //     //remove slide wrapper
            //     if (slider.data('cells')){
            //         slider.find('.slide > *').unwrap();
            //     }

            //     //remove controls
            //     slider.find('.slider-control').remove();

            //     //remove ribbon and content
            //     slider.find('.slider-content').replaceWith(slider.find('.slider-ribbon').contents());

            //     if (params){
            //         params = $.parseJSON(params);
                    
            //         //set new params
            //         $.each(params, function (key, value) {
            //             slider.data(key, value);
            //         });
            //     }

            //     //init
            //     slider.lookSlider();
            // }else{
            //     return;
            // }
        }
    };

$.fn.lookSlider = function( method ) {

    if ( methods[method] ) {
        return methods[method].apply( this.data('lookSlider'), Array.prototype.slice.call( arguments, 1 ));
    }
    else if ( typeof method === 'object' || ! method ) {
        return this.each(function() {
            var slider = Object.create( methods );
            slider.init( this, method );
            $.data( this, 'lookSlider', slider );
        });
    }
    else{
        $.error( 'Method ' +  method + ' does not exist' );
    }   
};

})( jQuery );
        