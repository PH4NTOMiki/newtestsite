(function($){
  // Search
  var $searchWrap = $('#search-form-wrap'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function(){
    isSearchAnim = true;
  };

  var stopSearchAnim = function(callback){
    setTimeout(function(){
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $('#nav-search-btn').on('click', function(){
    if (isSearchAnim) return;

    startSearchAnim();
    $searchWrap.addClass('on');
    stopSearchAnim(function(){
      $('.search-form-input').focus();
    });
  });

  $('.search-form-input').on('blur', function(){
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim();
  });

  // Share
  $('body').on('click', function(){
    $('.article-share-box.on').removeClass('on');
  }).on('click', '.article-share-link', function(e){
    e.stopPropagation();

    var $this = $(this),
      url = $this.attr('data-url'),
      encodedUrl = encodeURIComponent(url),
      id = 'article-share-box-' + $this.attr('data-id'),
      offset = $this.offset();

    if ($('#' + id).length){
      var box = $('#' + id);

      if (box.hasClass('on')){
        box.removeClass('on');
        return;
      }
    } else {
      var html = [
        '<div id="' + id + '" class="article-share-box">',
          '<input class="article-share-input" disabled value="' + url + '">',
          '<div class="article-share-links">',
            '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
            '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
            '<a href="http://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" title="Pinterest"></a>',
            '<a href="https://plus.google.com/share?url=' + encodedUrl + '" class="article-share-google" target="_blank" title="Google+"></a>',
          '</div>',
        '</div>'
      ].join('');

      var box = $(html);

      $('body').append(box);
    }

    $('.article-share-box.on').hide();

    box.css({
      top: offset.top + 25,
      left: offset.left
    }).addClass('on');
  }).on('click', '.article-share-box', function(e){
    e.stopPropagation();
  }).on('click', '.article-share-box-input', function(){
    $(this).select();
  }).on('click', '.article-share-box-link', function(e){
    e.preventDefault();
    e.stopPropagation();

    window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
  });

  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox')) return;

      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
    });

	$(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
	var $center = $(this).find('center');
    if($center.attr('data-imgs')){var $this = $(this);
      $(window).on('load',function(){
	  var imgs = $center.attr('data-imgs').split(','), galleryName = imgs[0];
      $center.append($.map(imgs.slice(1),function(curr){
		  var thumb=curr.split('.');thumb[thumb.length-2]+='-thumb';
		  return '<a class="fancybox" href="<%-c.cdn%><%- c.root && c.root.length>1 ? c.root : c.startslash %>images/'+galleryName+'/'+curr+'" rel="article'+i+'"><img class="gallth" width="200px" height="160px" src="<%-c.cdn%><%- c.root && c.root.length>1 ? c.root : c.startslash %>images/'+galleryName+'/'+thumb.join('.')+'" alt="'/*+curr.split('.').slice(0,-1).join('.')*/+'"></a>';
	  }).join(''));
	  $center.removeAttr('data-imgs');
	  });
    }
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Mobile nav
  var $container = $('#container'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  }

  $('#main-nav-toggle').on('click', function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass('mobile-nav-on');
    stopMobileNavAnim();
  });

  $('#wrap').on('click', function(){
    if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

    $container.removeClass('mobile-nav-on');
  });
  <% if (c.counter){ %>
    if(!/(localhost$|^127\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^192\.168\.)/.test(location.hostname)){$(window).on('load',function(){setTimeout(function(){(new Image()).src=unescape("%68%74%74%70%73%3A%2F%2F<%-c.counter%>%2E%67%6F%61%74%63%6F%75%6E%74%65%72%2E%63%6F%6D%2F%63%6F%75%6E%74%3F")+"p="+encodeURIComponent(location.pathname+location.search||"/")+"&t="+encodeURIComponent(document.title||"")+"&r="+encodeURIComponent(document.referrer)+"&s="+encodeURIComponent(window.screen.width+","+window.screen.height+","+(window.devicePixelRatio||1))+"&rnd="+(+new Date())},2000);});}
  <% } %>
	function urlParam(name){var res=new RegExp('[\?&]'+name+'=([^&#]*)').exec(window.location.href);return res==null?null:(res[1]||0);}
	if(window.location.pathname.toLowerCase().indexOf("/pretraga")>-1){
		if(urlParam('q')){
		$.getJSON('<%-c.cdn%>/json-feed.json',function(response){
			fuse = new Fuse(response,{shouldSort:true,threshold:0.4,location:0,distance:100,maxPatternLength:32,minMatchCharLength:1,keys:["t","u","c"]});
			var query = decodeURIComponent(urlParam('q').replace(/\+/g,' ')), results = fuse.search(query), resArr = [], i;
			for (i = 0; i < 20 && i < results.length; i++) {
				resArr.push('<h2><a href="'+results[i].u+'">'+results[i].t+'</a></h2>');
			}
			var plural = results.length > 1 ? 'o' : '';
			$("#found").text('Za traženi pojam "'+query+'" ' + (results.length?('pronađen'+plural+' je '+results.length+' rezultat'+plural.replace('o','a')+' - prikazan'+plural+' ' + i):'nije pronađen nijedan rezultat'));
			$("#results").html(resArr.join(''));
		}).fail(console.error);
		} else {
			$("#found").text('Niste unijeli pojam za pretragu.');
			$("#results").html('');
		}
}
})(jQuery);
