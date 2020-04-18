var  fs = require('hexo-fs'), path = require('path'), ejs = require('ejs'), jsminify = require('./jsminify'), hconf = hexo.config;
hconf.counter = hconf.counter ? percentEncode(hconf.counter) : '';
hconf.startslash = hconf.removestartslash ? '' : '/';
/*	hexo.extend.filter.register('before_exit', function(){
	var arr = [], url = hconf.url;
	if(fs.existsSync(path.join(__dirname,'..','public','feed.json'))){
	JSON.parse(fs.readFileSync(path.join(__dirname,'..','public','feed.json'))).items.forEach(function(item){
		var curr={t:item.title,u:item.id.replace(url,''),c:''};
		if(item.id.indexOf('galerija/')<0)curr.c=item.content_html;
		arr.push(curr);
	});
	fs.writeFileSync(path.join(__dirname,'..','public','json-feed.json'),JSON.stringify(arr));
	}
	if(fs.existsSync(path.join(__dirname,'..','public','pretraga','index.html'))){
		var html=fs.readFileSync(path.join(__dirname,'..','public','pretraga','index.html'));
		html=html.replace(/<div class="article-meta".*?<\/time><\/a><\/div>/,'').replace(/<meta property="og:updated_time" content=".*?">/,'').replace(/<meta property="og:time" content=".*?">/,'').replace('class="article-footer"','class="article-footer" style="display:none;"');
		fs.writeFileSync(path.join(__dirname,'..','public','pretraga','index.html'),html);
	}
});*/
function fill(s, a){return s.replace(/\$(\d)/g, (...args)=>a[args[1]])}
function isRelative(s){return !/^\/\/(?!\/)/.test(s)}
function fillIfRelative(s, a){return isRelative('/'+a[3]) ? fill(s, a) : a[0]}
function percentEncode(r){for(var e="",t=0,n=r.length;t<n;t++)e+="%"+parseInt(r.charCodeAt(t)).toString(16).toUpperCase();return e}
// function patternRegex(str, flags){return new RegExp('(\/.*?)?' + str + '(.*?\/)?', flags || 'g');}

if(hconf.cdn && !((hexo.env.args && hexo.env.args._) || []).includes('clean')){
	hexo.log.info('using CDN: ' + hconf.cdn);
	hexo.extend.filter.register('after_post_render', data=>{
		// hexo.log.info('after_post_render');
		data.content = data.content.replace(/(href|src|rel)=("|')\/(.*?\.(jpg|jpeg|png|js|css|pdf|doc|docx|xls|xlsx))("|')/gi, (...args)=>fillIfRelative('$1=$2'+hconf.cdn+'/$3$5', args));
		return data;
	});
	/*hexo.extend.filter.register('before_exit', ()=>{
		let jsPath = path.join(__dirname,'..','public','js','script.js');
		fs.existsSync(jsPath)&&fs.writeFileSync(jsPath, fs.readFileSync(jsPath).replace('cdn=""', 'cdn="'+cdn+'"'));
	});  handled in different function bellow this */
}
/* hexo.extend.filter.register('after_render:css', (css, data)=>{
	if(data.path.toLowerCase().endsWith('style.styl') && hconf.fancyboxcsscombined){
		css += '\n' + fs.readFileSync(path.join(data.path, '..', '..', 'fancybox', 'jquery.fancybox.css')).toString();
	}
	return css;
}); */

hexo.extend.filter.register('after_render:js', (js, data)=>{
	if(data.path.toLowerCase().endsWith('script.js')){
		js = ejs.render(js, {c: hconf});
		// js = js.replace(patternRegex('{cdn}'), cdn);
		// js = js.replace(patternRegex('{startslash}'), hconf.removestartslash?'':'/');
		// js = js.replace(patternRegex('{counter}'), counter?'setTimeout(function(){(new Image()).src=unescape("%68%74%74%70%73%3A%2F%2F")+"'+counter+'"+unescape("%2E%67%6F%61%74%63%6F%75%6E%74%65%72%2E%63%6F%6D%2F%63%6F%75%6E%74%3F")+"p="+encodeURIComponent(location.pathname+location.search||"/")+"&r="+encodeURIComponent(document.referrer)+"&s="+encodeURIComponent(window.screen.width+","+window.screen.height+","+(window.devicePixelRatio||1))},2000);':'');
	}
	js = jsminify(hexo, js, data);
	if(data.path.toLowerCase().endsWith('script.js') && hconf.localresources && hconf.fusecombined){
		js = fs.readFileSync(path.join(data.path, '..', 'fuse.min.js')).toString() + '\n' + js;
	}
	if(data.path.toLowerCase().endsWith('jquery.2.0.3.min.js') && hconf.fancyboxjscombined){
		js += jsminify(hexo, fs.readFileSync(path.join(data.path, '..', '..', 'fancybox', 'jquery.fancybox.pack.js')).toString());
	}
	return js;
});

hexo.extend.filter.register('after_render:html', html=>{
	if(hconf.cdn)html=html.replace(/(href|src|rel)=("|')\/(.*?\.(jpg|jpeg|png|js|css|pdf|doc|docx|xls|xlsx))("|')/gi, (...args)=>fillIfRelative('$1=$2'+hconf.cdn+'/$3$5', args));
	if(hconf.root && hconf.root.length>1)html=html.replace(new RegExp('(href|src|rel)=("|\')/(?!' + hconf.root.replace(/^\//,'') + ')(.*?)("|\')','gi'), (...args)=>fillIfRelative('$1=$2'+hconf.root+'$3$4', args));
	if(hconf.removestartslash)html=html.replace(/(href|src|rel)=("|')\/(.*?)("|')/gi, (...args)=>fillIfRelative('$1=$2$3$4', args));
	// html=html.replace('<link rel="alternate" href="/atom.xml"','<link rel="alternate" href="'+hconf.url+'/atom.xml"');
	// html=html.replace(/(\/|&#x2F;)index\.html/gi,'&#x2F;');
	html=html.replace(/(<meta .*?property="og:url".*? content=".*?)index\.html/gi,'$1');
	html=html.replace(/&#x2F;/gi,'/').replace(/<meta .*?name="generator".*? content=".*?".*?>/gi,'');
	html=html.replace(/(<a class=".*?(category-list-link|article-category-link).*?" href=".*?">)(.*?)(<\/a>)/g, (...args)=>{return args[1]+args[3][0].toUpperCase()+args[3].slice(1)+args[4];});
	html=html.replace(/<meta property="og:url" content=".*?\/404\.html">/i,'');
	html=html.replace(/<script defer/gi,'<script');
	if(hconf.scriptdefer)html=html.replace(/<script(.*? src=(.*?)>)/gi, (...args)=>{return !args[2].toLowerCase().includes('html5shiv')?'<script defer'+args[1]:args[0]});
	// html=html.replace(/imgalt/gi,'');
	// html=html.replace(/<script/i,'</div><script');
	// html=html.replace(/<\/div>(?!.*<\/div>)/i,'');
	// html=html.replace(/\/atom\.xml/g,hconf.url+'/atom.xml');
	return html;
});

hexo.extend.filter.register('before_exit', ()=>{
	// let jsPath = path.join(__dirname,'..','public','js','script.js');
	// let jqPath = path.join(__dirname,'..','public','js','jquery.2.0.3.min.js');
	let cssPath = path.join(__dirname,'..','public','css','style.css');
	if(hconf.fancyboxcsscombined && fs.existsSync(cssPath)){
		let cssFile = fs.readFileSync(cssPath).toString().split('\n')[0];
		cssFile += '\n' + fs.readFileSync(path.join(__dirname,'..','public','fancybox','jquery.fancybox.css')).toString();
		fs.writeFileSync(cssPath, cssFile);
	}
/* 	if(hconf.fancyboxjscombined && fs.existsSync(jqPath)){
		let jqFile = fs.readFileSync(jqPath).toString();
		// console.log(jqFile.length);
		jqFile=jqFile.split('\n').slice(0,6).join('\n');
		// console.log(jqFile.length);
		jqFile += '\n' + fs.readFileSync(path.join(__dirname,'..','public','fancybox','jquery.fancybox.pack.js')).toString();
		fs.writeFileSync(jqPath, jqFile);
	}
	if(fs.existsSync(jsPath)){
		let jsFile = fs.readFileSync(jsPath).toString().split('\n').pop();
		// console.log('cdn: '+hconf.cdn)
		// console.log(jsFile.slice(0,20));
		// jsFile = jsFile.replace(/{cdn}/g, hconf.cdn);
		// jsFile = jsFile.replace(/{startslash}/g, hconf.removestartslash?'':'/');
		// console.log(jsFile.slice(0,20));
		if(hconf.localresources && hconf.fusecombined){
			// console.log(hconf.fusecombined)
			let fusefile = fs.readFileSync(path.join(__dirname,'..','public','js','fuse.min.js')).toString();
			// console.log(fusefile.slice(0,20));
			jsFile = fusefile + '\n' + jsFile;
		}
		fs.writeFileSync(jsPath, jsFile);
	} */
});