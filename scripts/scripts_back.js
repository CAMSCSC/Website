var screenheight = $(window).height() - 70;
if( screenheight < 650 )
{
	screenheight = 650;
}
var active = false;
var expanded = false;
var chatactive = false;

$( document ).ready( function() {
	init();
	write_css();
	
	$('#home').click( function(e) {
		if($(this).height() != screenheight && !expanded && !active && chatactive)
		{
			active = true;
			$('#chatinfo').hide();
			$(this).animate( {height: screenheight}, 2000, 'easeOutCubic', function(){
				$('html').animate({scrollTop: 0}, 500, 'easeOutCubic', function(){
					$('#chat').fadeIn( 1000, 'easeOutQuart', function() {
						expanded = true;
						active = false;
					});
				});
			});
		}
		else if ($(e.target).closest('#chat').length)
		{
			return;
		}
		else if (expanded && !active)
		{
			active = true;
			$('#chat').fadeOut( 1000, 'easeOutQuart', function() {
				$('#home').animate( {height: '300px'}, 2000, 'easeOutCubic', function() {
					$('#chatinfo').show();
					expanded = false;
					active = false;
				});
			});
		}
	});
	
	$('textarea').keypress(function(e) {
		if (e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			$('form').submit();
		}
	});
	
	$('#talkform').submit(function(e) {
		e.preventDefault();
		var user = $('#say').val();
		$('.chatbox').append('<p>You: '+user+'</p>');
		scroll_bottom();
		var formdata = $('#talkform').serialize();
		$('#say').val('')
		$('#say').focus();
		$.post('http://camscsc.org/catbot/chatbot/conversation_start.php', formdata, function(data)
		{
			var b = data.botsay;
			if (b.indexOf('[img]') >= 0)
			{
				b = showImg(b);
			}
			if (b.indexOf('[link') >= 0) {
				b = makeLink(b);
			}
			$('.chatbox').append('<p class="catspeak">HackerCat: '+b+'</p>');
			scroll_bottom();
         }, 'json').fail(function(xhr, textStatus, errorThrown){
			console.log("Something went wrong! Error = " + errorThrown);
			});
		return false;
	});
});

function scroll_bottom()
{
	$('.chatbox').animate({scrollTop: $('.chatbox').prop("scrollHeight")}, 0);
}

function showImg(input)
{
	var regEx = /\[img\](.*?)\[\/img\]/;
	var repl = '<br><a href="$1" target="_blank"><img src="$1" alt="$1" width="150" /></a>';
	var out = input.replace(regEx, repl);
	console.log('out = ' + out);
	return out
}
function makeLink(input)
{
	var regEx = /\[link=(.*?)\](.*?)\[\/link\]/;
	var repl = '<a href="$1" target="_blank">$2</a>';
	var out = input.replace(regEx, repl);
	console.log('out = ' + out);
	return out;
}

function init()
{
	$('.subMenu').singlePageNav({
		offset: $('.subMenu').outerHeight(),
		threshold: 300,
		speed: 1500,
		easing: 'easeOutCubic'
	});
	
    $('.typed').typed({
		strings: ["Exploring the concepts of computer hardware, software, programming, hacking, and exploiting."],
		typeSpeed: 100
	});
 
}

function write_css()
{
	$('#contact').css('padding-top', ($('#s5').height() - 80) / 2);
}

/**
 * Single Page Nav Plugin (modified)
 * Copyright (c) 2014 Chris Wojcik <hello@chriswojcik.net>
 * Dual licensed under MIT and GPL.
 * @author Chris Wojcik
 * @version 1.2.0
 * MODIFIED
 */

// Utility
if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window, document, undefined) {
    "use strict";
    
    var SinglePageNav = {
        
        init: function(options, container) {
            
            this.options = $.extend({}, $.fn.singlePageNav.defaults, options);
            
            this.container = container;            
            this.$container = $(container);
            this.$links = this.$container.find('a');

            if (this.options.filter !== '') {
                this.$links = this.$links.filter(this.options.filter);
            }

            this.$window = $(window);
            this.$htmlbody = $('html, body');
            
            this.$links.on('click.singlePageNav', $.proxy(this.handleClick, this));

            this.didScroll = false;
            this.checkPosition();
            this.setTimer();
        },

        handleClick: function(e) {
            var self  = this,
                link  = e.currentTarget,
                $elem = $(link.hash);

            e.preventDefault();             

            if ($elem.length) { // Make sure the target elem exists

                // Prevent active link from cycling during the scroll
                self.clearTimer();

                // Before scrolling starts
                if (typeof self.options.beforeStart === 'function') {
                    self.options.beforeStart();
                }

                self.setActiveLink(link.hash);
                
                self.scrollTo($elem, function() { 

                    if (self.options.updateHash && history.pushState) {
                        history.pushState(null,null, link.hash);
                    }

                    self.setTimer();

                    // After scrolling ends
                    if (typeof self.options.onComplete === 'function') {
                        self.options.onComplete();
                    }
                });                            
            }     
        },
        
        scrollTo: function($elem, callback) {
            var self = this;
			if(self.getCoords($elem).top > $(document).height() - $(window).height()) {
				var target = $(document).height() - $(window).height();
			}
			else {
				var target = self.getCoords($elem).top;
			}
            var called = false;

            self.$htmlbody.stop().animate(
                {scrollTop: target}, 
                { 
                    duration: self.options.speed,
                    easing: self.options.easing, 
                    complete: function() {
                        if (typeof callback === 'function' && !called) {
                            callback();
                        }
                        called = true;
                    }
                }
            );
        },
        
        setTimer: function() {
            var self = this;
            
            self.$window.on('scroll.singlePageNav', function() {
                self.didScroll = true;
            });
            
            self.timer = setInterval(function() {
                if (self.didScroll) {
                    self.didScroll = false;
                    self.checkPosition();
                }
            }, 100);
        },        
        
        clearTimer: function() {
            clearInterval(this.timer);
            this.$window.off('scroll.singlePageNav');
            this.didScroll = false;
        },
        
        // Check the scroll position and set the active section
        checkPosition: function() {
            var scrollPos = this.$window.scrollTop();
            var currentSection = this.getCurrentSection(scrollPos);
            if(currentSection!==null) {
                this.setActiveLink(currentSection);
            }
        },        
        
        getCoords: function($elem) {
            return {
                top: Math.round($elem.offset().top) - this.options.offset
            };
        },
        
        setActiveLink: function(href) {
            var $activeLink = this.$container.find("a[href$='" + href + "']");
                            
            if (!$activeLink.hasClass(this.options.currentClass)) {
                this.$links.removeClass(this.options.currentClass);
                $activeLink.addClass(this.options.currentClass);
            }
        },        
        
        getCurrentSection: function(scrollPos) {
            var i, hash, coords, section;
            
			if($(window).scrollTop() + $(window).height() == $(document).height()) {
				section = this.$links[this.$links.length-1].hash;
			}
			else {
				for (i = 0; i < this.$links.length; i++) {
					hash = this.$links[i].hash;
					
					if ($(hash).length) {
						coords = this.getCoords($(hash));
						
						if (scrollPos >= coords.top - this.options.threshold) {
							section = hash;
						}
					}
				}
			}
            
            // The current section or the first link if it is found
            return section || ((this.$links.length===0) ? (null) : (this.$links[0].hash));
        }
    };
    
    $.fn.singlePageNav = function(options) {
        return this.each(function() {
            var singlePageNav = Object.create(SinglePageNav);
            singlePageNav.init(options, this);
        });
    };
    
    $.fn.singlePageNav.defaults = {
        offset: 0,
        threshold: 120,
        speed: 400,
        currentClass: 'current',
        easing: 'swing',
        updateHash: false,
        filter: '',
        onComplete: false,
        beforeStart: false
    };
    
})(jQuery, window, document);
