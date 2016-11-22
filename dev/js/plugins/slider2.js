(function( $ ) {
    var methods = {
        init: function(element){
            var self = this;
            self.element = $(element);
            self.ribbon = self.createWrapper('slider-ribbon');
            self.slider = self.createWrapper('slider-content');
            self.cell = self.ribbon.children('div');
            self.shiftWidth = self.slider.width() + parseInt(self.cell.css('padding-left')) + parseInt(self.cell.css('padding-right'));
            self.slidesAmount = Math.ceil(self.cell.length / (self.element.data('cells') || 1) );
            self.slides = self.divideSlides().width( self.shiftWidth );

            self.steps = 0;
            self.isAnimated = false;
            self.setup();
        },

        setup: function(){
            var self = this;

            $(window).resize(function(event) {
                self.resize();
            });

            self.element.data('paginator') && self.initPagination();

            if (self.element.data('touch') ){

                if (self.slides.length > 1){
                    self.slider.on("swipeleft",function(){
                        self.disableAutoslide();
                        self.moveSlideNext();
                    });

                    self.slider.on("swiperight",function(){
                        self.disableAutoslide();
                        self.moveSlidePrev();
                    });
                }

            }

            if (self.element.data('arrows')){

                self.slideNextBtn = $('<button/>',{
                    addClass: 'slider-next-btn',
                    type: 'button',
                    'data-icon': '>'
                });

                self.slidePrevBtn = $('<button/>',{
                    addClass: 'slider-prev-btn',
                    type: 'button',
                    'data-icon': '<'
                });

                if (self.slides.length > 1)
                    $('<div class="slider-control"></div>').append(self.slidePrevBtn, self.slideNextBtn).insertAfter(self.slider);
            }

            if (self.element.data('animate') == 'fade'){

                self.paginatorBtn.first().trigger('click');
            }else if (self.element.data('arrows')){

                self.slidePrevBtn.click(function(event) {
                    self.disableAutoslide();
                    self.moveSlidePrev();
                });

                self.slideNextBtn.click(function(event) {
                    self.disableAutoslide();
                    self.moveSlideNext();
                });
            }

            if (self.element.data('carousel') == false){
                self.slidePrevBtn.prop('disabled', true);
                self.slider.off('swiperight');
            }


            if (self.element.data('podium')){
                self.initPodium();
            }else{
                self.makeSlideActive(0);
            }

            if (self.element.data('autoslide')){
                self.autoSlide = setInterval(function(){
                    if (!self.slideNextBtn.prop('disabled')){
                        self.moveSlideNext();
                    }else{
                        self.ribbon.stop().animate({left: 0}, 500);
                        self.steps = 0;
                        self.makeSlideActive(self.steps);
                        self.slidePrevBtn.prop('disabled', true);
                        self.slideNextBtn.prop('disabled', false);
                    }
                }, 5000);
            }
        },

        resize: function(){
            var self = this;

            self.shiftWidth = self.slider.width() + parseInt(self.cell.css('padding-left')) + parseInt(self.cell.css('padding-right'));
            self.ribbon.find('.slide').width( self.shiftWidth );
            self.goToSlide(self.activeSlide.index());
        },

        initPodium: function(){
            var self = this;
            var middleItem = Math.floor(self.slidesAmount / 2);
            self.goToSlide(middleItem);

            self.slidePrevBtn.prop('disabled', false);
            self.slider.on('swiperight', function(){
                self.moveSlidePrev();
            });
        },

        initPagination: function(){
            var self = this;

            self.paginator = $('<ul/>', {
                addClass: 'slider-paginator'
            }).appendTo(self.element);

            for(var i = 0; i < self.slidesAmount; i++){
                self.paginator.append('<li><button type="button" data-slide="' + i +'"></button></li>')
            }

            self.paginatorBtn = self.paginator.find('li button');

            self.paginatorBtn.click(function(event) {
                self.disableAutoslide();
                (self.element.data('animate') == 'fade')
                    ? self.goToSlide( $(this).data('slide'), 600, true)
                    : self.goToSlide( $(this).data('slide'), 600);

                $(this).closest('ul').find('button').removeClass('active');
                $(this).addClass('active');
            });
        },

        moveSlideNext: function(){
            var self = this;
            if ( !self.isAnimated ){
                self.steps++;
                self.isAnimated = true;

                if (self.element.data('podium')){
                    var activeSlidePos = self.activeSlide.index(),
                        firstSlide = self.slides.first().detach().appendTo(self.ribbon),
                        position = parseInt(self.ribbon.css('left'));

                    self.ribbon.css({left: position + self.shiftWidth})
                        .stop().animate({left: position}, 600, function(){
                        self.isAnimated = false;
                    });

                    self.slides = self.divideSlides();
                    self.makeSlideActive(activeSlidePos);

                }else if ( self.steps === self.slidesAmount ){
                    var position = parseInt(self.ribbon.css('left')),
                        tempSlide = self.slides.first().clone().addClass('temporary');
                    tempSlide.appendTo(self.ribbon);
                    self.makeSlideActive(0);
                    self.ribbon.stop().animate({left: position - self.shiftWidth}, 600, function(){
                        self.ribbon.css({left: 0});
                        tempSlide.detach();
                        self.steps = 0;
                        self.isAnimated = false;
                    });
                    self.element.data('pages') && self.paginator.find('span').first().text(1);
                }else{
                    self.makeSlideActive(self.steps);
                    var position = parseInt(self.ribbon.css('left'));
                    self.ribbon.stop().animate({left: position - self.shiftWidth}, 600, function(){
                        self.isAnimated = false;
                    });
                    self.element.data('pages') && self.paginator.find('span').first().text(self.steps + 1);

                    if( (self.steps === self.slidesAmount - 1) && (self.element.data('carousel') == false)){
                        self.slideNextBtn.prop('disabled', true);
                        self.slider.off('swipeleft');
                    }
                    self.slidePrevBtn.prop('disabled', false);
                    self.slider.on("swiperight",function(){
                        self.moveSlidePrev();
                    });
                }
            }
        },

        moveSlidePrev: function(){
            var self = this;

            if ( !self.isAnimated ){
                self.isAnimated = true;

                if (self.element.data('podium')){
                    var activeSlidePos = self.activeSlide.index(),
                        lastSlide = self.slides.last().detach().prependTo(self.ribbon),
                        position = parseInt(self.ribbon.css('left'));

                    self.ribbon.css({left: position - self.shiftWidth})
                        .stop().animate({left: position}, 600, function(){
                        self.isAnimated = false;
                    });

                    self.slides = self.divideSlides();
                    self.makeSlideActive(activeSlidePos);

                }else if ( self.steps === 0 ){

                    var tempSlide = self.slides.first().clone().addClass('temporary');
                    tempSlide.appendTo(self.ribbon);
                    
                    self.makeSlideActive(self.slidesAmount - 1);

                    self.ribbon.css({left: - (self.shiftWidth * self.slidesAmount)});
                    var position = parseInt(self.ribbon.css('left'));

                    self.ribbon.stop().animate({left: position + self.shiftWidth}, 600, function(){
                        tempSlide.detach();
                        self.steps = self.slidesAmount - 1;
                        self.isAnimated = false;
                    });

                    self.element.data('pages') && self.paginator.find('span').first().text(3);
                }else{
                    self.makeSlideActive(self.steps - 1);

                    var position = parseInt(self.ribbon.css('left'));
                    self.ribbon.stop().animate({left: position + self.shiftWidth}, 600, function(){
                        self.isAnimated = false;
                    });

                    self.element.data('pages') && self.paginator.find('span').first().text(self.steps);

                    if( (self.steps === 1) && (self.element.data('carousel') == false)){
                        self.slidePrevBtn.prop('disabled', true);  
                        self.slider.off('swiperight');
                    }
                    self.slideNextBtn.prop('disabled', false);
                    self.slider.on("swipeleft",function(){
                        self.moveSlideNext();
                    });
                }
                
                self.steps--;
            }
        },

        goToSlide: function(number, time, fade){
            var self = this.hasOwnProperty('element')
                ? this
                : $(this).data().lookSlider;

            if (fade){
                var tempRibbon = self.ribbon.clone();
                tempRibbon.insertBefore(self.ribbon).css({
                    position: 'absolute',
                    top: 0
                });

                self.ribbon.css({opacity: 0})
                    .animate({opacity: 1}, time, function(){
                    tempRibbon.remove();
                });
            }
            
            self.ribbon.stop(true, true).animate({left: -self.shiftWidth * number}, fade ? 0 : time );
            self.steps = number;
            self.makeSlideActive(number);
        },

        disableAutoslide: function(){
            var self;

            if (this.hasOwnProperty('element')){
                self = this;
            }else{
                self = $(this).data().lookSlider;
            }

            clearInterval(self.autoSlide);
        },

        divideSlides: function(){

            var self = this;
            for( var i = 0; i < self.cell.length; i += self.element.data('cells') ) {
                self.cell.slice(i, i + self.element.data('cells') ).wrapAll("<div class='slide'></div>");
            }

            return self.ribbon.find('.slide');
        },

        createWrapper: function(className){
            var self = this;
            self.element.wrapInner('<div class="'+className+'"></div>');

            return self.element.find('.'+className);
        },

        makeSlideActive: function(number){
            var self = this;
            self.activeSlide = self.slides.eq(number)
                .addClass('active')
                .siblings()
                .removeClass('active')
                .end();

            if (self.element.data('paginator')){
                $(self.paginatorBtn)
                    .removeClass('active')
                    .eq(number)
                    .addClass('active');
            }
        },

        reinit: function(params){
            var slider = $(this);

            if (slider.length){
                //remove slide wrapper
                if (slider.data('cells')){
                    slider.find('.slide > *').unwrap();
                }

                //remove controls
                slider.find('.slider-control').remove();

                //remove ribbon and content
                slider.find('.slider-content').replaceWith(slider.find('.slider-ribbon').contents());

                if (params){
                    params = $.parseJSON(params);
                    
                    //set new params
                    $.each(params, function (key, value) {
                        slider.data(key, value);
                    });
                }

                //init
                slider.lookSlider();
            }else{
                return;
            }
        }
    };

$.fn.lookSlider = function( method ) {

    if ( methods[method] ) {
        return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    }
    else if ( typeof method === 'object' || ! method ) {
        return this.each(function() {
            var slider = Object.create( methods );
            slider.init( this );
            $.data( this, 'lookSlider', slider );
        });
    }
    else{
        $.error( 'Method ' +  method + ' does not exist' );
    }   
};

})( jQuery );
    
        