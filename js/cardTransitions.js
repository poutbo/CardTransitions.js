;(function($, window, document, undefined) {
    'use strict';
    //动画结束事件嗅探列表
    var animEndEventNames = {
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    };
    //获得结束事件名
    var animEndEventName = animEndEventNames[getTransitionPrefix()];
    //动画结束事件嗅探函数
    function getTransitionPrefix() {
        var body = document.body || document.documentElement;
        var style = body.style;
        var animStr = 'animation';
        if (typeof style[animStr] == 'string') {
            return animStr;
        }
        var val = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
        var animStr = animStr.charAt(0).toUpperCase() + animStr.substring(1);
        var amimName;
        for (var i = 0, l = val.length; i < l; i++) {
            amimName = val[i] + animStr;
            if (typeof style[amimName] == 'string') {
                return amimName;
            }
        }
        return false;
    }
    //初始化动画区域
    function init(el) {
        //限定范围
        if (el === undefined) {
            el = $('body');
        } else {
            el = $(el);
        }
        //保存Class设置
        $('.ct-card', el).each(function() {
            var me = $(this);
            me.data('originalClassList', me.attr('class'));
        });

        //初始化动画模块
        $('.ct-wrapper', el)
            .data('current', 0)
            .data('isAnimating', false)
            .find('.ct-card:first').addClass('ct-card-current');
    }
    //格式化动画Class名
    function formatClass(cls) {
        var clsList = cls.split(" ");
        var output = '';
        for (var i = 0, l = clsList.length; i < l; i++) {
            output += ' ct-card-' + clsList[i];
        }
        return output;
    }
    //动画函数
    function animate(options) {
        options = $.extend({
            'wrapper': $('.ct-wrapper').eq(0),
            'inClass': 'moveFromRight',
            'outClass': 'moveToLeft',
            'reverse': false,
            'to': undefined,
        }, options);

        var wrapper = $(options.wrapper);
        if (wrapper.data('isAnimating')) {
            return false;
        } else {
            wrapper.data('isAnimating', true);
        }
        var deferred = $.Deferred();
        var currDeferred = $.Deferred();
        var nextDeferred = $.Deferred();
        var inClass = formatClass(options.inClass);
        var outClass = formatClass(options.outClass);
        var current = wrapper.data('current');
        var cards = wrapper.children('.ct-card');
        var cardCount = cards.length;
        var currCard = cards.eq(current);
        if (options.to === undefined) {
            if (options.reverse) {
                if (current < 1) {
                    current = cardCount - 1;
                } else {
                    current--;
                }
            } else {
               if (current < cardCount - 1) {
                    current++;
                } else {
                    current = 0;
                }
            }
        } else {
            current = options.to;
        }
        wrapper.data('current', current);
        //动画全部完成后重置Card
        $.when(currDeferred, nextDeferred).done(function() {
            deferred.resolve(wrapper, nextCard, currCard);
            currCard.attr('class', currCard.data('originalClassList'));
            nextCard.attr('class', nextCard.data('originalClassList') + ' ct-card-current');
            wrapper.data('isAnimating', false);
        });
        //绑定完成动画
        var nextCard = cards.eq(current).addClass('ct-card-current');
        currCard.addClass(outClass).one(animEndEventName, function() {
            currDeferred.resolve();
        });
        nextCard.addClass(inClass).one(animEndEventName, function() {
            nextDeferred.resolve();
        });
        return deferred;
    }

    function rotate(wrapper, inClass, outClass, reverse) {
        return animate({
            'wrapper': wrapper,
            'inClass': inClass,
            'outClass': outClass,
            'reverse': reverse
        });
    }

    function next(wrapper, inClass, outClass) {
        return rotate(wrapper, inClass, outClass, false);
    }

    function prev(wrapper, inClass, outClass) {
        return rotate(wrapper, inClass, outClass, true);
    }

    function to(wrapper, target, inClass, outClass) {
        var cards = wrapper.children('.ct-card');
        var current = wrapper.data('current');
        target = cards.index(wrapper.find(target));
        return animate({
            'wrapper': wrapper,
            'inClass': inClass,
            'outClass': outClass,
            'reverse': target < current,
            'to': target
        });
    }

    $.CardTransitions = {
        'init': init,
        'animate': animate,
        'prev': prev,
        'next': next,
        'rotate': rotate,
        'to': to
    };

    $(function() {
        $.CardTransitions.init();
        $('body')
            .on('click', '.ct-prev', function(e) {
                var me = $(this);
                return prev(me.closest('.ct-wrapper'), me.attr('ct-in'), me.attr('ct-out'));
            })
            .on('click', '.ct-next', function(e) {
                var me = $(this);
                return next(me.closest('.ct-wrapper'), me.attr('ct-in'), me.attr('ct-out'));
            })
            .on('click', '.ct-to', function(e) {
                var me = $(this);
                to(me.closest('.ct-wrapper'), me.attr('ct-to'), me.attr('ct-in'), me.attr('ct-out'));
            });
    });
}(jQuery, window, document));