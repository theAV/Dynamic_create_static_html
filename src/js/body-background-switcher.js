!(function (win, doc, $) {

    var BBS = function (element, options) {
        this.element = element;
        this.settings = $.extend({}, BBS.Options, options);
        this.thumbs = this.element.children();
        this.bannerContainer = '.' + this.settings.bannerContainer;
    }

    BBS.Options = {
        containerCls: 'bbs_container',
        bannerContainer: 'banner_bg',
        easeingTime: '850ms',
        easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
        responsive: true,
        breackPoint: 1024
    }

    BBS.prototype.init = function () {
        this.setup(this.animationHandler.bind(this));
    }

    BBS.prototype.uniqId = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    BBS.prototype.setup = function (callback) {
        var element = this.element,
            thumbs = this.thumbs;

        if ($(this.bannerContainer).length === 0) {
            $('<section/>', {
                class: this.settings.bannerContainer,
                role: 'presentation'
            }).insertBefore(element);
        }

        element.addClass(this.settings.containerCls);
        element.attr('role', 'presentation')

        $.each(thumbs, $.proxy(function (indexInArray, valueOfElement) {
            var thumb_elem = $(valueOfElement);
            if ($(this.bannerContainer).children('figure').length < 4) {
                thumb_elem.attr({
                    role: 'thumbnail',
                    'aria-visible': false,
                    id: this.uniqId(),
                    'aria-controls': 'figure_' + this.uniqId()
                })

                $('<figure/>').css({
                    backgroundImage: 'url(' + thumb_elem.data('bg') + ')',
                    zIndex: 1,
                    opacity: 0,
                    'transition-property': ' opacity',
                    'transition-duration': this.settings.easeingTime,
                    'transition-timing-function': this.settings.easing

                }).appendTo('.' + this.settings.bannerContainer).attr({
                    role: 'region',
                    'aria-labelledby': thumb_elem.attr('id'),
                    id: thumb_elem.attr('aria-controls')
                })
            }
            if (this.settings.responsive && $(win).width() <= this.settings.breackPoint) {
                element.addClass('responsive');
                $(this.bannerContainer).hide();
                thumb_elem.css({
                    backgroundImage: 'url(' + thumb_elem.data('bg') + ')'
                });
                element.find('.active').removeClass('active');
                element.find('.normal').removeClass('normal');
            }

            if ((thumbs.length - 1) == indexInArray) {
                thumbs.first().attr({
                    'aria-visible': true,
                    'aria-disabled': true
                })
                $(('.' + this.settings.bannerContainer)).children().first().css({
                    zIndex: 2,
                    opacity: 1,
                    'transition-duration': this.settings.easeingTime,
                    'transition-timing-function': this.settings.easing
                })

                if (typeof callback === 'function') {
                    if (this.settings.responsive && $(win).width() > this.settings.breackPoint) {
                        element.removeClass('responsive');
                        $(this.bannerContainer).show();

                        $('[aria-controls]').css({
                            backgroundImage: 'none'
                        });
                        callback();
                    }
                }
            }
        }, this));

    }

    BBS.prototype.initAnim = function (e) {
        var target = $(e.target);
        var id = target.attr('aria-controls');

        var activeID = $('[aria-visible=true]').attr('aria-controls');

        $('#' + activeID).css({
            opacity: 0,
            zIndex: 1,
            'transition-duration': this.settings.easeingTime,
            'transition-timing-function': this.settings.easing
        })

        $('[aria-disabled=true]').removeAttr('aria-disabled').attr({
            'aria-visible': false
        });

        target.attr({
            'aria-disabled': true,
            'aria-visible': true
        }).removeClass('active normal').addClass('active').siblings().removeClass(
            'active normal').addClass('normal');

        $('#' + id).css({
            opacity: 1,
            zIndex: 2,
            'transition-duration': this.settings.easeingTime,
            'transition-timing-function': this.settings.easing,
        }).addClass('active');
    };
    
    BBS.prototype.keyBoardHandler = function (event) {
        var target = event.target;
        var key = event.which.toString();
        var thumbs = this.thumbs.toArray();
        
        if (key.match(/37|39/)) {
            var index = thumbs.indexOf(target);
            var direction = (key.match(/39/)) ? 1 : -1;
            var length = thumbs.length;
            var newIndex = (index + length + direction) % length;
            thumbs[newIndex].focus();

            event.preventDefault();
        } else if (key.match(/35|36/)) {
            switch (key) {
                // Go to first slide
                case '36':
                    this.thumbs[0].focus();
                    break;
                    // Go to last slide
                case '35':
                    this.thumbs[this.thumbs.length - 1].focus();
                    break;
            }
            event.preventDefault();
        }
    }

    BBS.prototype.animationHandler = function (e) {
        var element = this.element.children();

        $(element).hover(function (e) {
            this.initAnim(e);
        }.bind(this));

        $(element).focus(function(e){
            this.initAnim(e);
        }.bind(this))

        $(element).keydown(function (e) {
            this.keyBoardHandler(e); 
        }.bind(this));
    }

    //plugin defination
    $.fn.BBS = function (settings) {
        this.each(function () {
            var ths = $(this);
            var data = ths.data('bbs');
            if (!data) {
                ths.data('bbs', (data = new BBS(ths, settings)))
            }
            data['init']();
            $(win).resize(function () {
                data['init']();
            })
        });

        return this;
    };

    $.fn.BBS.constructor = BBS;


})(window, document, jQuery);