;(function($){$.fn.extend({autocomplete:function(urlOrData,options){var isUrl=typeof urlOrData=="string";options=$.extend({},$.Autocompleter.defaults,{url:isUrl?urlOrData:null,data:isUrl?null:urlOrData,delay:isUrl?$.Autocompleter.defaults.delay:10,max:options&&!options.scroll?10:150},options);options.highlight=options.highlight||function(value){return value;};return this.each(function(){new $.Autocompleter(this,options);});},result:function(handler){return this.bind("result",handler);},search:function(handler){return this.trigger("search",[handler]);},flushCache:function(){return this.trigger("flushCache");},setOptions:function(options){return this.trigger("setOptions",[options]);},unautocomplete:function(){return this.trigger("unautocomplete");}});$.Autocompleter=function(input,options){var KEY={UP:38,DOWN:40,DEL:46,TAB:9,RETURN:13,ESC:27,COMMA:188,PAGEUP:33,PAGEDOWN:34};var $input=$(input).attr("autocomplete","off").addClass(options.inputClass);var timeout;var previousValue="";var cache=$.Autocompleter.Cache(options);var hasFocus=0;var lastKeyPressCode;var config={mouseDownOnSelect:false};var select=$.Autocompleter.Select(options,input,selectCurrent,config);$input.keydown(function(event){lastKeyPressCode=event.keyCode;switch(event.keyCode){case KEY.UP:event.preventDefault();if(select.visible()){select.prev();}else{onChange(0,true);}
break;case KEY.DOWN:event.preventDefault();if(select.visible()){select.next();}else{onChange(0,true);}
break;case KEY.PAGEUP:event.preventDefault();if(select.visible()){select.pageUp();}else{onChange(0,true);}
break;case KEY.PAGEDOWN:event.preventDefault();if(select.visible()){select.pageDown();}else{onChange(0,true);}
break;case options.multiple&&$.trim(options.multipleSeparator)==","&&KEY.COMMA:case KEY.TAB:case KEY.RETURN:if(selectCurrent()){event.preventDefault();}
break;case KEY.ESC:select.hide();break;default:clearTimeout(timeout);timeout=setTimeout(onChange,options.delay);break;}}).keypress(function(){}).focus(function(){hasFocus++;}).blur(function(){hasFocus=0;if(!config.mouseDownOnSelect){hideResults();}}).click(function(){if(hasFocus++>1&&!select.visible()){onChange(0,true);}}).bind("search",function(){var fn=(arguments.length>1)?arguments[1]:null;function findValueCallback(q,data){var result;if(data&&data.length){for(var i=0;i<data.length;i++){if(data[i].result.toLowerCase()==q.toLowerCase()){result=data[i];break;}}}
if(typeof fn=="function")fn(result);else $input.trigger("result",result&&[result.data,result.value]);}
$.each(trimWords($input.val()),function(i,value){request(value,findValueCallback,findValueCallback);});}).bind("flushCache",function(){cache.flush();}).bind("setOptions",function(){$.extend(options,arguments[1]);if("data"in arguments[1])
cache.populate();}).bind("unautocomplete",function(){select.unbind();$input.unbind();});function selectCurrent(){var selected=select.selected();if(!selected)
return false;var v=selected.result;previousValue=v;if(options.multiple){var words=trimWords($input.val());if(words.length>1){v=words.slice(0,words.length-1).join(options.multipleSeparator)+options.multipleSeparator+v;}
v+=options.multipleSeparator;}
$input.val(v);hideResultsNow();$input.trigger("result",[selected.data,selected.value]);return true;}
function onChange(crap,skipPrevCheck){if(lastKeyPressCode==KEY.DEL){select.hide();return;}
var currentValue=$input.val();if(!skipPrevCheck&&currentValue==previousValue)
return;previousValue=currentValue;currentValue=lastWord(currentValue);if(currentValue.length>=options.minChars){$input.addClass(options.loadingClass);if(!options.matchCase)
currentValue=currentValue.toLowerCase();request(currentValue,receiveData,hideResultsNow);}else{stopLoading();select.hide();}};function trimWords(value){if(!value){return[""];}
var words=value.split($.trim(options.multipleSeparator));var result=[];$.each(words,function(i,value){if($.trim(value))
result[i]=$.trim(value);});return result;}
function lastWord(value){if(!options.multiple)
return value;var words=trimWords(value);return words[words.length-1];}
function autoFill(q,sValue){if(options.autoFill&&(lastWord($input.val()).toLowerCase()==q.toLowerCase())&&lastKeyPressCode!=8){$input.val($input.val()+sValue.substring(lastWord(previousValue).length));$.Autocompleter.Selection(input,previousValue.length,previousValue.length+sValue.length);}};function hideResults(){clearTimeout(timeout);timeout=setTimeout(hideResultsNow,200);};function hideResultsNow(){select.hide();clearTimeout(timeout);stopLoading();if(options.mustMatch){$input.search(function(result){if(!result)$input.val("");});}};function receiveData(q,data){if(data&&data.length&&hasFocus){stopLoading();select.display(data,q);autoFill(q,data[0].value);select.show();}else{hideResultsNow();}};function request(term,success,failure){if(!options.matchCase)
term=term.toLowerCase();var data=cache.load(term);if(data&&data.length){success(term,data);}else if((typeof options.url=="string")&&(options.url.length>0)){var extraParams={};$.each(options.extraParams,function(key,param){extraParams[key]=typeof param=="function"?param():param;});$.ajax({mode:"abort",port:"autocomplete"+input.name,dataType:options.dataType,url:options.url,data:$.extend({q:lastWord(term),limit:options.max},extraParams),success:function(data){var parsed=options.parse&&options.parse(data)||parse(data);cache.add(term,parsed);success(term,parsed);}});}else{failure(term);}};function parse(data){var parsed=[];var rows=data.split("\n");for(var i=0;i<rows.length;i++){var row=$.trim(rows[i]);if(row){row=row.split("|");parsed[parsed.length]={data:row,value:row[0],result:options.formatResult&&options.formatResult(row,row[0])||row[0]};}}
return parsed;};function stopLoading(){$input.removeClass(options.loadingClass);};};$.Autocompleter.defaults={inputClass:"ac_input",resultsClass:"ac_results",loadingClass:"ac_loading",minChars:1,delay:400,matchCase:false,matchSubset:true,matchContains:false,cacheLength:10,max:100,mustMatch:false,extraParams:{},selectFirst:true,formatItem:function(row){return row[0];},autoFill:false,width:0,multiple:false,multipleSeparator:", ",highlight:function(value,term){return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>");},scroll:true,scrollHeight:180,attachTo:'body'};$.Autocompleter.Cache=function(options){var data={};var length=0;function matchSubset(s,sub){if(!options.matchCase)
s=s.toLowerCase();var i=s.indexOf(sub);if(i==-1)return false;return i==0||options.matchContains;};function add(q,value){if(length>options.cacheLength){flush();}
if(!data[q]){length++;}
data[q]=value;}
function populate(){if(!options.data)return false;var stMatchSets={},nullData=0;if(!options.url)options.cacheLength=1;stMatchSets[""]=[];for(var i=0,ol=options.data.length;i<ol;i++){var rawValue=options.data[i];rawValue=(typeof rawValue=="string")?[rawValue]:rawValue;var value=options.formatItem(rawValue,i+1,options.data.length);if(value===false)
continue;var firstChar=value.charAt(0).toLowerCase();if(!stMatchSets[firstChar])
stMatchSets[firstChar]=[];var row={value:value,data:rawValue,result:options.formatResult&&options.formatResult(rawValue)||value};stMatchSets[firstChar].push(row);if(nullData++<options.max){stMatchSets[""].push(row);}};$.each(stMatchSets,function(i,value){options.cacheLength++;add(i,value);});}
setTimeout(populate,25);function flush(){data={};length=0;}
return{flush:flush,add:add,populate:populate,load:function(q){if(!options.cacheLength||!length)
return null;if(!options.url&&options.matchContains){var csub=[];for(var k in data){if(k.length>0){var c=data[k];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub.push(x);}});}}
return csub;}else
if(data[q]){return data[q];}else
if(options.matchSubset){for(var i=q.length-1;i>=options.minChars;i--){var c=data[q.substr(0,i)];if(c){var csub=[];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub[csub.length]=x;}});return csub;}}}
return null;}};};$.Autocompleter.Select=function(options,input,select,config){var CLASSES={ACTIVE:"ac_over"};var listItems,active=-1,data,term="",needsInit=true,element,list;function init(){if(!needsInit)
return;element=$("<div/>").hide().addClass(options.resultsClass).css("position","absolute").appendTo(options.attachTo);list=$("<ul>").appendTo(element).mouseover(function(event){if(target(event).nodeName&&target(event).nodeName.toUpperCase()=='LI'){active=$("li",list).removeClass(CLASSES.ACTIVE).index(target(event));$(target(event)).addClass(CLASSES.ACTIVE);}}).click(function(event){$(target(event)).addClass(CLASSES.ACTIVE);select();input.focus();return false;}).mousedown(function(){config.mouseDownOnSelect=true;}).mouseup(function(){config.mouseDownOnSelect=false;});if(options.width>0)
element.css("width",options.width);needsInit=false;}
function target(event){var element=event.target;while(element&&element.tagName!="LI")
element=element.parentNode;if(!element)
return[];return element;}
function moveSelect(step){listItems.slice(active,active+1).removeClass();movePosition(step);var activeItem=listItems.slice(active,active+1).addClass(CLASSES.ACTIVE);if(options.scroll){var offset=0;listItems.slice(0,active).each(function(){offset+=this.offsetHeight;});if((offset+activeItem[0].offsetHeight-list.scrollTop())>list[0].clientHeight){list.scrollTop(offset+activeItem[0].offsetHeight-list.innerHeight());}else if(offset<list.scrollTop()){list.scrollTop(offset);}}};function movePosition(step){active+=step;if(active<0){active=listItems.size()-1;}else if(active>=listItems.size()){active=0;}}
function limitNumberOfItems(available){return options.max&&options.max<available?options.max:available;}
function fillList(){list.empty();var max=limitNumberOfItems(data.length);for(var i=0;i<max;i++){if(!data[i])
continue;var formatted=options.formatItem(data[i].data,i+1,max,data[i].value,term);if(formatted===false)
continue;var li=$("<li>").html(options.highlight(formatted,term)).addClass(i%2==0?"ac_even":"ac_odd").appendTo(list)[0];$.data(li,"ac_data",data[i]);}
listItems=list.find("li");if(options.selectFirst){listItems.slice(0,1).addClass(CLASSES.ACTIVE);active=0;}
list.bgiframe();}
return{display:function(d,q){init();data=d;term=q;fillList();},next:function(){moveSelect(1);},prev:function(){moveSelect(-1);},pageUp:function(){if(active!=0&&active-8<0){moveSelect(-active);}else{moveSelect(-8);}},pageDown:function(){if(active!=listItems.size()-1&&active+8>listItems.size()){moveSelect(listItems.size()-1-active);}else{moveSelect(8);}},hide:function(){element&&element.hide();active=-1;},visible:function(){return element&&element.is(":visible");},current:function(){return this.visible()&&(listItems.filter("."+CLASSES.ACTIVE)[0]||options.selectFirst&&listItems[0]);},show:function(){var offset=$(input).offset();element.css({width:typeof options.width=="string"||options.width>0?options.width:$(input).width(),top:offset.top+input.offsetHeight,left:offset.left}).show();if(options.scroll){list.scrollTop(0);list.css({maxHeight:options.scrollHeight,overflow:'auto'});if($.browser.msie&&typeof document.body.style.maxHeight==="undefined"){var listHeight=0;listItems.each(function(){listHeight+=this.offsetHeight;});var scrollbarsVisible=listHeight>options.scrollHeight;list.css('height',scrollbarsVisible?options.scrollHeight:listHeight);if(!scrollbarsVisible){listItems.width(list.width()-parseInt(listItems.css("padding-left"))-parseInt(listItems.css("padding-right")));}}}},selected:function(){var selected=listItems&&listItems.filter("."+CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);return selected&&selected.length&&$.data(selected[0],"ac_data");},unbind:function(){element&&element.remove();}};};$.Autocompleter.Selection=function(field,start,end){if(field.createTextRange){var selRange=field.createTextRange();selRange.collapse(true);selRange.moveStart("character",start);selRange.moveEnd("character",end);selRange.select();}else if(field.setSelectionRange){field.setSelectionRange(start,end);}else{if(field.selectionStart){field.selectionStart=start;field.selectionEnd=end;}}
field.focus();};})(jQuery);(function($){$.fn.bgIframe=$.fn.bgiframe=function(s){if($.browser.msie&&/6.0/.test(navigator.userAgent)){s=$.extend({top:'auto',left:'auto',width:'auto',height:'auto',opacity:true,src:'javascript:false;'},s||{});var prop=function(n){return n&&n.constructor==Number?n+'px':n;},html='<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+'style="display:block;position:absolute;z-index:-1;'+
(s.opacity!==false?'filter:Alpha(Opacity=\'0\');':'')+'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+'"/>';return this.each(function(){if($('> iframe.bgiframe',this).length==0)
this.insertBefore(document.createElement(html),this.firstChild);});}
return this;};})(jQuery);jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1;}
var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000));}else{date=options.expires;}
expires='; expires='+date.toUTCString();}
var path=options.path?'; path='+(options.path):'';var domain=options.domain?'; domain='+(options.domain):'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('');}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break;}}}
return cookieValue;}};(function($){$.dimensions={version:'@VERSION'};$.each(['Height','Width'],function(i,name){$.fn['inner'+name]=function(){if(!this[0])return;var torl=name=='Height'?'Top':'Left',borr=name=='Height'?'Bottom':'Right';return this.css('display')!='none'?this[0]['client'+name]:num(this,name.toLowerCase())+num(this,'padding'+torl)+num(this,'padding'+borr);};$.fn['outer'+name]=function(options){if(!this[0])return;var torl=name=='Height'?'Top':'Left',borr=name=='Height'?'Bottom':'Right';options=$.extend({margin:false},options||{});var val=this.css('display')!='none'?this[0]['offset'+name]:num(this,name.toLowerCase())
+num(this,'border'+torl+'Width')+num(this,'border'+borr+'Width')
+num(this,'padding'+torl)+num(this,'padding'+borr);return val+(options.margin?(num(this,'margin'+torl)+num(this,'margin'+borr)):0);};});$.each(['Left','Top'],function(i,name){$.fn['scroll'+name]=function(val){if(!this[0])return;return val!=undefined?this.each(function(){this==window||this==document?window.scrollTo(name=='Left'?val:$(window)['scrollLeft'](),name=='Top'?val:$(window)['scrollTop']()):this['scroll'+name]=val;}):this[0]==window||this[0]==document?self[(name=='Left'?'pageXOffset':'pageYOffset')]||$.boxModel&&document.documentElement['scroll'+name]||document.body['scroll'+name]:this[0]['scroll'+name];};});$.fn.extend({position:function(){var left=0,top=0,elem=this[0],offset,parentOffset,offsetParent,results;if(elem){offsetParent=this.offsetParent();offset=this.offset();parentOffset=offsetParent.offset();offset.top-=num(elem,'marginTop');offset.left-=num(elem,'marginLeft');parentOffset.top+=num(offsetParent,'borderTopWidth');parentOffset.left+=num(offsetParent,'borderLeftWidth');results={top:offset.top-parentOffset.top,left:offset.left-parentOffset.left};}
return results;},offsetParent:function(){var offsetParent=this[0].offsetParent;while(offsetParent&&(!/^body|html$/i.test(offsetParent.tagName)&&$.css(offsetParent,'position')=='static'))
offsetParent=offsetParent.offsetParent;return $(offsetParent);}});function num(el,prop){return parseInt($.curCSS(el.jquery?el[0]:el,prop,true))||0;};})(jQuery);(function($){$.facebox=function(data,klass){$.facebox.loading()
if(data.ajax)fillFaceboxFromAjax(data.ajax,klass)
else if(data.image)fillFaceboxFromImage(data.image,klass)
else if(data.div)fillFaceboxFromHref(data.div,klass)
else if($.isFunction(data))data.call($)
else $.facebox.reveal(data,klass)}
$.extend($.facebox,{settings:{opacity:0,overlay:true,loadingImage:'/facebox/loading.gif',closeImage:'/facebox/closelabel.gif',imageTypes:['png','jpg','jpeg','gif'],faceboxHtml:'\
    <div id="facebox" style="display:none;"> \
      <div class="popup"> \
        <table> \
          <tbody> \
            <tr> \
              <td class="tl"/><td class="b"/><td class="tr"/> \
            </tr> \
            <tr> \
              <td class="b"/> \
              <td class="body"> \
                <div class="content"> \
                </div> \
                <div class="footer"> \
                  <a href="#" class="close"> \
                    <img src="/facebox/closelabel.gif" title="close" class="close_image" /> \
                  </a> \
                </div> \
              </td> \
              <td class="b"/> \
            </tr> \
            <tr> \
              <td class="bl"/><td class="b"/><td class="br"/> \
            </tr> \
          </tbody> \
        </table> \
      </div> \
    </div>'},loading:function(){init()
if($('#facebox .loading').length==1)return true
showOverlay()
$('#facebox .content').empty()
$('#facebox .body').children().hide().end().append('<div class="loading"><img src="'+$.facebox.settings.loadingImage+'"/></div>')
$('#facebox').css({top:getPageScroll()[1]+(getPageHeight()/10),left:$(window).width()/2-205}).show()
$(document).bind('keydown.facebox',function(e){if(e.keyCode==27)$.facebox.close()
return true})
$(document).trigger('loading.facebox')},reveal:function(data,klass){$(document).trigger('beforeReveal.facebox')
if(klass)$('#facebox .content').addClass(klass)
$('#facebox .content').append(data)
$('#facebox .loading').remove()
$('#facebox .body').children().fadeIn('normal')
$('#facebox').css('left',$(window).width()/2-($('#facebox table').width()/2))
$(document).trigger('reveal.facebox').trigger('afterReveal.facebox')},close:function(){$(document).trigger('close.facebox')
return false}})
$.fn.facebox=function(settings){if($(this).length==0)return
init(settings)
function clickHandler(){$.facebox.loading(true)
var klass=this.rel.match(/facebox\[?\.(\w+)\]?/)
if(klass)klass=klass[1]
fillFaceboxFromHref(this.href,klass)
return false}
return this.bind('click.facebox',clickHandler)}
function init(settings){if($.facebox.settings.inited)return true
else $.facebox.settings.inited=true
$(document).trigger('init.facebox')
makeCompatible()
var imageTypes=$.facebox.settings.imageTypes.join('|')
$.facebox.settings.imageTypesRegexp=new RegExp('\.('+imageTypes+')$','i')
if(settings)$.extend($.facebox.settings,settings)
$('body').append($.facebox.settings.faceboxHtml)
var preload=[new Image(),new Image()]
preload[0].src=$.facebox.settings.closeImage
preload[1].src=$.facebox.settings.loadingImage
$('#facebox').find('.b:first, .bl, .br, .tl, .tr').each(function(){preload.push(new Image())
preload.slice(-1).src=$(this).css('background-image').replace(/url\((.+)\)/,'$1')})
$('#facebox .close').click($.facebox.close)
$('#facebox .close_image').attr('src',$.facebox.settings.closeImage)}
function getPageScroll(){var xScroll,yScroll;if(self.pageYOffset){yScroll=self.pageYOffset;xScroll=self.pageXOffset;}else if(document.documentElement&&document.documentElement.scrollTop){yScroll=document.documentElement.scrollTop;xScroll=document.documentElement.scrollLeft;}else if(document.body){yScroll=document.body.scrollTop;xScroll=document.body.scrollLeft;}
return new Array(xScroll,yScroll)}
function getPageHeight(){var windowHeight
if(self.innerHeight){windowHeight=self.innerHeight;}else if(document.documentElement&&document.documentElement.clientHeight){windowHeight=document.documentElement.clientHeight;}else if(document.body){windowHeight=document.body.clientHeight;}
return windowHeight}
function makeCompatible(){var $s=$.facebox.settings
$s.loadingImage=$s.loading_image||$s.loadingImage
$s.closeImage=$s.close_image||$s.closeImage
$s.imageTypes=$s.image_types||$s.imageTypes
$s.faceboxHtml=$s.facebox_html||$s.faceboxHtml}
function fillFaceboxFromHref(href,klass){if(href.match(/#/)){var url=window.location.href.split('#')[0]
var target=href.replace(url,'')
if(target=='#')return
$.facebox.reveal($(target).html(),klass)}else if(href.match($.facebox.settings.imageTypesRegexp)){fillFaceboxFromImage(href,klass)}else{fillFaceboxFromAjax(href,klass)}}
function fillFaceboxFromImage(href,klass){var image=new Image()
image.onload=function(){$.facebox.reveal('<div class="image"><img src="'+image.src+'" /></div>',klass)}
image.src=href}
function fillFaceboxFromAjax(href,klass){$.get(href,function(data){$.facebox.reveal(data,klass)})}
function skipOverlay(){return $.facebox.settings.overlay==false||$.facebox.settings.opacity===null}
function showOverlay(){if(skipOverlay())return
if($('#facebox_overlay').length==0)
$("body").append('<div id="facebox_overlay" class="facebox_hide"></div>')
$('#facebox_overlay').hide().addClass("facebox_overlayBG").css('opacity',$.facebox.settings.opacity).click(function(){$(document).trigger('close.facebox')}).fadeIn(200)
return false}
function hideOverlay(){if(skipOverlay())return
$('#facebox_overlay').fadeOut(200,function(){$("#facebox_overlay").removeClass("facebox_overlayBG")
$("#facebox_overlay").addClass("facebox_hide")
$("#facebox_overlay").remove()})
return false}
$(document).bind('close.facebox',function(){$(document).unbind('keydown.facebox')
$('#facebox').fadeOut(function(){$('#facebox .content').removeClass().addClass('content')
hideOverlay()
$('#facebox .loading').remove()})})})(jQuery);(function(){jQuery.fn.fancyZoom=function(options){if($(this).length==0)return
var options=options||{};var directory=options&&options.directory?options.directory:'images';var zooming=false;if($('#zoom').length==0){var ext=$.browser.msie?'gif':'png';var html='<div id="zoom" style="display:none;"> \
        <table id="zoom_table" style="border-collapse:collapse; width:100%; height:100%;"> \
        <tbody> \
        <tr> \
        <td class="tl" style="background:url('+directory+'/tl.'+ext+') 0 0 no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        <td class="tm" style="background:url('+directory+'/tm.'+ext+') 0 0 repeat-x; height:20px; overflow:hidden;" /> \
        <td class="tr" style="background:url('+directory+'/tr.'+ext+') 100% 0 no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        </tr> \
        <tr> \
        <td class="ml" style="background:url('+directory+'/ml.'+ext+') 0 0 repeat-y; width:20px; overflow:hidden;" /> \
        <td class="mm" style="background:#fff; vertical-align:top; padding:10px;"> \
        <div id="zoom_content"> \
        </div> \
        </td> \
        <td class="mr" style="background:url('+directory+'/mr.'+ext+') 100% 0 repeat-y;  width:20px; overflow:hidden;" /> \
        </tr> \
        <tr> \
        <td class="bl" style="background:url('+directory+'/bl.'+ext+') 0 100% no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        <td class="bm" style="background:url('+directory+'/bm.'+ext+') 0 100% repeat-x; height:20px; overflow:hidden;" /> \
        <td class="br" style="background:url('+directory+'/br.'+ext+') 100% 100% no-repeat; width:20px; height:20px; overflow:hidden;" /> \
        </tr> \
        </tbody> \
        </table> \
        <a href="#" title="Close" id="zoom_close" style="position:absolute; top:0; left:0;"> \
        <img src="'+directory+'/closebox.'+ext+'" alt="Close" style="border:none; margin:0; padding:0;" /> \
        </a> \
        </div>';$('body').append(html);$('html').click(function(e){if($(e.target).parents('#zoom:visible').length==0)hide();});$(document).keyup(function(event){if(event.keyCode==27&&$('#zoom:visible').length>0)hide();});$('#zoom_close').click(hide);}
var zoom=$('#zoom');var zoom_table=$('#zoom_table');var zoom_close=$('#zoom_close');var zoom_content=$('#zoom_content');var middle_row=$('td.ml,td.mm,td.mr');return $(this).click(show);function show(e){if(zooming)return false;zooming=true;var content_div=$($(this).attr('href'));var zoom_width=options.width;var zoom_height=options.height;var width=window.innerWidth||(window.document.documentElement.clientWidth||window.document.body.clientWidth);var height=window.innerHeight||(window.document.documentElement.clientHeight||window.document.body.clientHeight);var x=window.pageXOffset||(window.document.documentElement.scrollLeft||window.document.body.scrollLeft);var y=window.pageYOffset||(window.document.documentElement.scrollTop||window.document.body.scrollTop);var window_size={'width':width,'height':height,'x':x,'y':y}
var width=(zoom_width||content_div.width())+60;var height=(zoom_height||content_div.height())+60;var d=window_size;var newTop=Math.max((d.height/2)-(height/2)+y,0);var newLeft=(d.width/2)-(width/2);var curTop=e.pageY;var curLeft=e.pageX;zoom_close.attr('curTop',curTop);zoom_close.attr('curLeft',curLeft);zoom_close.attr('scaleImg',options.scaleImg?'true':'false');$('#zoom').hide().css({position:'absolute',top:curTop+'px',left:curLeft+'px',width:'1px',height:'1px'});fixBackgroundsForIE();zoom_close.hide();if(options.closeOnClick){$('#zoom').click(hide);}
if(options.scaleImg){zoom_content.html(content_div.html());$('#zoom_content img').css('width','100%');}else{zoom_content.html('');}
$('#zoom').animate({top:newTop+'px',left:newLeft+'px',opacity:"show",width:width,height:height},500,null,function(){if(options.scaleImg!=true){zoom_content.html(content_div.html());}
unfixBackgroundsForIE();zoom_close.show();zooming=false;})
return false;}
function hide(){if(zooming)return false;zooming=true;$('#zoom').unbind('click');fixBackgroundsForIE();if(zoom_close.attr('scaleImg')!='true'){zoom_content.html('');}
zoom_close.hide();$('#zoom').animate({top:zoom_close.attr('curTop')+'px',left:zoom_close.attr('curLeft')+'px',opacity:"hide",width:'1px',height:'1px'},500,null,function(){if(zoom_close.attr('scaleImg')=='true'){zoom_content.html('');}
unfixBackgroundsForIE();zooming=false;});return false;}
function switchBackgroundImagesTo(to){$('#zoom_table td').each(function(i){var bg=$(this).css('background-image').replace(/\.(png|gif|none)\"\)$/,'.'+to+'")');$(this).css('background-image',bg);});var close_img=zoom_close.children('img');var new_img=close_img.attr('src').replace(/\.(png|gif|none)$/,'.'+to);close_img.attr('src',new_img);}
function fixBackgroundsForIE(){if($.browser.msie&&parseFloat($.browser.version)>=7){switchBackgroundImagesTo('gif');}}
function unfixBackgroundsForIE(){if($.browser.msie&&$.browser.version>=7){switchBackgroundImagesTo('png');}}}})();(function($){$.fn.ajaxSubmit=function(options){if(typeof options=='function')
options={success:options};options=$.extend({url:this.attr('action')||window.location.toString(),type:this.attr('method')||'GET'},options||{});var veto={};$.event.trigger('form.pre.serialize',[this,options,veto]);if(veto.veto)return this;var a=this.formToArray(options.semantic);if(options.data){for(var n in options.data)
a.push({name:n,value:options.data[n]});}
if(options.beforeSubmit&&options.beforeSubmit(a,this,options)===false)return this;$.event.trigger('form.submit.validate',[a,this,options,veto]);if(veto.veto)return this;var q=$.param(a);if(options.type.toUpperCase()=='GET'){options.url+=(options.url.indexOf('?')>=0?'&':'?')+q;options.data=null;}
else
options.data=q;var $form=this,callbacks=[];if(options.resetForm)callbacks.push(function(){$form.resetForm();});if(options.clearForm)callbacks.push(function(){$form.clearForm();});if(!options.dataType&&options.target){var oldSuccess=options.success||function(){};callbacks.push(function(data){if(this.evalScripts)
$(options.target).attr("innerHTML",data).evalScripts().each(oldSuccess,arguments);else
$(options.target).html(data).each(oldSuccess,arguments);});}
else if(options.success)
callbacks.push(options.success);options.success=function(data,status){for(var i=0,max=callbacks.length;i<max;i++)
callbacks[i](data,status,$form);};var files=$('input:file',this).fieldValue();var found=false;for(var j=0;j<files.length;j++)
if(files[j])
found=true;if(options.iframe||found){if($.browser.safari&&options.closeKeepAlive)
$.get(options.closeKeepAlive,fileUpload);else
fileUpload();}
else
$.ajax(options);$.event.trigger('form.submit.notify',[this,options]);return this;function fileUpload(){var form=$form[0];var opts=$.extend({},$.ajaxSettings,options);var id='jqFormIO'+$.fn.ajaxSubmit.counter++;var $io=$('<iframe id="'+id+'" name="'+id+'" />');var io=$io[0];var op8=$.browser.opera&&window.opera.version()<9;if($.browser.msie||op8)io.src='javascript:false;document.write("");';$io.css({position:'absolute',top:'-1000px',left:'-1000px'});var xhr={responseText:null,responseXML:null,status:0,statusText:'n/a',getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){}};var g=opts.global;if(g&&!$.active++)$.event.trigger("ajaxStart");if(g)$.event.trigger("ajaxSend",[xhr,opts]);var cbInvoked=0;var timedOut=0;setTimeout(function(){var encAttr=form.encoding?'encoding':'enctype';var t=$form.attr('target'),a=$form.attr('action');$form.attr({target:id,method:'POST',action:opts.url});form[encAttr]='multipart/form-data';if(opts.timeout)
setTimeout(function(){timedOut=true;cb();},opts.timeout);$io.appendTo('body');io.attachEvent?io.attachEvent('onload',cb):io.addEventListener('load',cb,false);form.submit();$form.attr({action:a,target:t});},10);function cb(){if(cbInvoked++)return;io.detachEvent?io.detachEvent('onload',cb):io.removeEventListener('load',cb,false);var ok=true;try{if(timedOut)throw'timeout';var data,doc;doc=io.contentWindow?io.contentWindow.document:io.contentDocument?io.contentDocument:io.document;xhr.responseText=doc.body?doc.body.innerHTML:null;xhr.responseXML=doc.XMLDocument?doc.XMLDocument:doc;if(opts.dataType=='json'||opts.dataType=='script'){var ta=doc.getElementsByTagName('textarea')[0];data=ta?ta.value:xhr.responseText;if(opts.dataType=='json')
eval("data = "+data);else
$.globalEval(data);}
else if(opts.dataType=='xml'){data=xhr.responseXML;if(!data&&xhr.responseText!=null)
data=toXml(xhr.responseText);}
else{data=xhr.responseText;}}
catch(e){ok=false;$.handleError(opts,xhr,'error',e);}
if(ok){opts.success(data,'success');if(g)$.event.trigger("ajaxSuccess",[xhr,opts]);}
if(g)$.event.trigger("ajaxComplete",[xhr,opts]);if(g&&!--$.active)$.event.trigger("ajaxStop");if(opts.complete)opts.complete(xhr,ok?'success':'error');setTimeout(function(){$io.remove();xhr.responseXML=null;},100);};function toXml(s,doc){if(window.ActiveXObject){doc=new ActiveXObject('Microsoft.XMLDOM');doc.async='false';doc.loadXML(s);}
else
doc=(new DOMParser()).parseFromString(s,'text/xml');return(doc&&doc.documentElement&&doc.documentElement.tagName!='parsererror')?doc:null;};};};$.fn.ajaxSubmit.counter=0;$.fn.ajaxForm=function(options){return this.ajaxFormUnbind().submit(submitHandler).each(function(){this.formPluginId=$.fn.ajaxForm.counter++;$.fn.ajaxForm.optionHash[this.formPluginId]=options;$(":submit,input:image",this).click(clickHandler);});};$.fn.ajaxForm.counter=1;$.fn.ajaxForm.optionHash={};function clickHandler(e){var $form=this.form;$form.clk=this;if(this.type=='image'){if(e.offsetX!=undefined){$form.clk_x=e.offsetX;$form.clk_y=e.offsetY;}else if(typeof $.fn.offset=='function'){var offset=$(this).offset();$form.clk_x=e.pageX-offset.left;$form.clk_y=e.pageY-offset.top;}else{$form.clk_x=e.pageX-this.offsetLeft;$form.clk_y=e.pageY-this.offsetTop;}}
setTimeout(function(){$form.clk=$form.clk_x=$form.clk_y=null;},10);};function submitHandler(){var id=this.formPluginId;var options=$.fn.ajaxForm.optionHash[id];$(this).ajaxSubmit(options);return false;};$.fn.ajaxFormUnbind=function(){this.unbind('submit',submitHandler);return this.each(function(){$(":submit,input:image",this).unbind('click',clickHandler);});};$.fn.formToArray=function(semantic){var a=[];if(this.length==0)return a;var form=this[0];var els=semantic?form.getElementsByTagName('*'):form.elements;if(!els)return a;for(var i=0,max=els.length;i<max;i++){var el=els[i];var n=el.name;if(!n)continue;if(semantic&&form.clk&&el.type=="image"){if(!el.disabled&&form.clk==el)
a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y});continue;}
var v=$.fieldValue(el,true);if(v&&v.constructor==Array){for(var j=0,jmax=v.length;j<jmax;j++)
a.push({name:n,value:v[j]});}
else if(v!==null&&typeof v!='undefined')
a.push({name:n,value:v});}
if(!semantic&&form.clk){var inputs=form.getElementsByTagName("input");for(var i=0,max=inputs.length;i<max;i++){var input=inputs[i];var n=input.name;if(n&&!input.disabled&&input.type=="image"&&form.clk==input)
a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y});}}
return a;};$.fn.formSerialize=function(semantic){return $.param(this.formToArray(semantic));};$.fn.fieldSerialize=function(successful){var a=[];this.each(function(){var n=this.name;if(!n)return;var v=$.fieldValue(this,successful);if(v&&v.constructor==Array){for(var i=0,max=v.length;i<max;i++)
a.push({name:n,value:v[i]});}
else if(v!==null&&typeof v!='undefined')
a.push({name:this.name,value:v});});return $.param(a);};$.fn.fieldValue=function(successful){for(var val=[],i=0,max=this.length;i<max;i++){var el=this[i];var v=$.fieldValue(el,successful);if(v===null||typeof v=='undefined'||(v.constructor==Array&&!v.length))
continue;v.constructor==Array?$.merge(val,v):val.push(v);}
return val;};$.fieldValue=function(el,successful){var n=el.name,t=el.type,tag=el.tagName.toLowerCase();if(typeof successful=='undefined')successful=true;if(successful&&(!n||el.disabled||t=='reset'||t=='button'||(t=='checkbox'||t=='radio')&&!el.checked||(t=='submit'||t=='image')&&el.form&&el.form.clk!=el||tag=='select'&&el.selectedIndex==-1))
return null;if(tag=='select'){var index=el.selectedIndex;if(index<0)return null;var a=[],ops=el.options;var one=(t=='select-one');var max=(one?index+1:ops.length);for(var i=(one?index:0);i<max;i++){var op=ops[i];if(op.selected){var v=$.browser.msie&&!(op.attributes['value'].specified)?op.text:op.value;if(one)return v;a.push(v);}}
return a;}
return el.value;};$.fn.clearForm=function(){return this.each(function(){$('input,select,textarea',this).clearFields();});};$.fn.clearFields=$.fn.clearInputs=function(){return this.each(function(){var t=this.type,tag=this.tagName.toLowerCase();if(t=='text'||t=='password'||tag=='textarea')
this.value='';else if(t=='checkbox'||t=='radio')
this.checked=false;else if(tag=='select')
this.selectedIndex=-1;});};$.fn.resetForm=function(){return this.each(function(){if(typeof this.reset=='function'||(typeof this.reset=='object'&&!this.reset.nodeType))
this.reset();});};$.fn.enable=function(b){if(b==undefined)b=true;return this.each(function(){this.disabled=!b});};$.fn.select=function(select){if(select==undefined)select=true;return this.each(function(){var t=this.type;if(t=='checkbox'||t=='radio')
this.checked=select;else if(this.tagName.toLowerCase()=='option'){var $sel=$(this).parent('select');if(select&&$sel[0]&&$sel[0].type=='select-one'){$sel.find('option').select(false);}
this.selected=select;}});};})(jQuery);(function($){$.hotkeys=function(options){for(key in options)$.hotkey(key,options[key])
return this}
$.hotkey=function(key,value){var code=$.hotkeys.special[key]==null?key.charCodeAt(0):$.hotkeys.special[key]
$.hotkeys.cache[code]=value
return this}
$.hotkeys.cache={}
$.hotkeys.special={'enter':45,'?':191,'/':223}
if($.browser.mozilla)$.hotkeys.special['?']=0})(jQuery)
jQuery(document).ready(function($){$('a[hotkey]').each(function(){$.hotkey($(this).attr('hotkey'),$(this).attr('href'))})
$(document).bind('keydown.hotkey',function(e){var el,code
if($(e.target).is(':input'))return
if(e.ctrlKey||e.altKey||e.metaKey)return true
code=e.shiftKey?e.keyCode:(e.keyCode+32)
if(el=$.hotkeys.cache[code]){$.isFunction(el)?el.call(this):window.location=el
return false}})});(function($){$.fn.editable=function(target,options){var settings={target:target,name:'value',id:'id',type:'text',width:'auto',height:'auto',event:'click',onblur:'cancel',loadtype:'GET',loadtext:'Loading...',placeholder:'Click to edit',submittype:'post',loaddata:{},submitdata:{}};if(options){$.extend(settings,options);}
var plugin=$.editable.types[settings.type].plugin||function(){};var submit=$.editable.types[settings.type].submit||function(){};var buttons=$.editable.types[settings.type].buttons||$.editable.types['defaults'].buttons;var content=$.editable.types[settings.type].content||$.editable.types['defaults'].content;var element=$.editable.types[settings.type].element||$.editable.types['defaults'].element;var callback=settings.callback||function(){};if(!$.isFunction($(this)[settings.event])){$.fn[settings.event]=function(fn){return fn?this.bind(settings.event,fn):this.trigger(settings.event);}}
$(this).attr('title',settings.tooltip);settings.autowidth='auto'==settings.width;settings.autoheight='auto'==settings.height;return this.each(function(){if(!$.trim($(this).html())){$(this).html(settings.placeholder);}
$(this)[settings.event](function(e){var self=this;if(self.editing){return;}
$(self).css("visibility","hidden");if(settings.width!='none'){settings.width=settings.autowidth?$(self).width():settings.width;}
if(settings.height!='none'){settings.height=settings.autoheight?$(self).height():settings.height;}
$(this).css("visibility","");if($(this).html().toLowerCase().replace(/;/,'')==settings.placeholder.toLowerCase().replace(/;/,'')){$(this).html('');}
self.editing=true;self.revert=$(self).html();$(self).html('');var form=$('<form/>');if(settings.cssclass){if('inherit'==settings.cssclass){form.attr('class',$(self).attr('class'));}else{form.attr('class',settings.cssclass);}}
if(settings.style){if('inherit'==settings.style){form.attr('style',$(self).attr('style'));form.css('display',$(self).css('display'));}else{form.attr('style',settings.style);}}
var input=element.apply(form,[settings,self]);var input_content;if(settings.loadurl){var t=setTimeout(function(){input.disabled=true;content.apply(form,[settings.loadtext,settings,self]);},100);var loaddata={};loaddata[settings.id]=self.id;if($.isFunction(settings.loaddata)){$.extend(loaddata,settings.loaddata.apply(self,[self.revert,settings]));}else{$.extend(loaddata,settings.loaddata);}
$.ajax({type:settings.loadtype,url:settings.loadurl,data:loaddata,async:false,success:function(result){window.clearTimeout(t);input_content=result;input.disabled=false;}});}else if(settings.data){input_content=settings.data;if($.isFunction(settings.data)){input_content=settings.data.apply(self,[self.revert,settings]);}}else{input_content=self.revert;}
content.apply(form,[input_content,settings,self]);input.attr('name',settings.name);buttons.apply(form,[settings,self]);plugin.apply(form,[settings,self]);$(self).append(form);$(':input:visible:enabled:first',form).focus();if(settings.select){input.select();}
input.keydown(function(e){if(e.keyCode==27){input.blur();e.preventDefault();reset();}});var t;if('cancel'==settings.onblur){input.blur(function(e){t=setTimeout(reset,500);});}else if('submit'==settings.onblur){input.blur(function(e){form.submit();});}else if($.isFunction(settings.onblur)){input.blur(function(e){settings.onblur.apply(self,[input.val(),settings]);});}else{input.blur(function(e){});}
form.submit(function(e){if(t){clearTimeout(t);}
e.preventDefault();submit.apply(form,[settings,self]);if($.isFunction(settings.target)){var str=settings.target.apply(self,[input.val(),settings]);$(self).html(str);self.editing=false;callback.apply(self,[self.innerHTML,settings]);if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}else{var submitdata={};submitdata[settings.name]=input.val();submitdata[settings.id]=self.id;if($.isFunction(settings.submitdata)){$.extend(submitdata,settings.submitdata.apply(self,[self.revert,settings]));}else{$.extend(submitdata,settings.submitdata);}
$(self).html(settings.indicator);$.ajax({type:settings.submittype,url:settings.target,data:submitdata,success:function(str){$(self).html(str);self.editing=false;callback.apply(self,[self.innerHTML,settings]);if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}});}
return false;});function reset(){$(self).html(self.revert);self.editing=false;if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}
$(self).bind('reset',reset)});});};$.editable={types:{defaults:{element:function(settings,original){var input=$('<input type="hidden">');$(this).append(input);return(input);},content:function(string,settings,original){$(':input:first',this).val(string);},buttons:function(settings,original){if(settings.submit){var submit=$('<input type="submit">');submit.val(settings.submit);$(this).append(submit);}
if(settings.cancel){var cancel=$('<input type="button">');cancel.val(settings.cancel);$(this).append(cancel);$(cancel).click(function(){$(original).html(original.revert);original.editing=false;});}}},text:{element:function(settings,original){var input=$('<input>');if(settings.width!='none'){input.width(settings.width);}
if(settings.height!='none'){input.height(settings.height);}
input.attr('autocomplete','off');$(this).append(input);return(input);}},textarea:{element:function(settings,original){var textarea=$('<textarea>');if(settings.rows){textarea.attr('rows',settings.rows);}else{textarea.height(settings.height);}
if(settings.cols){textarea.attr('cols',settings.cols);}else{textarea.width(settings.width);}
$(this).append(textarea);return(textarea);}},select:{element:function(settings,original){var select=$('<select>');$(this).append(select);return(select);},content:function(string,settings,original){if(String==string.constructor){eval('var json = '+string);for(var key in json){if(!json.hasOwnProperty(key)){continue;}
if('selected'==key){continue;}
var option=$('<option>').val(key).append(json[key]);$('select',this).append(option);}}
$('select',this).children().each(function(){if($(this).val()==json['selected']){$(this).attr('selected','selected');};});}}},addInputType:function(name,input){$.editable.types[name]=input;}};})(jQuery);(function($){$.extend($.fn,{livequery:function(type,fn,fn2){var self=this,q;if($.isFunction(type))
fn2=fn,fn=type,type=undefined;$.each($.livequery.queries,function(i,query){if(self.selector==query.selector&&self.context==query.context&&type==query.type&&(!fn||fn.$lqguid==query.fn.$lqguid)&&(!fn2||fn2.$lqguid==query.fn2.$lqguid))
return(q=query)&&false;});q=q||new $.livequery(this.selector,this.context,type,fn,fn2);q.stopped=false;$.livequery.run(q.id);return this;},expire:function(type,fn,fn2){var self=this;if($.isFunction(type))
fn2=fn,fn=type,type=undefined;$.each($.livequery.queries,function(i,query){if(self.selector==query.selector&&self.context==query.context&&(!type||type==query.type)&&(!fn||fn.$lqguid==query.fn.$lqguid)&&(!fn2||fn2.$lqguid==query.fn2.$lqguid)&&!this.stopped)
$.livequery.stop(query.id);});return this;}});$.livequery=function(selector,context,type,fn,fn2){this.selector=selector;this.context=context||document;this.type=type;this.fn=fn;this.fn2=fn2;this.elements=[];this.stopped=false;this.id=$.livequery.queries.push(this)-1;fn.$lqguid=fn.$lqguid||$.livequery.guid++;if(fn2)fn2.$lqguid=fn2.$lqguid||$.livequery.guid++;return this;};$.livequery.prototype={stop:function(){var query=this;if(this.type)
this.elements.unbind(this.type,this.fn);else if(this.fn2)
this.elements.each(function(i,el){query.fn2.apply(el);});this.elements=[];this.stopped=true;},run:function(){if(this.stopped)return;var query=this;var oEls=this.elements,els=$(this.selector,this.context),nEls=els.not(oEls);this.elements=els;if(this.type){nEls.bind(this.type,this.fn);if(oEls.length>0)
$.each(oEls,function(i,el){if($.inArray(el,els)<0)
$.event.remove(el,query.type,query.fn);});}
else{nEls.each(function(){query.fn.apply(this);});if(this.fn2&&oEls.length>0)
$.each(oEls,function(i,el){if($.inArray(el,els)<0)
query.fn2.apply(el);});}}};$.extend($.livequery,{guid:0,queries:[],queue:[],running:false,timeout:null,checkQueue:function(){if($.livequery.running&&$.livequery.queue.length){var length=$.livequery.queue.length;while(length--)
$.livequery.queries[$.livequery.queue.shift()].run();}},pause:function(){$.livequery.running=false;},play:function(){$.livequery.running=true;$.livequery.run();},registerPlugin:function(){$.each(arguments,function(i,n){if(!$.fn[n])return;var old=$.fn[n];$.fn[n]=function(){var r=old.apply(this,arguments);$.livequery.run();return r;}});},run:function(id){if(id!=undefined){if($.inArray(id,$.livequery.queue)<0)
$.livequery.queue.push(id);}
else
$.each($.livequery.queries,function(id){if($.inArray(id,$.livequery.queue)<0)
$.livequery.queue.push(id);});if($.livequery.timeout)clearTimeout($.livequery.timeout);$.livequery.timeout=setTimeout($.livequery.checkQueue,20);},stop:function(id){if(id!=undefined)
$.livequery.queries[id].stop();else
$.each($.livequery.queries,function(id){$.livequery.queries[id].stop();});}});$.livequery.registerPlugin('append','prepend','after','before','wrap','attr','removeAttr','addClass','removeClass','toggleClass','empty','remove');$(function(){$.livequery.play();});var init=$.prototype.init;$.prototype.init=function(a,c){var r=init.apply(this,arguments);if(a&&a.selector)
r.context=a.context,r.selector=a.selector;if(typeof a=='string')
r.context=c||document,r.selector=a;return r;};$.prototype.init.prototype=$.prototype;})(jQuery);;(function(){Primer=function(container,width,height){this.container=container
this.width=width
this.height=height
this.actions=[]
this.init()}
Primer.prototype={init:function(){var el=$(this.container).eq(0)
el.append('<canvas width="'+this.width+'" height="'+this.height+'"></canvas>')
var jelc=$('canvas',el)
var elc=jelc[0]
this.context=elc.getContext('2d')
this.root=new Primer.Layer()
this.root.bind(this)
var self=this
jelc.eq(0).mousemove(function(e){e.localX=e.clientX-elc.offsetLeft
e.localY=e.clientY-elc.offsetTop
self.ghost(e)})},addChild:function(child){child.bind(this)
this.root.addChild(child)
this.draw()},draw:function(){this.context.clearRect(0,0,this.width,this.height)
this.root.draw()},ghost:function(e){this.root.ghost(e)
for(var i in this.actions){var action=this.actions[i]
action[0](action[1])}
this.actions=[]}}
Primer.Layer=function(){this.primer=null
this.children=[]
this.calls=[]
this.xVal=0
this.yVal=0
this.visibleVal=true
this.mouseoverVal=function(){}
this.mouseoutVal=function(){}
this.mouseWithin=false}
Primer.Layer.prototype={bind:function(primer){this.primer=primer
for(var i in this.children){this.children[i].bind(primer)}},get context(){return this.primer.context},get x(){return this.xVal},set x(xVal){this.xVal=xVal
if(this.primer)this.primer.draw()},get y(){return this.yVal},set y(yVal){this.yVal=yVal
if(this.primer)this.primer.draw()},get visible(){return this.visibleVal},set visible(visibleVal){this.visibleVal=visibleVal
if(this.primer)this.primer.draw()},addChild:function(child){child.bind(this.primer)
this.children.push(child)
if(this.primer)this.primer.draw()},mouseover:function(fn){this.mouseoverVal=fn},mouseout:function(fn){this.mouseoutVal=fn},set fillStyle(a){this.calls.push(["fillStyle",a])},set strokeStyle(a){this.calls.push(["strokeStyle",a])},beginPath:function(){this.calls.push(["beginPath"])},moveTo:function(a,b){this.calls.push(["moveTo",a,b])},lineTo:function(a,b){this.calls.push(["lineTo",a,b])},fill:function(){this.calls.push(["fill"])},stroke:function(){this.calls.push(["stroke"])},fillRect:function(a,b,c,d){this.calls.push(["fillRect",a,b,c,d])},draw:function(){if(!this.visible){return}
this.context.save()
this.context.translate(this.x,this.y)
for(var i in this.calls){var call=this.calls[i]
switch(call[0]){case"strokeStyle":this.context.strokeStyle=call[1];break
case"fillStyle":this.context.fillStyle=call[1];break
case"fillRect":this.context.fillRect(call[1],call[2],call[3],call[4]);break
case"beginPath":this.context.beginPath();break
case"moveTo":this.context.moveTo(call[1],call[2]);break
case"lineTo":this.context.lineTo(call[1],call[2]);break
case"fill":this.context.fill();break
case"stroke":this.context.stroke();break}}
for(var i in this.children){this.children[i].draw()}
this.context.restore()},ghost:function(e){if(!this.visible){return}
this.context.save()
this.context.translate(this.x,this.y)
for(var i in this.calls){var call=this.calls[i]
switch(call[0]){case"fillRect":this.ghostFillRect(e,call[1],call[2],call[3],call[4]);break
case"beginPath":this.context.beginPath();break
case"moveTo":this.context.moveTo(call[1],call[2]);break
case"lineTo":this.context.lineTo(call[1],call[2]);break
case"fill":this.ghostFill(e);break}}
for(var i in this.children){e.localX-=this.x
e.localY-=this.y
this.children[i].ghost(e)}
this.context.restore()},ghostDetect:function(e){if(this.context.isPointInPath(e.localX-this.x,e.localY-this.y)){if(!this.mouseWithin){this.primer.actions.push([this.mouseoverVal,e])}
this.mouseWithin=true}else{if(this.mouseWithin){this.primer.actions.push([this.mouseoutVal,e])}
this.mouseWithin=false}},ghostFillRect:function(e,x,y,w,h){this.context.beginPath()
this.context.moveTo(x,y)
this.context.lineTo(x+w,y)
this.context.lineTo(x+w,y+h)
this.context.lineTo(x,y+h)
this.context.lineTo(x,y)
this.ghostDetect(e)},ghostFill:function(e){this.ghostDetect(e)}}})();(function($){$.fn.relatizeDate=function(){return $(this).each(function(){if($(this).hasClass('relatized'))return
$(this).text($.relatizeDate(this)).addClass('relatized')})}
$.relatizeDate=function(element){return $.relatizeDate.timeAgoInWords(new Date($(element).text()))}
$r=$.relatizeDate
$.extend($.relatizeDate,{shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],months:['January','February','March','April','May','June','July','August','September','October','November','December'],strftime:function(date,format){var day=date.getDay(),month=date.getMonth();var hours=date.getHours(),minutes=date.getMinutes();var pad=function(num){var string=num.toString(10);return new Array((2-string.length)+1).join('0')+string};return format.replace(/\%([aAbBcdHImMpSwyY])/g,function(part){switch(part[1]){case'a':return $r.shortDays[day];break;case'A':return $r.days[day];break;case'b':return $r.shortMonths[month];break;case'B':return $r.months[month];break;case'c':return date.toString();break;case'd':return pad(date.getDate());break;case'H':return pad(hours);break;case'I':return pad((hours+12)%12);break;case'm':return pad(month+1);break;case'M':return pad(minutes);break;case'p':return hours>12?'PM':'AM';break;case'S':return pad(date.getSeconds());break;case'w':return day;break;case'y':return pad(date.getFullYear()%100);break;case'Y':return date.getFullYear().toString();break;}})},timeAgoInWords:function(targetDate,includeTime){return $r.distanceOfTimeInWords(targetDate,new Date(),includeTime);},distanceOfTimeInWords:function(fromTime,toTime,includeTime){var delta=parseInt((toTime.getTime()-fromTime.getTime())/1000);if(delta<60){return'just now';}else if(delta<120){return'about a minute ago';}else if(delta<(45*60)){return(parseInt(delta/60)).toString()+' minutes ago';}else if(delta<(120*60)){return'about an hour ago';}else if(delta<(24*60*60)){return'about '+(parseInt(delta/3600)).toString()+' hours ago';}else if(delta<(48*60*60)){return'1 day ago';}else{var days=(parseInt(delta/86400)).toString();if(days>5){var fmt='%B %d, %Y'
if(includeTime)fmt+=' %I:%M %p'
return $r.strftime(fromTime,fmt);}else{return days+" days ago"}}}})})(jQuery);(function($){$.put=function(url,data,callback,type){if(jQuery.isFunction(data)){callback=data;data={};}
return jQuery.ajax({type:"PUT",url:url,data:data,success:callback,dataType:type});}
$.del=function(url,data,callback,type){if(jQuery.isFunction(data)){callback=data;data={};}
return jQuery.ajax({type:"DELETE",url:url,data:data,success:callback,dataType:type});}})(jQuery);;(function($){$.smartPoller=function(wait,poller){if($.isFunction(wait)){poller=wait
wait=1000}
(function startPoller(){setTimeout(function(){poller.call(this,startPoller)},wait)
wait=wait*1.5})()}})(jQuery);(function($){$.fn.spamjax=function(callback,settings){if($.isFunction(settings)){var s=callback,callback=settings,settings=s}
var settings=settings||{}
var options={}
if(!$.facebox)settings.facebox=null
options.complete=function(xhr,ok){callback.call(this,xhr.responseText,ok)}
if(settings.confirmation){options.beforeSubmit=function(){var execute=confirm(settings.confirmation)
if(!execute)return false
if(settings.facebox)$.facebox.loading()}}else if(settings.facebox){options.beforeSubmit=$.facebox.loading}
return $(this).ajaxForm($.extend(settings,options))}})(jQuery);jQuery.fn.truncate=function(max,settings){settings=jQuery.extend({chars:/\s/,trail:["...",""]},settings);var myResults={};var ie=$.browser.msie;function fixIE(o){if(ie){o.style.removeAttribute("filter");}}
return this.each(function(){var $this=jQuery(this);var myStrOrig=$this.html().replace(/\r\n/gim,"");var myStr=myStrOrig;var myRegEx=/<\/?[^<>]*\/?>/gim;var myRegExArray;var myRegExHash={};var myResultsKey=$("*").index(this);while((myRegExArray=myRegEx.exec(myStr))!=null){myRegExHash[myRegExArray.index]=myRegExArray[0];}
myStr=jQuery.trim(myStr.split(myRegEx).join(""));if(myStr.length>max){var c;while(max<myStr.length){c=myStr.charAt(max);if(c.match(settings.chars)){myStr=myStr.substring(0,max);break;}
max--;}
if(myStrOrig.search(myRegEx)!=-1){var endCap=0;for(eachEl in myRegExHash){myStr=[myStr.substring(0,eachEl),myRegExHash[eachEl],myStr.substring(eachEl,myStr.length)].join("");if(eachEl<myStr.length){endCap=myStr.length;}}
$this.html([myStr.substring(0,endCap),myStr.substring(endCap,myStr.length).replace(/<(\w+)[^>]*>.*<\/\1>/gim,"").replace(/<(br|hr|img|input)[^<>]*\/?>/gim,"")].join(""));}else{$this.html(myStr);}
myResults[myResultsKey]=myStrOrig;$this.html(["<div class='truncate_less'>",$this.html(),settings.trail[0],"</div>"].join("")).find(".truncate_show",this).click(function(){if($this.find(".truncate_more").length==0){$this.append(["<div class='truncate_more' style='display: none;'>",myResults[myResultsKey],settings.trail[1],"</div>"].join("")).find(".truncate_hide").click(function(){$this.find(".truncate_more").css("background","#fff").fadeOut("normal",function(){$this.find(".truncate_less").css("background","#fff").fadeIn("normal",function(){fixIE(this);$(this).css("background","none");});fixIE(this);});return false;});}
$this.find(".truncate_less").fadeOut("normal",function(){$this.find(".truncate_more").fadeIn("normal",function(){fixIE(this);});fixIE(this);});jQuery(".truncate_show",$this).click(function(){$this.find(".truncate_less").css("background","#fff").fadeOut("normal",function(){$this.find(".truncate_more").css("background","#fff").fadeIn("normal",function(){fixIE(this);$(this).css("background","none");});fixIE(this);});return false;});return false;});}});};var GitHub={gravatar:function(md5,size){size=size||35
var host=location.protocol=='https:'?'https://secure.gravatar.com':'http://gravatar.com'
var prot=location.protocol=='https:'?'https':'http'
return'<img src="'+host+'/avatar/'+md5+'?s='+size+'&d='+prot+'%3A%2F%2Fgithub.com%2Fimages%2Fgravatars%2Fgravatar-'+size+'.png" />'},rename_confirmation:function(){return"Read the following before clicking OK:\n\n\
* This may take a few minutes.\n\
* We won't setup any redirects from your old name. This includes repository urls, your profile, any feeds, etc. \
In other words, if you have a popular project, you're probably going to upset a lot of people.\n\
* You'll need to update any .git/config's to point to your new name if you have local copies of your repo(s).\n\n\
Ready to proceed?"}}
Function.prototype.delay=function(time){return setTimeout(this,time)}
$.fn.scrollTo=function(el,speed){var target,container
if(typeof el=='number'||!el){speed=el
target=this
container='html,body'}else{target=el
container=this}
var offset=$(target).offset().top-30
$(container).animate({scrollTop:offset},speed||1000)
return this}
$.gitbox=function(url,klass){$.facebox(function(){$.get(url,function(data){$.facebox(data,'nopad')
$('#facebox .footer').hide()})})}
$.fn.spin=function(){return this.after('<img src="/images/modules/ajax/indicator.gif" id="spinner"/>')}
$.fn.stopSpin=function(){this.next().remove()
return this}
$(function(){$('.toggle_link').click(function(){$($(this).attr('href')).toggle()
return false})
$('.hide_alert').livequery('click',function(){$('#site_alert').slideUp()
$.cookie('hide_alert_vote','t',{expires:7,path:'/'})
return false})
$('.hide_div').click(function(){$(this).parents('div:first').fadeOut()
return false})
$('#login_field').focus()
$('#versions_select').change(function(){location.href=this.value})
$(document).bind('loading.facebox',function(){$('.clippy').hide()})
$(document).bind('close.facebox',function(){$('.clippy').show()})
if($.fn.facebox)$('a[rel*=facebox]').facebox()
if($.fn.fancyZoom)$('a[rel*=fancyzoom]').fancyZoom({directory:'images/fancyzoom'})
if($.fn.truncate){$('.truncate').bind('truncate',function(){$(this).truncate(50,{chars:/.*/})}).trigger('truncate')}
if($.fn.relatizeDate)$('.relatize').relatizeDate()
$('a[href=#][alt^=""]').hover(function(){window.status=$(this).attr('alt')},function(){window.status=''})
var searchField=$('.topsearch input[name=q]')
$.hotkey('s',function(){searchField.val('').focus()})
if(searchField.length>0&&typeof(searchField[0].onsearch)!='object')
searchField.addClass('notnative')
searchField.bind('blur keyup',function(){$(this).val()==''?$(this).addClass('placeholder'):$(this).removeClass('placeholder')}).blur()
searchField.focus(function(){$(this).removeClass('placeholder')})
$.repoAutocomplete=function(){var klass='.repo_autocompleter'
if(!$.fn.autocomplete||!github_user||$(klass)==0)return
$(klass).autocomplete('/users/ajax_repo_search',{delay:10,width:210,selectFirst:false})
$(klass).result(function(event,data,formatted){window.location='/'+data[0]
return false})
$(klass).keydown(function(event){if(!/\//.test($(klass).val())&&event.keyCode==9){var repo=$('.ac_results li:first').text()
if(repo){$(klass).val(repo)
window.location='/'+repo
return false}}})}
$.repoAutocomplete()
$.userAutocomplete=function(){if(!$.fn.autocomplete||$('.autocompleter').length==0)return
$(".autocompleter").autocomplete('/users/ajax_search',{formatItem:function(row){row=row[0].split(' ')
return GitHub.gravatar(row[1],24)+' '+row[0]},formatResult:function(row){return row[0].split(' ')[0]}})
$(".autocompleter").result(function(){$(this).addClass('accept')})
$(".autocompleter").keypress(function(){$(this).removeClass('accept')})}
$.userAutocomplete()
if($('#csrf_token').length>0){var auth_string='&request_uri='+window.location.pathname+'&authenticity_token='+$('#csrf_token').text()
$.ajaxSetup({beforeSend:function(xhr,settings){xhr.setRequestHeader("Accept","text/javascript")
if(typeof settings.data=='string'){settings.data+=auth_string}else if(!settings.data){settings.data=auth_string}}})}else{$.ajaxSetup({'beforeSend':function(xhr){xhr.setRequestHeader("Accept","text/javascript")}})}});GitHub.highlightLines=function(e){var target,lines
if(e){$('.line').css('background-color','transparent')
target=$(this).attr('rel')
if(e.shiftKey){target=window.location.hash.replace(/-\d+/,'')+'-'+target.replace(/\D/g,'')}
window.location.hash=target}else{target=window.location.hash}
if(lines=target.match(/#?(?:L|-)(\d+)/g)){lines=$.map(lines,function(line){return parseInt(line.replace(/\D/g,''))})
if(lines.length==1)
return $('#LC'+lines[0]).css('background-color','#ffc')
for(var i=lines[0];i<=lines[1];i++)
$('#LC'+i).css('background-color','#ffc')
$('#LC'+lines[0]).scrollTo(1)}
return false}
GitHub.scrollToHilightedLine=function(){var lines,target=window.location.hash
if(lines=target.match(/^#?(?:L|-)(\d+)$/g)){lines=$.map(lines,function(line){return parseInt(line.replace(/\D/g,''))})
$('#LID'+lines[0]).scrollTo(1)}}
$(function(){GitHub.scrollToHilightedLine()
GitHub.highlightLines()
$('.line_numbers span').mousedown(GitHub.highlightLines)});GitHub.Commit={currentBubble:null,dumpEmptyClass:function(){$(this).removeClass('empty')},addEmptyClass:function(){if(!$(this).data('clicked')&&$(this).text()=='0')$(this).addClass('empty')},highlightLine:function(){$(this).parent().css('background','#ffc')},unhighlightLine:function(){if(!$(this).data('clicked'))$(this).parent().css('background','')},jumpToHashFile:function(){if(window.location.hash&&!/diff-\d+/.test(window.location.hash)){var line,hash=window.location.hash
if(position=hash.match(/-P(\d+)/)){hash=hash.replace(position[0],'')
position=position[1]}
var target=$('#toc a:contains("'+hash.replace('#','')+'")')
if(target.length>0){var diff=target.attr('href')
$(diff).scrollTo(1)
if(position){setTimeout(function(){GitHub.Commit.highlightLine.call($(diff+' .cp-'+position))},50)}}}},observeHash:function(){if(window.location.hash!=GitHub.Commit.oldHash){GitHub.Commit.oldHash=window.location.hash
GitHub.Commit.jumpToHashFile()}}}
$(function(){GitHub.Commit.jumpToHashFile()
GitHub.Commit.oldHash=window.location.hash
setInterval(GitHub.Commit.observeHash,50)
var clearHovered=function(){if(GitHub.Commit.hovered){GitHub.Commit.addEmptyClass.call(GitHub.Commit.hovered)
GitHub.Commit.unhighlightLine.call(GitHub.Commit.hovered)
GitHub.Commit.hovered=null}}
$('#files').mouseout(function(e){var bubble=$(e.target)
bubble=bubble.is('.bubble')?bubble:bubble.parent()
if(bubble.is(':not(.faux-bubble)'))clearHovered()})
$('#files').mouseover(function(e){var bubble=$(e.target)
bubble=bubble.is('.bubble')?bubble:bubble.parent()
if(!bubble.is('.bubble'))return
GitHub.Commit.hovered=bubble
if(bubble.is('.empty'))
GitHub.Commit.dumpEmptyClass.call(bubble)
if(bubble.is(':not(.faux-bubble)'))
GitHub.Commit.highlightLine.call(bubble)})
$('#files').click(function(e){var bubble=$(e.target)
bubble=bubble.is('.bubble')?bubble:bubble.parent()
if(!bubble.is('.bubble'))return
bubble.data('clicked',true)
GitHub.currentBubble=bubble
var url=window.location.pathname.replace('commit','comments')
url+='/'+$.trim(bubble.parents('.file').find('.meta .info').text())
if(bubble.is(':not(.faux-bubble)')){var pos=parseInt(bubble.attr('class').match(/cp-(\d+)/)[1])
url+='?position='+pos}
if(pos){var firstLine=parseInt(bubble.parents('tbody').find('.line_numbers:first > a:first').text())
url+='&line='+(firstLine+pos-1)}
$.gitbox(url)})
$(document).bind('close.facebox',function(){if(GitHub.currentBubble){var el=GitHub.currentBubble
$(el).data('clicked',false)
GitHub.Commit.unhighlightLine.call(el)
GitHub.Commit.addEmptyClass.call(el)}})
$('.add_comment').livequery('click',function(){var text=$.trim($('#commit_comment_form textarea').val())
if(text==''){$('#commit_comments .inner').scrollTo('#commit_comment_form')}else{$('.actions :button').attr('disabled',true)
$('.add_comment').spin()
$.post($('#commit_comment_form').attr('action'),{body:text},function(data){$('.no_one').remove()
$('.comment_list .previewed').remove()
$('.comment_list').append(data)
$('#commit_comment_form textarea').val('')
$('.actions :button').attr('disabled',false).stopSpin()
GitHub.currentBubble.addClass('commented')
var count=GitHub.currentBubble.find('span')
count.text(parseInt(count.text())+1)})}})
$('#preview_comment').livequery('click',function(){$('.actions :button').attr('disabled',true)
$('.add_comment').spin()
var target=$('#commit_comment_form').attr('action').replace('create','preview')
var text=$.trim($('#commit_comment_form textarea').val())
$.post(target,{body:text},function(data){$('.no_one').remove()
$('.comment_list .previewed').remove()
$('.comment_list').append('<div class="previewed">'+data+'</div>')
$('.actions :button').attr('disabled',false).stopSpin()})})
$('.delete_comment').click(function(){var self=this
$(this).spin()
$.post(this.href,{'_method':'delete'},function(){$(self).next().remove()
$(self).parents('.comment').hide()})
return false})
$('#add_comment_button').click(function(){var self=this
$(self).spin().attr('disabled',true)
setTimeout(function(){$(self).parents('form').submit()},10)})
$.each(['line','file','all'],function(_,type){var klass=type+'_link'
$('a.'+klass).livequery('click',function(){$('.links a').show()
$('h1 span').hide()
$('span.'+klass).show()
$('a.'+klass).hide()
$('span.'+type+'_header').show()
$('.comment_list').hide()
$('#comments_for_'+type).toggle()
return false})})});GitHub.Commits={elements:[],current:null,selected:function(){return $(this.elements).eq(this.current)},select:function(index){this.current=index
$('.selected').removeClass('selected')
return this.elements.eq(index).addClass('selected')},next:function(){if(this.current!==null){if(this.elements.length-1==this.current)return
var el=this.select(++this.current)
if(el.offset().top-$(window).scrollTop()+50>$(window).height())el.scrollTo(200)}else{this.select(0)}},prev:function(){if(!this.current){this.elements.eq(0).removeClass('selected')
return this.current=null}
var el=this.select(--this.current)
if(el.offset().top-$(window).scrollTop()<0)el.scrollTo(200)},link:function(key){if(GitHub.Commits.current===null)return false
window.location=GitHub.Commits.selected().find('[hotkey='+key+']').attr('href')}}
$(function(){GitHub.Commits.elements=$('.commit')
$.hotkeys({c:function(){GitHub.Commits.link('c')},p:function(){GitHub.Commits.link('p')},t:function(){GitHub.Commits.link('t')},j:function(){GitHub.Commits.next()},k:function(){GitHub.Commits.prev()}})
$('#invite_link > a').click(function(){var url=location.pathname.match(/(.+\/commits)(\/|$)/)[1]+'/invitees'
$.post(url,{},function(invitees){if(invitees.length==0){$('#invitee_box > p').text("Everyone is already a GitHub user and/or there weren't any valid emails")
$('#invitee_box input').attr('disabled','disabled')}else{for(var i in invitees){var html='<li><label><input name="emails[]" value="'+invitees[i][0]+'" type="checkbox" /> '
html+=invitees[i][1]+' <small> - '+invitees[i][0]+'</label></li>'
$('#invitees').append(html)}
$('#invitee_box > p').hide()}},'json')
$(this).hide()
$('#invitee_box').show()
return false})
$('#invite_form').submit(function(){$(this).find('input[type=submit]').attr('value','Sending Invites...').attr('disabled','disabled')
$.post($(this).attr('action'),$(this).serialize(),function(){$('#invitee_box').html('<h3>Thanks!</h3>Your invites have been sent.')})
return false})
$('#invitee_box span a').click(function(){$('#invitee_box').hide()
return false})});$(function(){$('#your_repos').repoList({selector:'#repo_listing',ajaxUrl:'/dashboard/ajax_your_repos'})
$('#watched_repos').repoList({selector:'#watched_repo_listing',ajaxUrl:'/dashboard/ajax_watched_repos'})
$('.reveal_commits, .hide_commits').live('click',function(){var div=$(this).parents('.details')
div.find('.reveal, .hide_commits, .commits').toggle()
return false})
var ajaxing=false
$('.ajax_paginate a').live('click',function(){if(ajaxing)return false
ajaxing=true
var parent=$(this).parent()
$(this).html('<img src="/images/modules/ajax/indicator.gif"/>')
$.get(this.href,function(data){parent.replaceWith(data)
$('.relatize').relatizeDate()
ajaxing=false})
return false})});$(function(){if($('#repo_details').length==0)return
if(github_user!=GitHub.currentRepoOwner){if($('#repository_description').text()=='')
$('#repository_description').parents('tr:first').hide()
if($.trim($('#repository_homepage').text())=='')
$('#repository_homepage').parents('tr:first').hide()}
if(!github_user)return
if(GitHub.watchingRepo){$('#watch_button').hide()
$('#unwatch_button').show()}else{$('#watch_button').show()
$('#unwatch_button').hide()}
if(GitHub.currentRepoOwner==github_user){$('#edit_button').show()
$('#fork_button').hide()
$('#repository_description').addClass('edit').next().show()
$('#repository_homepage').addClass('edit').text($('#repository_homepage a').text())
$('#repository_homepage').next().show()}
if(GitHub.hasWriteAccess){$('#private_clone_url').show()
$('#public_clone_text').show()
$('#pull_request_button').show()}
if(GitHub.hasForkOfRepo){$('#fork_button').show()
var img=$('#fork_button img'),src=img.attr('src'),link=$('#fork_button a'),url=link.attr('href')
if(img.length>0)
img.attr('src',src.replace('fork_button.png','my_fork_button.png'))
if(link.length>0){var nameWithOwner=GitHub.currentRepoOwner+'/'+GitHub.currentRepo
link.attr('href',url.replace(nameWithOwner,GitHub.hasForkOfRepo).replace('/fork',''))}}});$(function(){$('#downloads .delete').click(function(){if(confirm('Are you sure you want to delete this?')){$(this).hide().parents('form').append('deleting&hellip;').submit()}
return false})})
GitHub.editableGenerator=function(options){return function(_,self){var defaults={id:'field',tooltip:'Click to edit!',indicator:'Saving...',data:function(data){return $(self).attr('data')||data},style:"display: inline",onblur:'submit',callback:function(){(function(){if($(self).attr('data'))$(self).attr('data',$(self).text())
$(self).trigger('truncate').next().show()
$(self).trigger('afterSave.editableGenerator')}).delay(20)}}
return $(this).editable($(this).attr('rel'),$.extend({},defaults,options))}}
$(function(){$('.edit_link').click(function(){$(this).prev().trigger('click')
return false})});$(function(){var new_import_options={success:function(){$.smartPoller(3000,function(retry){$.getJSON($('#new_import').attr('action')+'/grab_authors',{},function(authors){if(authors==null)return retry()
$('#wait').hide()
$('#import_repo').show()
if(authors.length==0){$('#new_import input[type=submit]').attr('disabled','').val('Import SVN Authors').show()
alert("No authors were returned, please try a different URL")}else{$('#authors').show()
$.each(authors,function(i,author){var li=$('<tr><td><input type="text" disabled="disabled" value="'+author+'" name="svn_authors[]" /></td><td><input size="40" type="text" name="git_authors[]"/></td></tr>')
li.appendTo('#authors-list')})
$('#import-submit').show()}})})},beforeSubmit:function(form,jqForm){var url=form[0].value
if(!url.match(/^https?:\/\//)&&!url.match(/^svn:\/\//)){alert('Please enter a valid subversion url')
return false}
jqForm.find('input[type=submit]').hide()
$('#import_repo').hide()
$('#wait').show()}}
$('#new_import').ajaxForm(new_import_options)
$('#import-submit').click(function(){$(this).attr('disabled','disabled')
var form=$(this).parent().parent()
form.find('input[name="svn_authors[]"]').attr('disabled','')
form.submit()})
$('#private-clone-url > a').bind('contextmenu',function(){var size=$(this).text().length
$(this).hide().next().attr('size',size).show().focus().get(0).select()
return false})
var dim=function(){$(this).hide().prev().show()}
$('#private-clone-url > :input').mouseout(dim).blur(dim)
$('.git_url_facebox').click(function(){$.facebox($($(this).attr('rel')).html(),'tip')
return false})
$('.repo span.edit').each(GitHub.editableGenerator({width:'350px'}))
$('.repo span.editarea').each(GitHub.editableGenerator({type:'textarea',width:'550px',height:'100px',cancel:'Cancel',submit:'OK'}))
$('span.edit, span.editarea').click(function(){$(this).next().hide()})
$('#run_postreceive_test').click(function(){$.post(location.href+'/test_postreceive',{})
$.facebox($('#postreceive_test').text())
return false})
$('#repository_postreceive_url').bind('afterSave.editableGenerator',function(){if($('#repository_postreceive_url').text().slice(0,4)=='http')
$('#run_postreceive_test').show()
else
$('#run_postreceive_test').hide()})
$('.toggle_watch').click(function(){if(!github_user)return true
$('#watch_button, #unwatch_button').toggle()
$.post($(this).attr('href'),{})
return false})
$('#donate_activate_toggle a').click(function(){$(this).parent().hide()
$('#donate_activate').show()
return false})
if($('#donation_creation_in_progress').length>0){$('#donate_activate_toggle').html("<span style='color:green;'>We're creating your Pledgie account. We'll PM you when it's ready!</span>")}
$('#pledgie_deactivate').click(function(){$('#paypal').val('')
return true})
$('.pull_request_button').click(function(){var url=location.pathname,ref=url.split('/')[4]||'master',target=url.split('/').slice(0,3).join('/'),self=this
$.facebox(function(){$.get(target+'/pull_request/'+ref,function(data){$.facebox(data,'nopad')
$('#facebox .footer').hide()
$.userAutocomplete()})})
return false})
$('.repo_toggle').click(function(){var options={}
options['field']=this.id
options['value']=this.checked?'1':'0'
var url=window.location.pathname.replace(/\/edit$/,'/update')
$.post(url,options)
$('#rubygem_save').show()})
$('.test_hook').click(function(){var self=$(this).spin().siblings('.right').remove().end()
var href=location.href.replace(/hooks/,'test_service')
$.post(href,{name:self.attr('rel')||''},function(){self.next().remove()
self.next().after('<div class="right"><em>Payload deployed</em></div>')})
return false})
$('.postreceive_hook_help').click(function(){$('#postreceive_urls-help').toggle()
return false})
$('.hook_edit_toggle').click(function(){$('.service-hook').hide()
$("#"+this.id.replace('-toggle','')).show()
var div=$('#'+this.id.replace('-toggle','-help'))
if(!div.is(":visible")){div.show()
div.html('<pre>Loading...</pre>')
var url='/pjhyett/github-services/tree/master/docs/'+div.attr('id').replace('-help','')
$.get(url,{'raw':'true'},function(data){div.html('<pre>'+data+'</pre>')})}
return false})
$('#close_facebox').livequery('click',function(){$(document).trigger('close.facebox')
return false})
$('#pull_request .select_all').livequery('click',function(){$('#facebox :checkbox').attr('checked',true)
return false})
$('#pull_request .add_recipient').livequery('click',function(){var user=$(this).prev().val()
$(this).prev().val('').css('background','Window')
if(!$.trim(user))return
var list=$('#pull_request .recipients ul')
var recipients=list.find('li').map(function(){return $.trim($(this).text())})
if($.inArray(user,recipients)>=0)return list.find('li:contains('+user+') :checkbox').attr('checked',true)
$('#pull_request .recipients ul').prepend('<li><label><input type="checkbox" name="message[to][]" value="'+user+'"/> '+user+'</label>').end().find(':checkbox:first').attr('checked',true)})
$('#pull_request_form').livequery('submit',function(){var empty=[]
var recipient_controls=$(this).find("input[name='message[to][]']")
recipient_controls.each(function(){if($(this).is(':checkbox')&&!$(this).attr('checked')||$(this).is(':text')&&$(this).val()=='')
empty.push($(this))})
if(empty.length==recipient_controls.length){$('#pull_request_error').show().text('Please select at least one recipient.')
return false}else{$(this).ajaxSubmit(function(){$('#pull_request_error').remove()
$('#pull_request').find('h1').text('Sent!').end().find('.pull_request_inside').empty().append('<p>Your pull request was sent.</p>').end().find('.actions span').remove().end().find('#close_facebox').text('Close')
var close=setTimeout(function(){$(document).trigger('close.facebox')},2500)
$(document).one('close.facebox',function(){clearTimeout(close)})})
return false}})
$('.add_postreceive_url').livequery('click',function(){var parent=$(this).parent()
var row=parent.clone()
var fieldset=$(this).parents('fieldset')
row.find('input').val('')
fieldset.find('p:last').before(row)
var remove=fieldset.find('.remove_postreceive_url:first').clone()
parent.find('a').after(remove.show())
parent.find('a:first').remove()
return false})
$('.remove_postreceive_url').livequery('click',function(){$(this).parent().remove()
return false})
$('.unlock_branch').click(function(){var path=location.pathname.split('/'),target='/'+path[1]+'/'+path[2]+'/unlock_branch/'+path[4],div=$(this).parents('.notification')
$(this).spin().remove()
var self=this
$.post(target,function(){div.hide()})
return false})
$('form#rebuild_latest_rubygems').livequery('submit',function(){var path=location.pathname.split('/')
var target='/'+GitHub.currentRepoOwner+'/'+GitHub.currentRepo+'/gem/rebuild'
var spinner=$(this).find('.spin')
var status=$(this).find('.status')
spinner.show()
$.post(target,[],function(data,textStatus){spinner.hide()
if(data['error']){status.text("Request failed").removeClass('success').addClass('failure').show()}else{status.text("Queued for rebuild").removeClass('failure').addClass('success').show()}},'json')
return false})
if($('#edit_repo').length>0){$('#master_branch').change(function(){var url=window.location.href.replace(/edit$/,'update')
$.put(url,{'field':'repository_master_branch','value':$(this).val()})
$(this).parent().find('span').show()
return false})
$('.features :checkbox').change(function(){var self=this,url=window.location.pathname.replace(/edit\/?$/,'update')
var data={field:this.name,value:this.checked}
$(self).siblings('.flash').remove()
$(self).siblings('label').spin()
$.put(url,data,function(){$(self).siblings('.flash').remove()
$(self).siblings('label').stopSpin().after(' <span class="flash">Updated!</span>')})
return false})
$('#add_new_member_link').click(function(){$('#add_new_member_link').parent().hide()
$('#add_new_member').show()
$('#add_member').focus()
return false})
$('#add_member_cancel').click(function(){$('#add_new_member').hide().find('input[type=text]').val('')
$('#add_new_member_link').parent().show()
return false})
$('#add_new_member form').submit(function(){$('#add_member_cancel').spin()
$('#add_new_member :submit').attr('disabled',true)
$.post(this.action,{'member':$('#add_member').val()},function(data){if($.inArray($(data).find('a:first').text(),$('.members li a:not(.action)').map(function(){return $(this).text()}))==-1)
$('.members').append(data)
$('#add_member').val('').css('background-color','').focus()
$('#add_new_member :submit').attr('disabled',false)
$('#spinner').remove()})
return false})
$('.revoke_member').click(function(){$.post(this.href,'',function(data){console.log(data)})
$(this).parent().parent().remove()
return false})
$('.toggle_permission').click(function(){if($('.repo').is(':not(.public)')&&!confirm("Are you POSITIVE you want to make this private repository public?"))return false
$('.public_repo, .private_repo, .public_security, .private_security').toggle()
if($('.repo').is('.public'))$('.repo').removeClass('public').addClass('private')
else $('.repo').removeClass('private').addClass('public')
$.post(this.href,'')
return false})
$('#copy_permissions ul li a').click(function(){$(this).parents('form').submit()
return false})
$('#delete_repo').click(function(){var confirm_string='Are you sure you want to delete this repository?  There is no going back.'
return confirm(confirm_string)})
$('#reveal_delete_repo_info').click(function(){$(this).toggle()
$('#delete_repo_info').toggle()
return false})
$('#repo_rename > input[type=submit]').click(function(){if(!confirm(GitHub.rename_confirmation())){return false}})
$('#remove_auto_responder').livequery('click',function(){$.ajax({async:true,type:'PUT',url:window.location.pathname.replace('edit','update_pull_request_auto_response')})
$('#auto_responder_details').html('<a href="#" id="add_auto_responder">Add auto-responder</a>')
return false})
$('#add_auto_responder').livequery('click',function(){$.facebox({div:'#auto_response_editor'},'nopad')
$('#facebox .footer').hide()
return false})
$('.cancel_auto_response_action').livequery('click',function(){$.facebox.close()
return false})
$('.auto_response_form').livequery('submit',function(){var self=this,auto_response
$(self).ajaxSubmit(function(key){$.facebox.close()
auto_response=$(self).find('textarea').val().slice(0,40)
if(auto_response.length>=40)
auto_response+='...'
$('#auto_responder_details').html('<em>'+auto_response+'</em> ('+'<a href="#" id="remove_auto_responder">Remove auto-responder</a>)')})
return false;})}});GitHub.Fluid={init:function(){if(!window.fluid)return
GitHub.Fluid.setDockCount()
GitHub.Fluid.addMenuItems()},setDockCount:function(){if(window.fluid.dockBadge)
window.fluid.dockBadge=$('.inbox strong a').text()},addMenuItems:function(){with(GitHub.Fluid){addDockJump("My Account",'/account')
addDockJump("News",'/news')
addDockJump("Repositories",'/repositories')
addDockJump("Popular Watched",'/popular/watched')
addDockJump("Popular Forked",'/popular/forked')}},addDockJump:function(name,path){if(!window.fluid.addDockMenuItem)return
window.fluid.addDockMenuItem(name,function(){window.location=''+path})}}
$(GitHub.Fluid.init);$(function(){var head_sha=$('#forkqueue #head-sha').text();$('#forkqueue .untested:first').each(function(){checkNextApply()})
function checkNextApply(){var not_tested=$('#forkqueue .untested').length
var head_sha=$('#head-sha').text()
if(not_tested>0){var next=$('#forkqueue .untested:first')
var sha=next.attr('name')
$('.icons',next).html('<img src="/images/modules/ajax/indicator.gif" alt="Processing" />')
$.get("forkqueue/applies/"+head_sha+"/"+sha,function(data){next.removeClass('untested')
if(data=='NOPE'){next.addClass('unclean')
$('.icons',next).html('')}else if(data=='YUP'){next.addClass('clean')
$('.icons',next).html('')}else{$('.icons',next).html('err')}
checkNextApply()})}}
$('.action-choice').change(function(evt){var action=$(this).attr('value');if(action=='ignore'){var rows=$(this).parents('form').contents().find('input:checked')
rows.each(function(i,dom){var sha=$(dom).attr('ref');$(dom).parents('tr').children('.icons').html('ignoring...');$.post("forkqueue/ignore/"+sha,{});$(dom).parents('tr').fadeOut('normal',function(){$(this).remove()});})}else if(action=='apply'){var form=$(this).parents('form');form.submit();}
$(this).children('.default').attr('selected',1);});var fork_queue_selection_log=[]
$('#forkqueue input[type=checkbox]').click(function(evt){var m=$(this).attr('class').match(/^r-(\d+)-(\d+)$/)
var i=parseInt(m[1])
var j=parseInt(m[2])
if(evt.shiftKey&&fork_queue_selection_log.length>0){var lastRow=fork_queue_selection_log[fork_queue_selection_log.length-1]
var mLast=lastRow.match(/^r-(\d+)-(\d+)$/)
var iLast=parseInt(mLast[1])
var jLast=parseInt(mLast[2])
if(i==iLast){var selectionType=$(this).attr('checked')==true
var jSorted=[j,jLast].sort()
var jFrom=jSorted[0]
var jTo=jSorted[1]
for(var k=jFrom;k<jTo;k++){if(selectionType==true){$('#forkqueue input.r-'+i+'-'+k).attr("checked","true")}else{$('#forkqueue input.r-'+i+'-'+k).removeAttr("checked")}}}}
fork_queue_selection_log.push($(this).attr("class"))})
$('#forkqueue a.select_all').click(function(){$(this).removeClass("select_all")
var klass=$(this).attr('class')
$(this).addClass("select_all")
$('#forkqueue tr.'+klass+' input[type=checkbox]').attr('checked','true')
fork_queue_selection_log=[]
return false})
$('#forkqueue a.select_none').click(function(){$(this).removeClass("select_none")
var klass=$(this).attr('class')
$(this).addClass("select_none")
$('#forkqueue tr.'+klass+' input[type=checkbox]').removeAttr('checked')
fork_queue_selection_log=[]
return false})
$('table#queue tr.not-applied:first').each(function(){applyNextPatch()})
$('#change-branch').click(function(){$('#int-info').hide()
$('#int-change').show()
return false})
$('#change-branch-nevermind').click(function(){$('#int-change').hide()
$('#int-info').show()
return false})
function applyNextPatch(){var not_applied=$('table#queue tr.not-applied').length
var head_sha=$('#head-sha').text()
if(not_applied>0){var total_size=$('#total-commits').text()
$('#current-commit').text((total_size-not_applied)+1);var next=$('table#queue tr.not-applied:first')
var sha=next.attr('name')
$('.date',next).html('applying')
$('.icons',next).html('<img src="/images/modules/ajax/indicator.gif" alt="Processing" />')
$.post("patch/"+head_sha+"/"+sha,function(data){next.removeClass('not-applied')
if(data=='NOPE'){next.addClass('unclean_failure')
$('.date',next).html('failed')
$('.icons',next).html('<img src="/images/icons/exclamation.png" alt="Failed" />')}else{$('#head-sha').text(data)
next.addClass('clean')
$('.date',next).html('applied')
$('.apply-status',next).attr('value','1')
$('.icons',next).html('<img src="/images/modules/dashboard/news/commit.png" alt="Applied" />')}
applyNextPatch()})}else{$('#new-head-sha').attr('value',head_sha)
$('#finalize').show()}}
$('#refresh-network-data').each(function(){$.post("network_meta",function(data){$('#fq-refresh').show()
$('#fq-notice').hide()})})});$(function(){if($('.business .logos').length>0){var data=[["Shopify","shopify.png","http://shopify.com/"],["CustomInk","customink.png","http://customink.com/"],["Pivotal Labs","pivotallabs.png","http://pivotallabs.com/"],["FiveRuns","fiveruns.png","http://fiveruns.com/"],["PeepCode","peepcode.png","http://peepcode.com/"],["Frogmetrics","frogmetrics.png","http://frogmetrics.com/"],["Upstream","upstream.png","http://upstream-berlin.com/"],["Terralien","terralien.png","http://terralien.com/"],["Planet Argon","planetargon.png","http://planetargon.com/"],["Tightrope Media Systems","tightropemediasystems.png","http://trms.com/"],["Rubaidh","rubaidh.png","http://rubaidh.com/"],["Iterative Design","iterativedesigns.png","http://iterativedesigns.com/"],["GiraffeSoft","giraffesoft.png","http://giraffesoft.com/"],["Evil Martians","evilmartians.png","http://evilmartians.com/"],["Crimson Jet","crimsonjet.png","http://crimsonjet.com/"],["Alonetone","alonetone.png","http://alonetone.com/"],["EntryWay","entryway.png","http://entryway.net/"],["Fingertips","fingertips.png","http://fngtps.com/"],["Run Code Run","runcoderun.png","http://runcoderun.com/"],["Be a Magpie","beamagpie.png","http://be-a-magpie.com/"],["Rocket Rentals","rocketrentals.png","http://rocket-rentals.de/"],["Connected Flow","connectedflow.png","http://connectedflow.com/"],["Dwellicious","dwellicious.png","http://dwellicious.com/"],["Assay Depot","assaydepot.png","http://www.assaydepot.com/"],["Centro","centro.png","http://www.centro.net/"],["yreality","yreality.png","http://yreality.net/"],["Debuggable Ltd.","debuggable.png","http://debuggable.com/"],["Blogage.de","blogage.png","http://blogage.de/"],["ThoughtBot","thoughtbot.png","http://www.thoughtbot.com/"],["Viget Labs","vigetlabs.png","http://www.viget.com/"],["RateMyArea","ratemyarea.png","http://www.ratemyarea.com/"],["Abloom","abloom.png","http://abloom.at/"],["LinkingPaths","linkingpaths.png","http://www.linkingpaths.com/"],["MIKAMAI","mikamai.png","http://mikamai.com/"],["BEKK","bekk.png","http://www.bekk.no/"],["Reductive Labs","reductivelabs.png","http://www.reductivelabs.com/"],["Sexbyfood","sexbyfood.png","http://www.sexbyfood.com/"],["Factorial, LLC","yfactorial.png","http://yfactorial.com/"],["SnapMyLife","snapmylife.png","http://www.snapmylife.com/"],["Scrumy","scrumy.png","http://scrumy.com/"],["TinyMassive","tinymassive.png","http://www.tinymassive.com/"],["SOCIALTEXT","socialtext.png","http://www.socialtext.com/"],["All-Seeing Interactive","allseeinginteractive.png","http://allseeing-i.com/"],["Howcast","howcast.png","http://www.howcast.com/"],["Relevance Inc","relevance.png","http://thinkrelevance.com/"],["Nitobi Software Inc","nitobi.png","http://www.nitobi.com/"],["99designs","99designs.png","http://99designs.com/"],["EdgeCase, LLC","edgecase.png","http://edgecase.com"],["Plinky","plinky.png","http://www.plinky.com/"],["One Design Company","onedesigncompany.png","http://onedesigncompany.com/"],["CollectiveIdea","collectiveidea.png","http://collectiveidea.com/"],["Stateful Labs","statefullabs.png","http://stateful.net/"],["High Groove Studios","highgroove.png","http://highgroove.com/"],["Exceptional","exceptional.png","http://www.getexceptional.com/"],["DealBase","dealbase.png","http://www.dealbase.com/"],["Silver Needle","silverneedle.png","http://silverneedlesoft.com/"],["No Kahuna","nokahuna.png","http://nokahuna.com/"],["Double Encore","doubleencore.png","http://www.doubleencore.com/"],["Yahoo","yahoo.gif","http://yahoo.com/"],["EMI Group Limited","emi.png","http://emi.com/"],["TechCrunch","techcrunch.png","http://techcrunch.com/"],["WePlay","weplay.png","http://weplay.com/"]]
var start=function(){var list=$('.business .logos table')
$.each(data,function(i,el){list.append('<tr><td><a href="'+el[2]+'"><img src="http://assets'+(i%4)+'.github.com/images/modules/home/customers/'+el[1]+'" alt="'+el[0]+'" /></a></td></tr>')})
var ystart=parseInt($('.business .slide').css('top'))
var size=$('.business .logos td').length-4
var count=0
var slider=function(){count+=1
var ynow=parseInt($('.business .slide').css('top'))
if(Math.abs(ynow+(size*75))<25){$('.business .slide').css('top',0)
count=0}else{$('.business .slide').animate({top:"-"+(count*75)+"px"},1500)}}
setInterval(slider,3000)}
setTimeout(start,1000)}});$(function(){$('.cancel').click(function(){window.location='/inbox'
return false})
$('#inbox .del a').click(function(){var self=this
$.ajax({url:$(this).attr('rel'),data:{_method:'delete'},type:'POST',success:function(){$(self).parents('.item').hide()}})
return false})
$('#message .del a').click(function(){var self=this
$.ajax({url:window.location.href,data:{_method:'delete'},type:'POST',success:function(){window.location='/inbox'}})
return false})
$('#reveal_deleted').click(function(){$(this).parent().hide()
$('.hidden_message').show()
return false})});$(function(){if($('#impact_graph').length>0){GitHub.ImpactGraph.drawImpactGraph()}})
GitHub.ImpactGraph={colors:null,data:null,chunkVerticalSpace:2,initColors:function(authors){seedColors=[[222,0,0],[255,141,0],[255,227,0],[38,198,0],[0,224,226],[0,33,226],[218,0,226]]
this.colors=new Array()
var i=0
for(var author in authors){var color=seedColors[i%7]
if(i>6){color=[this.randColorValue(color[0]),this.randColorValue(color[1]),this.randColorValue(color[2])]}
this.colors.push(color)
i+=1}},drawImpactGraph:function(){var streams={}
var repo=$('#impact_graph').attr('rel')
var self=this
$.getJSON("/"+repo+"/graphs/impact_data",function(data){self.initColors(data.authors)
var ctx=self.createCanvas(data)
data=self.padChunks(data)
self.data=data
$.each(data.buckets,function(i,item){self.drawBucket(streams,item,i)})
self.drawAll(ctx,data,streams)
self.authorHint()})},createCanvas:function(data){var width=data.buckets.length*50*2-50
var height=0
for(var i in data.buckets){var bucket=data.buckets[i]
var bucketHeight=0
for(var j in bucket.i){var chunk=bucket.i[j]
bucketHeight+=this.normalizeImpact(chunk[1])+this.chunkVerticalSpace}
if(bucketHeight>height){height=bucketHeight}}
$('#impact_graph div').remove()
var els=$('#impact_graph')
els.height(height+50).css("border","1px solid #aaa")
$('#caption').show()
els.append('<canvas width="'+width+'" height="'+(height+30)+'"></canvas>')
var elc=$('#impact_graph canvas')[0]
return elc.getContext('2d')},padChunks:function(data){for(var author in data.authors){var first=this.findFirst(author,data)
var last=this.findLast(author,data)
for(var i=first+1;i<last;i++){if(!this.bucketHasAuthor(data.buckets[i],author)){data.buckets[i].i.push([author,0])}}}
return data},bucketHasAuthor:function(bucket,author){for(var j=0;j<bucket.i.length;j++){if(bucket.i[j][0]==parseInt(author)){return true}}
return false},findFirst:function(author,data){for(var i=0;i<data.buckets.length;i++){if(this.bucketHasAuthor(data.buckets[i],author)){return i}}},findLast:function(author,data){for(var i=data.buckets.length-1;i>=0;i--){if(this.bucketHasAuthor(data.buckets[i],author)){return i}}},colorFor:function(author){var color=this.colors[author]
return("rgb("+color[0]+","+color[1]+","+color[2]+")")},randColorValue:function(seed){var delta=Math.round(Math.random()*100)-50
var newVal=seed+delta
if(newVal>255){newVal=255}
if(newVal<0){newVal=0}
return(newVal)},drawBucket:function(streams,bucket,i){var maxY=0
var self=this
$.each(bucket.i,function(j,chunk){var authorID=chunk[0]
var impact=self.normalizeImpact(chunk[1])
if(!streams[authorID]){streams[authorID]=new Array()}
streams[authorID].push([i*100,maxY,50,impact,chunk[1]])
maxY=maxY+impact+self.chunkVerticalSpace})},normalizeImpact:function(size){if(size<=9){return size+1}else if(size<=5000){return Math.round(10+size/50)}else{return Math.round(100+(Math.log(size)*10));}},drawAll:function(ctx,data,streams){this.drawStreams(ctx,streams,null)
this.drawDates(data)},drawStreams:function(ctx,streams,topAuthor){ctx.clearRect(0,0,10000,500)
$('.activator').remove()
for(var author in streams){if(author!=topAuthor){this.drawStream(author,streams,ctx,true)}}
if(topAuthor!=null){this.drawStream(topAuthor,streams,ctx,false)}},drawStream:function(author,streams,ctx,activator){ctx.fillStyle=this.colorFor(author)
chunks=streams[author]
for(var i=0;i<chunks.length;i++){var chunk=chunks[i]
ctx.fillRect(chunk[0],chunk[1],chunk[2],chunk[3])
if(activator){this.placeActivator(author,streams,ctx,chunk[0],chunk[1],chunk[2],chunk[3],chunk[4])}
if(i!=0){ctx.beginPath()
ctx.moveTo(previousChunk[0]+50,previousChunk[1])
ctx.bezierCurveTo(previousChunk[0]+75,previousChunk[1],chunk[0]-25,chunk[1],chunk[0],chunk[1])
ctx.lineTo(chunk[0],chunk[1]+chunk[3])
ctx.bezierCurveTo(chunk[0]-25,chunk[1]+chunk[3],previousChunk[0]+75,previousChunk[1]+previousChunk[3],previousChunk[0]+50,previousChunk[1]+previousChunk[3])
ctx.fill()}
previousChunk=chunk}},drawStats:function(author,streams){chunks=streams[author]
for(var i=0;i<chunks.length;i++){var chunk=chunks[i]
var impact=chunk[4]
if(impact>10){this.drawStat(impact,chunk[0],chunk[1]+(chunk[3]/2))}}},drawStat:function(text,x,y){var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: 50px;'
styles+='text-align: center;'
styles+='color: #fff;'
styles+='font-size: 9px;'
styles+='z-index: 0;'
$('#impact_graph').append('<p class="stat" style="'+styles+'">'+text+'</p>')},drawDate:function(text,x,y){y+=3
var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: 50px;'
styles+='text-align: center;'
styles+='color: #888;'
styles+='font-size: 9px;'
$('#impact_graph').append('<p style="'+styles+'">'+text+'</p>')},placeActivator:function(author,streams,ctx,x,y,w,h,impact){y+=5
var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: '+w+'px;'
styles+='height: '+h+'px;'
styles+='z-index: 100;'
styles+='cursor: pointer;'
var id='a'+x+'-'+y
$('#impact_graph').append('<div class="activator" id="'+id+'" style="'+styles+'">&nbsp;</div>')
var self=this
$('#'+id).mouseover(function(e){$(e.target).css("background-color","black").css("opacity","0.08")
self.drawAuthor(author)}).mouseout(function(e){$(e.target).css("background-color","transparent")
self.clearAuthor()
self.authorHint()}).mousedown(function(){$('.stat').remove()
self.clearAuthor()
self.drawStreams(ctx,streams,author)
self.drawStats(author,streams)
self.drawSelectedAuthor(author)
self.authorHint()})},drawDates:function(data){var self=this
$.each(data.buckets,function(i,bucket){var max=0
$.each(bucket.i,function(j,chunk){max+=self.normalizeImpact(chunk[1])+1})
var months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
var date=new Date()
date.setTime(bucket.d*1000)
var dateString=''+date.getDate()+' '+months[date.getMonth()]+' '+date.getFullYear()
self.drawDate(dateString,i*100,max+7)})},authorText:function(text,x,y){var id=null
if(y<25){id='selected_author_text'}else{id='author_text'}
var styles=''
styles+='position: absolute;'
styles+='left: '+x+'px;'
styles+='top: '+y+'px;'
styles+='width: 920px;'
styles+='color: #444;'
styles+='font-size: 18px;'
$('#impact_legend').append('<p id="'+id+'" style="'+styles+'">'+text+'</p>')},authorHint:function(){this.authorText('<span style="color: #aaa;">mouse over the graph for more details</span>',0,30)},drawAuthor:function(author){this.clearAuthor()
var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.fillStyle=this.colorFor(author)
ctx.strokeStyle="#888888"
ctx.fillRect(0,30,20,20)
ctx.strokeRect(0.5,30.5,19,19)
var name=this.data.authors[author].n
this.authorText(name+' <span style="color: #aaa;">(click for more info)</span>',25,30)},drawSelectedAuthor:function(author){this.clearSelectedAuthor()
var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.fillStyle=this.colorFor(author)
ctx.strokeStyle="#000000"
ctx.fillRect(0,0,20,20)
ctx.strokeRect(0.5,0.5,19,19)
var auth=this.data.authors[author]
var name=auth.n
var commits=auth.c
var adds=auth.a
var dels=auth.d
this.authorText(name+' ('+commits+' commits, '+adds+' additions, '+dels+' deletions)',25,0)},clearAuthor:function(){var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.clearRect(0,30,920,20)
$('#author_text').remove()},clearSelectedAuthor:function(){var ctx=$('#impact_legend canvas')[0].getContext('2d')
ctx.clearRect(0,0,920,20)
$('#selected_author_text').remove()}};GitHub.Issues={active:null,repoURL:null,list:[],currentListHash:'list',init:function(){var issue,sorting
GitHub.Issues.repoURL=window.location.pathname.match(/^\/[^\/]+\/[^\/]+\/issues/)[0]+'/'
if(window.location.hash&&(sorting=window.location.hash.match(/sort=(\w+)/))){setTimeout(function(){$('#sort_by_'+sorting[1]).click()},100)}
if(window.location.hash&&(issue=window.location.hash.match(/issue\/(\d+)/))){var comment,parts
if(parts=window.location.hash.match(/comment\/(\d+)/)){comment=parts[1]}
if($('#issue_'+issue[1]).size()==0){var findURL=window.location.pathname.match(/^\/[^\/]+\/[^\/]+\/issues/)[0]+'/'
findURL=findURL+issue[1]+'/find'
if(comment){findURL=findURL+'?comment='+comment}
window.location=findURL
return false}
GitHub.Issues.showIssue(issue[1])
$('#issues .loading').hide()
$('#issues #issue_list').show()
if(comment){GitHub.Issues.adjustViewForComment(comment)}}else{$('#issues #issue_list .issue').show()
$('#issues .loading').hide()
$('#issues #issue_list').show()
GitHub.Issues.adjustViewForTarget()}
GitHub.Issues.Dragger.updateHandles()
GitHub.Issues.Nav.init()},adjustViewForComment:function(comment){var el=$('#comment_'+comment)
if(el.size()){el.scrollTo(10)}},toggleCreateIssueForm:function(){if($('.create_issue').hasClass('disabled')){this.hideCreateIssueForm()}else{this.showCreateIssueForm()}},showCreateIssueForm:function(){$('#new_issue').show().find('input[type=text]').val('').focus()
$('#issues .display .empty').hide()
$('#issues .display .sortbar').hide()
$('#issue_list').hide()
$('#action_list').hide()
$('.create_issue img').attr('src','/images/modules/issues/create_issue_disabled_button.png')
$('.create_issue').addClass('disabled')},hideCreateIssueForm:function(){$('#new_issue').hide()
$('#issues .display .empty').show()
$('#issues .display .sortbar').show()
$('#issue_list').show()
$('#action_list').show()
$('.create_issue img').attr('src','/images/modules/issues/create_issue_button.png')
$('.create_issue').removeClass('disabled')},ajaxifyEditIssueForm:function(form){var issue=$(form).parents('.issue:first')
form.ajaxForm({type:'PUT',dataType:'json',success:function(res){issue.find('.issue_title').html(res.title)
issue.find('.body:first').html(res.body)
GitHub.Issues.hideEditIssueForm()}})
form.addClass('ajaxified')},showEditIssueForm:function(){var issue=$('#issue_'+this.active),form=issue.find('.edit_issue')
if(form.is(':not(.ajaxified)'))
this.ajaxifyEditIssueForm(form)
issue.find('.meta').hide()
issue.find('.details').hide()
form.show()},hideEditIssueForm:function(){var issue=$('#issue_'+this.active)
issue.find('.meta').show()
issue.find('.details').show()
issue.find('.edit_issue').hide()},showEditCommentForm:function(comment){if(comment.find('form').is(':not(.ajaxified)'))
this.ajaxifyEditCommentForm(comment)
comment.find('.body, form').toggle()},ajaxifyEditCommentForm:function(comment){var form=comment.find('form'),body=comment.find('.body')
form.ajaxForm({type:'PUT',dataType:'json',success:function(res){body.html(res.body)
GitHub.Issues.hideEditCommentForm(comment)}})
form.addClass('ajaxified')},hideEditCommentForms:function(){var issue=$('#issue_'+this.active)
issue.find('.body').show()
issue.find('.edit_issue_comment_form').hide()},hideEditCommentForm:function(comment){comment.find('.body').show()
comment.find('form').hide()},validateComment:function(commentForm){commentForm=$(commentForm)
if(!commentForm.find('textarea').val().replace(/\s+$/,'').match(/.+/)){var status=commentForm.find('.status')
status.text('Comment must not be empty').show()
setTimeout(function(){status.fadeOut('normal')},3000)
return false}else{return true}},disableSortable:function(){if(!GitHub.Issues.collab)return
$('#issues').removeClass('collab')},enableSortable:function(){if(!GitHub.Issues.collab)return
$('#issues').addClass('collab')},showIssue:function(issue){GitHub.Issues.active=issue
GitHub.Issues.Nav.setHash('issue/'+issue)
$('#issues .display .sortbar').hide()
var active=null
$('#issues .display .list .issue').each(function(){var current=$(this)
if(current.attr('id')=='issue_'+issue){current.addClass("active")
current.show()
active=current}else{current.hide()}})
this.targetNone()
active.removeClass('closed').addClass('open')
active.find('.details').css('display','block')
active.find('.info .actions').show()
if(github_user!=null){if(GitHub.Issues.collab){active.find('.label .remove').show()}
if(!active.hasClass('read')){active.addClass('read')
GitHub.Issues.decrementUnreadCount()
$.post(this.repoURL+issue+'/read',{})}}
$('#issues .admin .back_link').show().parent().find('.selectors').hide()
GitHub.Issues.adjustViewForTarget()},markAsRead:function(issue){var active=issue instanceof jQuery?issue:$('#issue_'+issue),id=active.attr('id').split('_')[1]
if(!active.hasClass('read')){active.addClass('read')
$.post(this.repoURL+id+'/read',{})}
GitHub.Issues.decrementUnreadCount()},markAsUnread:function(issue){var active=issue instanceof jQuery?issue:$('#issue_'+issue),id=active.attr('id').split('_')[1]
if(active.hasClass('read')){active.removeClass('read')
$.post(this.repoURL+id+'/unread',{})}
GitHub.Issues.incrementUnreadCount()},changeUnreadCount:function(delta){var menuText=$('#unread_count').text()
var matches=menuText.match(/\((\d+)\)/)
if(matches){var newCount=parseInt(matches[1])+delta}else{var newCount=delta<0?0:1}
if(newCount==0){$('#unread_count').text('')}else{$('#unread_count').text('('+newCount+')')}},decrementUnreadCount:function(){this.changeUnreadCount(-1)},incrementUnreadCount:function(){this.changeUnreadCount(1)},changeOpenCount:function(delta){var tabText=$('#repo_menu li.active a').text()
var matches=tabText.match(/Issues \((\d+)\)/)
var newCount=parseInt(matches[1])+delta
$('#repo_menu li.active a').text('Issues ('+newCount+')')
if(newCount==0){$('#open_count').text('')}else{$('#open_count').text('('+newCount+')')}},decrementOpenCount:function(){this.changeOpenCount(-1)},incrementOpenCount:function(){this.changeOpenCount(1)},hideIssue:function(){this.hideEditCommentForms()
this.hideEditIssueForm()
this.targetIssue(this.active)
GitHub.Issues.active=null
GitHub.Issues.Nav.setHash(GitHub.Issues.listHash)
$('#issues .display .sortbar').show()
$('#issues .admin .back_link').hide().parent().find('.selectors').show()
var active=$('#issues .display .list .active')
active.find('.label .remove').hide()
active.find('.details').hide()
active.find('.info .actions').hide()
active.removeClass('open').addClass('closed').removeClass('active')
$('#issues #issue_list .issue').show()
GitHub.Issues.adjustViewForTarget()},openIssue:function(issue){if(GitHub.Issues.active){issue=GitHub.Issues.active
GitHub.Issues.hideIssue()}
var issueDiv=$('#issue_'+issue)
if(GitHub.Issues.target[0].id==issueDiv[0].id)
GitHub.Issues.targetNext()
issueDiv.remove()
GitHub.Issues.incrementOpenCount()
$.post(GitHub.Issues.repoURL+issue+'/open',{})},closeIssue:function(issue){if(GitHub.Issues.active){issue=GitHub.Issues.active
GitHub.Issues.hideIssue()}
var issueDiv=$('#issue_'+issue)
if(GitHub.Issues.target[0].id==issueDiv[0].id)
GitHub.Issues.targetNext()
issueDiv.remove()
GitHub.Issues.decrementOpenCount()
$.post(GitHub.Issues.repoURL+issue+'/close',{})},moveIssueToTop:function(issueID){var issue=$('#issue_'+issueID),dragger={target:issue}
GitHub.Issues.Dragger.startDrag(dragger)
issue.remove()
$('#issue_list').prepend(issue)
issue.find('.meta').click(GitHub.Issues.issueRowClickHandler)
issue.find('.top.handle').click(GitHub.Issues.issueRowClickHandler)
GitHub.Issues.Dragger.stopDrag(dragger)},issueRowClickHandler:function(e){var target=$(e.target),issue=target.is('.issue')?target:target.parents('.issue')
issue=issue.attr('id').split('_')[1]
if(target.is('.top')||target.parents('.top').length>0){GitHub.Issues.moveIssueToTop(issue)
return false}
if(target.is(':input')||target.is('a:not(.issue_title)'))
return true
GitHub.Issues.showIssue(issue)
return false},createIssue:function(){$('.create_issue:first').click()},createLabel:function(){$('.create_label').click()},backToInbox:function(){if(!GitHub.Issues.active)return
var inboxURL=$('#open_issues_link').attr('href')
if(window.location.pathname==inboxURL){$('.back_link').click()
if(/sort=/.test(window.location.hash))$('#sort_by_priority').click()}else{window.location=inboxURL}},backToIssues:function(){if(!GitHub.Issues.active)return
$('.back_link').click()},markSelectedAsRead:function(){$('.selected').each(function(){GitHub.Issues.markAsRead($(this))})},markSelectedAsUnread:function(){$('.selected').each(function(){GitHub.Issues.markAsUnread($(this))})},closeSelected:function(){$('#issues #action_list').get(0).selectedIndex=1
$('#issues #action_list').change()},removeLabelFromSelected:function(){console.log('not implemented')},removeSelectedFromView:function(){if(/\/labels\//.test(location.pathname)){GitHub.Issues.removeLabelFromSelected()}else{GitHub.Issues.closeSelected()}},targetNext:function(){var issue=GitHub.Issues.target;(issue.next().length>0?issue.next():issue.prev()).addClass('target')},targetIssue:function(issue){this.targetNone()
$('#issue_'+issue).addClass('target')},targetNone:function(){GitHub.Issues.target.removeClass('target')},targetFirst:function(){this.targetNone()
$('.issue:first').addClass('target')},moveTargetDown:function(){if(GitHub.Issues.active){var nextIssue=$('#issue_'+GitHub.Issues.active).next()
if(nextIssue.size()){nextIssue.addClass('target')
GitHub.Issues.showTarget()}else{GitHub.Issues.backToIssues()}}else{$('#issue_list li').not(':last').filter('.target').removeClass('target').next().addClass('target')
GitHub.Issues.adjustViewForTarget()}},moveTargetUp:function(){if(GitHub.Issues.active){var prevIssue=$('#issue_'+GitHub.Issues.active).prev()
if(prevIssue.size()){prevIssue.addClass('target')
GitHub.Issues.showTarget()}else{GitHub.Issues.backToIssues()}}else{$('#issue_list li').not(':first').filter('.target').removeClass('target').prev().addClass('target')
GitHub.Issues.adjustViewForTarget()}},adjustViewForTarget:function(){var el=GitHub.Issues.target
if(!el.offset())return
if(el.offset().top-$(window).scrollTop()+20>$(window).height()){el.scrollTo(10)}else if(el.offset().top-$(window).scrollTop()<0){$('html,body').animate({scrollTop:el.offset().top-$(window).height()},10);}},showTarget:function(){GitHub.Issues.showIssue(GitHub.Issues.target.attr('id').split('_')[1])},toggleSelectTarget:function(){var box=GitHub.Issues.target.find(':checkbox')
box.attr('checked')?box.attr('checked',false):box.attr('checked',true)
box.change()},get target(){return $('.target')},focusIssuesSearch:function(){$('#issues .searchbar').focus()},showHotkeyHelp:function(){if(GitHub.Issues.keyboardShortcuts)return $.facebox(GitHub.Issues.keyboardShortcuts)
$.facebox(function(){$.get('/javascripts/github.issues.js',function(data){var lines=[],description='',keys=data.replace(/[\s\S]*hotkeys\({([\s\S]+?)}\)[\s\S]*/mg,'$1')
$.each(keys.split("\n"),function(i,line){line=line.replace(/[\':,]/g,'')
line=line.replace('GitHub.Issues.','')
line=$.trim(line)
if(!line)return
line=line.split(' ')
description=line[1].replace(/([A-Z])/g,' $1').toLowerCase()
description=description.slice(0,1).toUpperCase()+description.slice(1,description.length)
lines.push('  '+line[0]+' '+description)})
GitHub.Issues.keyboardShortcuts='<h2>Keyboard Shortcuts</h2><pre>'+lines.join("\n")+'</pre>'
$.facebox(GitHub.Issues.keyboardShortcuts)})})},addLabels:function(issues,label_id,human){var color,updated=[]
for(var i=0;i<issues.length;i++){var issue=issues[i]
var div_id='issue_'+issue+'_label_'+label_id
if($('#'+div_id).size()==0){var html=''
html+='<div id="'+div_id+'" class="label label'+label_id+'">'
html+='  <div class="labeli">'
html+='    <div class="name">'
html+='      <span>'+human+'</span>'
html+='      <div class="remove" style="display: none;">x</div>'
html+='    </div>'
html+='  </div>'
html+='</div>'
var label=$(html)
$('#issue_'+issue+' .issue_title').before(label)
if(color=labels['label'+label_id]){GitHub.Issues.Labels.setLabelColors(label,color)}
if(GitHub.Issues.active!=null){$('#issue_'+issue+' .label .remove').show()}
updated.push(issue)}}
if(updated.length>0){$.post($('#new_label').attr('action')+'/'+label_id+'/append',{issues:updated.join(',')})}},selected:function(){var issues=[]
if(GitHub.Issues.active!=null){issues=[''+GitHub.Issues.active]}else{issues=$('#issues .list').find('input:checked').serializeArray().map(function(issue){return issue.value})}
return issues},set listHash(newListHash){GitHub.Issues.currentListHash=newListHash
GitHub.Issues.Nav.setHash(newListHash)},get listHash(){return GitHub.Issues.currentListHash},find:function(issueID){issueID=parseInt(issueID)
var issue=$.grep(GitHub.Issues.list,function(issue){return issue.id==issueID})
return issue[0]}}
GitHub.Issues.Issue=function(id,priority,votes,updated){this.id=id
this.priority=priority
this.updated=updated
this._votes=votes
GitHub.Issues.list.push(this)}
GitHub.Issues.Issue.prototype={get element(){return $('#issue_'+this.id)},get votes(){return this._votes},set votes(vote){vote=parseInt(vote)
var text=vote+' vote',up=vote>this._votes,url=up?'/vote':'/unvote'
this._votes=vote
this.element.find('.vote .show').text(text+(vote==1?'':'s'))
var voteLink=this.element.find('.voting_box .act a')
if(up){voteLink.removeClass('enabled').find('img').attr('src','/images/modules/issues/upvote_disabled.png')}else{voteLink.addClass('enabled').find('img').attr('src','/images/modules/issues/upvote.png')}
$.post(GitHub.Issues.repoURL+this.id+url,{})
return vote}}
GitHub.Issues.Dragger={dragging:0,startingPosition:-1,sortDrag:function(e,ui){if(this.dragging<5){$(e.target).parents('.issue').addClass('floating')
this.dragging+=1}},startDrag:function(e){if(!/labels/.test(location.pathname))return
var target=$(e.target),actor=(target.is('li')?target:target.parents('li')),issues=$.makeArray($('#issue_list li'))
this.startingPosition=$.inArray(actor[0],issues)},stopDrag:function(e){var id,sorting=[]
$('#issues .display .list .issue').removeClass('floating')
if(this.startingPosition>-1){var url=GitHub.Issues.repoURL+'sort_label',params={actor:null,neighbor:null,direction:null},target=$(e.target),actor=(target.is('li')?target:target.parents('li')),issues=$.map($('#issue_list li'),function(e){return e.id})
var endingPosition=$.inArray(actor[0].id,issues)
params.direction=endingPosition>this.startingPosition?'down':'up'
params.neighbor=params.direction=='up'?issues[endingPosition+1]:issues[endingPosition-1]
params.neighbor=params.neighbor.split('_')[1]
params.actor=actor[0].id.split('_')[1]}else{var url=GitHub.Issues.repoURL+'sort',params={sorting:null}
$('#issue_list>li').each(function(i){id=this.id.split('_')[1]
GitHub.Issues.find(id).priority=i
sorting.push(id)})
params.sorting=sorting.join(',')}
GitHub.Issues.Dragger.updateHandles()
$.post(url,params)
this.dragging=0},updateHandles:function(){$('#issue_list .handles .top.handle').show()
$('#issue_list .handles .top.handle:first').hide()}}
GitHub.Issues.Labels={init:function(){},sortedLabelInsert:function(name,id){if(id==undefined){id=''}else{id='label'+id}
var url=GitHub.Issues.repoURL+'labels/'+name
var html=''
html+='<li>'
html+='  <div rel="'+id+'" class="label dropdown '+id+'">'
html+='    <div class="labeli">'
html+='      <div class="name">'
html+='        <span>&#9662;</span>'
html+='      </div>'
html+='    </div>'
html+='  </div>'
html+='  <a href="'+url+'">'+name+'</a>'
html+='</li>'
var label=$(html)
var done=false
var list=$('.labels .list li')
list.each(function(i,el){var cname=$(el).find('a').text()
if(!done&&name<cname){$(el).before(label)
done=true}})
if(!done){$('.labels .list').append(label)}},setLabelColors:function(label,hex){var rgb=GitHub.Color.hex2rgb(hex)
var hsb=GitHub.Color.rgb2hsb(rgb)
var borderColor=null
if(hsb.b<50){borderColor={h:hsb.h,s:hsb.s,b:(hsb.b*1.4)}}else{borderColor={h:hsb.h,s:hsb.s,b:(hsb.b*.8)}}
var hoverColor=null
if(hsb.b<50){hoverColor={h:hsb.h,s:hsb.s,b:(hsb.b*1.8)}}else{hoverColor={h:hsb.h,s:hsb.s,b:(hsb.b*.4)}}
label.css('backgroundColor',GitHub.Color.rgb2hex(rgb));var textColor='white'
if((hsb.b>60&&hsb.s<40)||(hsb.b>70&&hsb.h>30&&hsb.h<200)){textColor='black'}
label.css('borderColor',GitHub.Color.hsb2hex(borderColor))
label.find('.labeli').css('borderColor',GitHub.Color.hsb2hex(borderColor))
label.find('.labeli .remove').css('borderLeftColor',textColor)
label.find('.labeli .remove').hover(function(){$(this).css('backgroundColor',GitHub.Color.hsb2hex(hoverColor))},function(){$(this).css('backgroundColor',GitHub.Color.rgb2hex(rgb))})
label.find('span').css('color',textColor)
label.find('.labeli .remove').css('color',textColor)}}
GitHub.Issues.Labels.Editor={chooser:function(){return $('.labels .list li .chooser')},isOpen:function(){return(this.chooser().length>0)},close:function(){this.chooser().remove()},currentId:function(){var idname=this.chooser().parent().find('.label.dropdown').attr('rel')
return idname.match(/^label(\d+)$/)[1]},currentName:function(){return this.chooser().parent().find('> a').text()},apply:function(){var issues=GitHub.Issues.selected()
var labelId=this.currentId()
var name=this.currentName()
GitHub.Issues.addLabels(issues,labelId,name)
this.close()},saveColor:function(){var id=this.currentId()
var color=this.chooser().find('.colorpicker_hex input').val()
var oldcolor=labels['label'+id]||'#ededed'
oldcolor=oldcolor.replace(/#/g,'')
if(color!=oldcolor){labels['label'+id]=color
GitHub.Issues.Labels.setLabelColors($('div[rel=label'+id+']'),color)
GitHub.Issues.Labels.setLabelColors($('div.label'+id),color)
var url=$('#new_label').attr('action')+'/'+id+'/set_color'
if(GitHub.Issues.active){var issue='<input type="hidden" name="issue" value="'+GitHub.Issues.active+'" />'}else{var issue=''}
var form=$('<form method="post" action="'+url+'" style="display:none">'+issue+'<input type="hidden" name="color" value="'+color+'" /></form>')
$('#new_label').before(form)
form.ajaxSubmit(function(){form.remove()})}},rename:function(){var chooser=this.chooser()
var id=this.currentId()
var url=$('#new_label').attr('action')+'/'+id+'/rename'
var name=chooser.find('.rename_label input[type=text]').val()
$.post(url,"name="+name)
chooser.parents('li').remove()
GitHub.Issues.Labels.sortedLabelInsert(name,id)
$('.display .label'+id+' span').text(name)
$('#issues #action_list option[value='+id+']').html('&nbsp;&nbsp;'+name)
this.close()},remove:function(){if(!confirm("Are you sure?"))return
var id=this.currentId()
var url=$('#new_label').attr('action')+'/'+id
$.post(url,"_method=delete")
this.chooser().parents('li').remove()
$('.display .label'+id).remove()
$('#issues #action_list option[value='+id+']').remove()
this.close()}}
GitHub.Color={hex2rgb:function(hex){hex=hex.toLowerCase().replace(/#/,'')
var rgb={}
if(hex.length==6){rgb.r=parseInt(hex.substr(0,2),16)
rgb.g=parseInt(hex.substr(2,2),16)
rgb.b=parseInt(hex.substr(4,2),16)}else if(hex.length==3){rgb.r=parseInt((hex.substr(0,1)+hex.substr(0,1)),16)
rgb.g=parseInt((hex.substr(1,1)+hex.substr(1,1)),16)
rgb.b=parseInt((hex.substr(2,2)+hex.substr(2,2)),16)}
return rgb},rgb2hsb:function(rgb){var vHue,vSaturation,vBrightness
rgb.r=parseFloat(rgb.r)
rgb.g=parseFloat(rgb.g)
rgb.b=parseFloat(rgb.b)
var cmax=(rgb.r>rgb.g)?rgb.r:rgb.g
if(rgb.b>cmax){cmax=rgb.b}
var cmin=(rgb.r<rgb.g)?rgb.r:rgb.g
if(rgb.b<cmin){cmin=rgb.b}
vBrightness=cmax/255.0
if(cmax!=0){vSaturation=(cmax-cmin)/cmax}else{vSaturation=0}
if(vSaturation==0){vHue=0}
else
{var redc=(cmax-rgb.r)/(cmax-cmin)
var greenc=(cmax-rgb.g)/(cmax-cmin)
var bluec=(cmax-rgb.b)/(cmax-cmin)
if(rgb.r==cmax){vHue=bluec-greenc}else if(rgb.g==cmax){vHue=2.0+redc-bluec}else{vHue=4.0+greenc-redc}
vHue=vHue/6.0;if(vHue<0)vHue=vHue+1.0}
return{h:Math.round(vHue*360),s:Math.round(vSaturation*100),b:Math.round(vBrightness*100)}},rgb2hex:function(rgb){return'rgb('+rgb.r+','+rgb.g+','+rgb.b+')'},hsb2hex:function(hsb){return this.rgb2hex(this.hsb2rgb(hsb))},hsb2rgb:function(hsb){var rgb={}
var h=Math.round(hsb.h)
var s=Math.round(hsb.s*255/100)
var v=Math.round(hsb.b*255/100)
if(s==0){rgb.r=rgb.g=rgb.b=v}else{var t1=v
var t2=(255-s)*v/255
var t3=(t1-t2)*(h%60)/60
if(h==360)h=0
if(h<60){rgb.r=t1;rgb.b=t2;rgb.g=t2+t3}
else if(h<120){rgb.g=t1;rgb.b=t2;rgb.r=t1-t3}
else if(h<180){rgb.g=t1;rgb.r=t2;rgb.b=t2+t3}
else if(h<240){rgb.b=t1;rgb.r=t2;rgb.g=t1-t3}
else if(h<300){rgb.b=t1;rgb.g=t2;rgb.r=t2+t3}
else if(h<360){rgb.r=t1;rgb.g=t2;rgb.b=t1-t3}
else{rgb.r=0;rgb.g=0;rgb.b=0}}
return{r:Math.round(rgb.r),g:Math.round(rgb.g),b:Math.round(rgb.b)}}}
GitHub.Issues.Nav={currentHash:null,ignoreHashChange:false,interval:null,init:function(){this.currentHash=window.location.hash
this.interval=setInterval(this.checkHash,50)},setHash:function(hash){this.ignoreHashChange=true
window.location.hash=hash},checkHash:function(){var nav=GitHub.Issues.Nav
if(window.location.hash!=nav.currentHash){if(nav.ignoreHashChange){nav.ignoreHashChange=false
nav.currentHash=window.location.hash}else{window.location.reload()
clearInterval(nav.interval)}}}}
$(function(){if($('#issues').length==0)return
GitHub.Issues.init()
$.hotkeys({'c':GitHub.Issues.createIssue,'l':GitHub.Issues.createLabel,'i':GitHub.Issues.backToInbox,'u':GitHub.Issues.backToIssues,'I':GitHub.Issues.markSelectedAsRead,'U':GitHub.Issues.markSelectedAsUnread,'e':GitHub.Issues.closeSelected,'y':GitHub.Issues.removeSelectedFromView,'j':GitHub.Issues.moveTargetDown,'k':GitHub.Issues.moveTargetUp,'o':GitHub.Issues.showTarget,'x':GitHub.Issues.toggleSelectTarget,'?':GitHub.Issues.showHotkeyHelp,'/':GitHub.Issues.focusIssuesSearch,'enter':GitHub.Issues.showTarget})
$('#issues a.internal').click(function(){var issue=$(this).attr("href").match(/issue\/(\d+)/)
GitHub.Issues.showIssue(issue[1])
GitHub.Issues.targetIssue(issue[1])
return false})
$('.issue.closed .meta').livequery('click',function(e){return GitHub.Issues.issueRowClickHandler(e)})
$('.issue.closed .top.handle').livequery('click',function(e){return GitHub.Issues.issueRowClickHandler(e)})
$('.create_issue').click(function(){GitHub.Issues.toggleCreateIssueForm()
return false})
$('.cancel_issue').click(function(){GitHub.Issues.hideCreateIssueForm()
return false})
$('.issue .edit').click(function(){GitHub.Issues.showEditIssueForm()
return false})
$('.issue .edit_issue .cancels').click(function(){GitHub.Issues.hideEditIssueForm()
return false})
$('.new_issue_comment').submit(function(){if(GitHub.Issues.validateComment(this)){$(this).find(':button, :submit').attr('disabled',true)
$(this).find(':button').spin()
return true}else{return false}})
$('.comment .edit_issue_comment').click(function(){GitHub.Issues.showEditCommentForm($(this).parents('.comment:first'))
return false})
$('.comment .edit_issue_comment_form .cancels').click(function(){GitHub.Issues.hideEditCommentForm($(this).parents('.comment:first'))
return false})
$('.delete_issue_comment').click(function(){var comment=$(this).parents('.comment:first')
$.del(this.href,function(){comment.remove()})
return false})
$('.save_comment_and_close_issue').click(function(){var form=$(this).parents('form')
if(GitHub.Issues.validateComment(form)){$(this).spin()
form.find(':button, :submit').attr('disabled',true)
form.ajaxSubmit(function(){GitHub.Issues.closeIssue()})
return false}})
$('#issues .back_link').click(function(){GitHub.Issues.hideIssue()
return false})
$('#issues #action_list').change(function(){var label_id=$(this).val()
if(label_id=='gh-actions'||label_id=='gh-labels'){$(this).val('gh-actions')
return $(this).blur()}else if(label_id=='new_label'){$(this).val('gh-actions')
$('.create_label').trigger('click')
return $(this).blur()}
var issues=GitHub.Issues.selected()
if(issues.length==0){alert("Please select an issue first")
$(this).val('gh-actions')
return $(this).blur()}
var human=$(this).parent().find('option:selected').text()
human=human.slice(2,human.length)
var labelSelected=false
$.each(issues,function(i,issue){var div_id='issue_'+issue+'_label_'+label_id
if(human=='Open'){GitHub.Issues.openIssue(issue)}else if(human=='Close'){GitHub.Issues.closeIssue(issue)}else if(human=='Mark as Read'){GitHub.Issues.markAsRead(issue)}else if(human=='Mark as Unread'){GitHub.Issues.markAsUnread(issue)}else{labelSelected=true}})
if(labelSelected){GitHub.Issues.addLabels(issues,label_id,human)}
$(this).val('gh-actions')
return $(this).blur()})
$('.voting_box .act a').click(function(){var issue_id=$(this).parents('.issue').attr('id').match(/\d+$/)[0],issue=GitHub.Issues.find(issue_id),upVote=$(this).hasClass('enabled')
upVote?(issue.votes+=1):(issue.votes-=1)
return false})
$('.comment_toggle').click(function(){var issue=$(this).parents('.issue').attr('id').replace('issue_','')
GitHub.Issues.showIssue(issue)
$('.comments:visible').scrollTo(500)
return false})
$('#issues .remove').livequery('click',function(){var issue_id=$(this).parents('li').attr('id').replace('issue_','')
var label=$(this).parents('div.label')
var label_id=label.attr('id').match(/label_(\d+)/)[1]
label.remove()
$.post($('#new_label').attr('action')+'/'+label_id+'/unappend',{'issues':issue_id})})
$('#sort_by_priority').click(function(){GitHub.Issues.listHash='list'
GitHub.Issues.enableSortable()
return sortIssuesBy('priority',function(a,b){return a.priority<b.priority?1:-1})})
$('#sort_by_votes').click(function(){GitHub.Issues.listHash='sort=votes'
GitHub.Issues.disableSortable()
return sortIssuesBy('votes')})
$('#sort_by_updated').click(function(){GitHub.Issues.listHash='sort=updated'
GitHub.Issues.disableSortable()
return sortIssuesBy('updated')})
function sortIssuesBy(property,sorter){$('.loading').show()
var list=$('#issue_list')
sorter=sorter||function(a,b){return a[property]>b[property]?1:-1}
var issues=GitHub.Issues.list.sort(sorter)
$.each(issues,function(){list.prepend(this.element)})
$('#sort_by_'+property).parents('span').find('a').show().end().find('strong').hide()
$('#sort_by_'+property).hide().next('strong').show()
GitHub.Issues.targetFirst()
$('.loading').hide()
return false}
$('body').click(function(){if(GitHub.Issues.Labels.Editor.isOpen()){GitHub.Issues.Labels.Editor.close()}})
$('.create_label').click(function(){$('#new_label .error').hide()
$('#new_label').toggle().find('input[type=text]').focus()
return false})
$('.cancel_label').click(function(){$('#new_label').toggle()
$('#new_label .error').hide()
$('#new_label input[type=text]').val('').blur()
return false})
$('#new_label').submit(function(){var input=$(this).find('input[type=text]')
var name=input.val()
if(!name.match(/\S/)){var error=$('#new_label .error')
error.text("Label can't be blank")
error.show()
return false}
input.val('')
GitHub.Issues.Labels.sortedLabelInsert(name)
$.post($(this).attr('action'),{'label':name},function(label_id){var option=$('<option value="'+label_id+'">&nbsp;&nbsp;'+name+'</option>')
$('#issues #action_list').append(option)
$('.labels .list li .label.dropdown[rel=]').attr('rel','label'+label_id)})
$('#new_label').toggle()
$('#new_label .error').hide()
input.blur()
return false})
$('.labels .list .label.dropdown').livequery('click',function(e){if(GitHub.Issues.collab&&$(this).parent().find('.chooser').length==0){e.stopPropagation()
var chooser=$('.labels .chooser').clone()
chooser.click(function(e){e.stopPropagation()})
var labelName=$(this).attr('rel')
var labelColor=labels[labelName]
if(labelColor==null){labelColor='#ededed'}
chooser.find('.label').addClass(labelName)
chooser.find('.picker').ColorPicker({flat:true,color:labelColor,onChange:function(hsb,hex,rgb){GitHub.Issues.Labels.setLabelColors(chooser.find('.label'),hex)}})
chooser.prependTo($(this).parent()).show()}})
$('#issues .labels .chooser .apply.action').livequery('click',function(){GitHub.Issues.Labels.Editor.apply()
return false})
$('#issues .labels .color').livequery('click',function(){$('#issues .labels .list .change_color').show()
return false})
$('#issues .labels .change_color .cancel_color_change').livequery('click',function(){$('#issues .labels .list .change_color').hide()
return false})
$('#issues .labels .change_color form').livequery('submit',function(){GitHub.Issues.Labels.Editor.saveColor()
GitHub.Issues.Labels.Editor.close()
return false})
$('#issues .labels .rename').livequery('click',function(){$('#issues .labels .list .rename_label').show().find('input[type=text]').focus()
return false})
$('#issues .labels .list .rename_label .cancel_label_rename').livequery('click',function(){$('#issues .labels .list .rename_label').hide().find('input[type=text]').val('')
return false})
$('#issues .labels .list .rename_label').livequery('submit',function(){GitHub.Issues.Labels.Editor.rename()
return false})
$('#issues .labels .delete').livequery('click',function(){GitHub.Issues.Labels.Editor.remove()
return false})
$('#issues .select_all').click(function(){$(this).parents('.display').find('.list input[type=checkbox]').attr('checked','checked').change()
return false})
$('#issues .select_none').click(function(){$(this).parents('.display').find('.list input[type=checkbox]').removeAttr('checked').change()
return false})
$('#issues .list input[type=checkbox]').change(function(){if($(this).attr('checked'))
$(this).parents('.issue').addClass('selected')
else
$(this).parents('.issue').removeClass('selected')})
var issues_selection_log=[]
var renumberCheckboxes=function(){$('#issues .display .list input[type=checkbox]').each(function(i,el){$(el).attr('rel','r-1-'+i)})}
renumberCheckboxes()
$('#issues .display .list input[type=checkbox]').click(function(evt){var m=$(this).attr('rel').match(/^r-(\d+)-(\d+)$/)
var i=parseInt(m[1])
var j=parseInt(m[2])
if(evt.shiftKey&&issues_selection_log.length>0){var lastRow=issues_selection_log[issues_selection_log.length-1]
var mLast=lastRow.match(/^r-(\d+)-(\d+)$/)
var iLast=parseInt(mLast[1])
var jLast=parseInt(mLast[2])
if(i==iLast){var selectionType=$(this).attr('checked')==true
var jSorted=[j,jLast].sort()
var jFrom=jSorted[0]
var jTo=jSorted[1]
for(var k=jFrom;k<jTo;k++){var checkbox=$('#issues .display .list input[rel=r-'+i+'-'+k+']')
if(selectionType==true){checkbox.attr("checked","true")
checkbox.parents('li').addClass("selected")}else{checkbox.removeAttr("checked")
checkbox.parents('li').removeClass("selected")}}}}
issues_selection_log.push($(this).attr("rel"))})
$('#issues .display .list a.select_all').click(function(){$(this).removeClass("select_all")
var klass=$(this).attr('class')
$(this).addClass("select_all")
$('#issues .display .list tr.'+klass+' input[type=checkbox]').attr('checked','true')
issues_selection_log=[]
return false})
$('#issues .display .list a.select_none').click(function(){$(this).removeClass("select_none")
var klass=$(this).attr('class')
$(this).addClass("select_none")
$('#issues .display .list tr.'+klass+' input[type=checkbox]').removeAttr('checked')
issues_selection_log=[]
return false})
if(GitHub.Issues.collab){$('#issues .display .list').sortable({axis:'y',containment:'#issues',handle:'.drag.handle',cancel:'.open, .voting_box',update:renumberCheckboxes,sort:GitHub.Issues.Dragger.sortDrag,start:GitHub.Issues.Dragger.startDrag,stop:GitHub.Issues.Dragger.stopDrag})}
$('#issues .list input[type=checkbox]').change()})
$(function(){$('#add_key_action').click(function(){$(this).toggle()
$('#new_key').toggle().find(':text').focus()
return false})
$('.edit_key_action').livequery('click',function(){$.gitbox($(this).attr('href'))
return false})
$('#cancel_add_key').click(function(){$('#add_key_action').toggle()
$('#new_key').toggle().find('textarea').val('')
$('#new_key').find(':text').val('')
$('#new_key .object_error').remove()
return false})
$('.cancel_edit_key').livequery('click',function(){$.facebox.close()
$('#new_key .object_error').remove()
return false})
$('.delete_key').livequery('click',function(){if(confirm('Are you sure you want to delete this key?')){$.ajax({type:'POST',data:{_method:'delete'},url:$(this).attr('href')})
var list=$(this).parents('ul')
$(this).parent().remove()
if(list.find('li').length==0){$('#keys .body .danger').show()}}
return false})
$('.key_editing').livequery('submit',function(){var self=this
$(self).find('.object_error').remove()
$(self).find(':submit').attr('disabled',true).spin()
$(self).ajaxSubmit(function(key){if(key.substring(0,3)=="<li"){if($(self).attr('id').substring(0,4)=='edit'){$('#'+$(self).attr('id').substring(5)).replaceWith(key)
$.facebox.close()}else{$('#keys .body .danger').hide()
$('#keys ul').append(key)
$('#add_key_action').toggle()
$(self).toggle()}
$(self).find('textarea').val('')
$(self).find(':text').val('')}else{$(self).append(key)}
$(self).find(':submit').attr('disabled',false).stopSpin()})
return false})});$(function(){if($('#network .out_of_date').length==0)return
var repo=$('#network .out_of_date').attr('rel')
$.smartPoller(function(retry){$.getJSON("/cache/network_current/"+repo,function(data){data.current?up_to_date():retry()})})
function up_to_date(){$('#network .out_of_date').addClass("up_to_date").text("This graph has new data available. Reload to see it.")}});$(function(){$(".graph .bars").each(function(i){var graph=this
var callback=function(data){new ParticipationGraph(graph,data)}
var datasource=$(this).attr("rel")
$.get(datasource,null,callback,"text")})});ParticipationGraph=function(el,data){this.BAR_WIDTH=7
this.allCommits=null
this.ownerCommits=null
this.primer=new Primer(el,416,20)
this.data=data
this.readData()
this.draw()}
ParticipationGraph.prototype={readData:function(){var data_strings=this.data.split("\n")
this.allCommits=this.base64BytesToIntArray(data_strings[0])
this.ownerCommits=this.base64BytesToIntArray(data_strings[1])},max:function(arr){var max=arr[0]
for(var i=1;i<arr.length;i++){if(arr[i]>max){max=arr[i]}}
return max},integerize:function(arr){var out=new Array()
for(var i=0;i<arr.length;i++){out.push(parseInt(arr[i]))}
return out},base64ByteToInt:function(b){var chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-"
return chars.indexOf(b)},base64BytesToIntArray:function(data){var arr=[]
var num
for(var i=0;i<data.length;i++){if(i%2==0){num=64*this.base64ByteToInt(data.charAt(i))}else{num=num+this.base64ByteToInt(data.charAt(i))
arr.push(num)}}
return arr},draw:function(){var max=this.max(this.allCommits)
var scale
if(max>=20){scale=19.0/max}else{scale=1}
var allCommitsLayer=new Primer.Layer()
for(var i=0;i<this.allCommits.length;i++){var square=new Primer.Layer()
square.fillStyle="#CACACA"
var d=this.allCommits[i]*scale
square.fillRect(i*(this.BAR_WIDTH+1),20-d,this.BAR_WIDTH,d)
allCommitsLayer.addChild(square)}
var ownerCommitsLayer=new Primer.Layer()
for(var i=0;i<this.ownerCommits.length;i++){var square=new Primer.Layer()
square.fillStyle="#336699"
var d=this.ownerCommits[i]*scale
square.fillRect(i*(this.BAR_WIDTH+1),20-d,this.BAR_WIDTH,d)
ownerCommitsLayer.addChild(square)}
this.primer.addChild(allCommitsLayer)
this.primer.addChild(ownerCommitsLayer)}};(function($){$.fn.repoList=function(options){var opts=$.extend({},$.fn.repoList.defaults,options);return this.each(function(){var container=$(this)
var repoList=container.find('.repo_list')
var showMore=container.find('.show-more')
var filterInput=container.find('.filter_input').val('')
var lastInputValue=filterInput.val();var showingAll=showMore.length==0?true:false
var currentFilterValue=null
var ajaxing=false
if(typeof(filterInput[0].onsearch)=='object')filterInput.addClass('native')
showMore.click(function(){if(ajaxing)return false
var link=showMore.spin()
ajaxing=true
$(opts.selector).load(opts.ajaxUrl,function(){showingAll=true
link.parents('.repos').find('.filter_selected').click()
link.stopSpin()})
link.hide()
return false});var filterRepos=function(){var repos=repoList.find('li')
if(currentFilterValue){repos.hide()
repoList.find('li.'+currentFilterValue).show()}else{repos.show()}
if(filterInput.val()!=''){repos.each(function(){var owner=$(this).find('.owner').text()
var name=$(this).find('.repo').text()
if(owner.toLowerCase().indexOf(filterInput.val().toLowerCase())==-1&&name.toLowerCase().indexOf(filterInput.val().toLowerCase())==-1){$(this).hide()}})}}
container.find('.repo_filter').click(function(){var link=$(this)
container.find('.repo_filterer a').removeClass('filter_selected')
link.addClass('filter_selected')
currentFilterValue=link.attr('rel')
showingAll?filterRepos():showMore.click()
return false;});var checkPlaceholder=function(){filterInput.val()==''?filterInput.addClass('placeholder'):filterInput.removeClass('placeholder')}
filterInput.bind('keyup blur click',function(){if(this.value==lastInputValue)return
lastInputValue=this.value
showingAll?filterRepos():showMore.click()
checkPlaceholder()});checkPlaceholder()})}
$.fn.repoList.defaults={selector:'#repo_listing',ajaxUrl:'/dashboard/ajax_your_repos'}})(jQuery);$(function(){$('#signup_form').submit(function(){$('#signup_button').attr('disabled',true).val('Creating your GitHub account...')})});GitHub.CachedCommitDataPoller=function(){$.smartPoller(2000,function(retry){var sha,commit,msg,user,commitURL='/'+GitHub.nameWithOwner+'/commit/',url='/'
+GitHub.nameWithOwner
+'/cache/commits/'
+GitHub.currentTreeSHA
+'?path='
+GitHub.currentPath
+'&commit_sha='
+GitHub.commitSHA
$.getJSON(url,function(data,status){if(data.nothing)return retry()
$('#browser tr').each(function(){if((sha=$(this).find('.content a').attr('id'))&&data[sha]){$(this).find('.age').html('<span class="drelatize">'+data[sha].date+'</span>')
msg=$(this).find('.message')
msg.html(data[sha].message)
if(msg.html().length>50)
msg.html(msg.html().slice(0,47)+'...')
msg.html('<a href="'+commitURL+sha+'" class="message">'+msg.html()+'</a>')
user=data[sha].login?'<a href="/'+data[sha].login+'">'+data[sha].login+'</a>':data[sha].author
msg.html(msg.html()+' ['+user+']')}})
if($.fn.relatizeDate)$('.drelatize').relatizeDate()})})}
$(function(){$('#file-edit-link').click(function(){$('#readme').hide()
$('#files').children().hide().end().append('<div class="blob-editor"><img src="/images/modules/browser/loading.gif"/></div>')
$('.blob-editor').load($(this).attr('rel'),{},function(){$('#files').scrollTo(500)})
return false})
$('#cancel-blob-editing').livequery('click',function(){$('.blob-editor').remove()
$('#readme').show()
$('#files').children().show()
return false})
$('#download_button').click(function(){$.gitbox($(this).attr('href'))
return false})
$('.archive_link a').livequery('click',function(){$('.popup .inner').hide()
$('.popup .wait').show()
var url=$(this).attr('rel')
var times=0
$.smartPoller(function(retry){$.getJSON(url,function(data){if(times>60){return false}else if(data.ready){$(document).trigger('close.facebox')}else{times+=1
retry()}})})})
$('.other_archive_link').livequery('click',function(){$.gitbox($(this).attr('href'))
return false})
if($('#loading_commit_data').length>0){GitHub.CachedCommitDataPoller()}
if(GitHub&&GitHub.currentRef&&GitHub.commitSHA!=GitHub.currentRef){var link,type,path=GitHub.currentPath?GitHub.currentPath+'/':'',url='/'+GitHub.nameWithOwner
$('#browser .content a').each(function(){type=/\/blob\//.test(this.href)?'/blob/':'/tree/'
this.href=url+type+GitHub.currentRef+'/'+path+$(this).text()})}})
$(function(){GitHub.UFO={drawFont:function(){var canvas=document.getElementById('ufo');var ctx=canvas.getContext('2d');for(var i=0;i<glifs.length;i++){ctx.save();var x=(i%9)*100;var y=Math.floor(i/9)*100;ctx.translate(x+10,y+80);ctx.scale(.1,-.1);var glif=new GitHub.UFO.Glif(ctx,glifs[i]);glif.draw();ctx.restore();}}}
GitHub.UFO.Glif=function(ctx,contours){this.ctx=ctx;this.contours=contours;}
GitHub.UFO.Glif.prototype={draw:function(){this.ctx.beginPath();for(var i=0;i<this.contours.length;i++){this.drawContour(this.contours[i]);}
this.ctx.fillStyle='black';this.ctx.fill();},drawContour:function(vertices){for(var i=0;i<vertices.length;i++){if(i==0){this.moveVertex(vertices[i]);}else{this.drawVertex(vertices[i]);}}
this.drawVertex(vertices[0]);},moveVertex:function(v){this.ctx.moveTo(v[0],v[1]);},drawVertex:function(v){if(v.length==2){this.ctx.lineTo(v[0],v[1]);}else if(v.length==4){this.ctx.quadraticCurveTo(v[2],v[3],v[0],v[1]);}else if(v.length==6){this.ctx.bezierCurveTo(v[2],v[3],v[4],v[5],v[0],v[1]);}}}
if($('#ufo').length>0){GitHub.UFO.drawFont();}
$('.glif_diff').each(function(el){var sha=$(this).attr('rel');var ctx=this.getContext('2d');var data=eval('glif_'+sha);var glif=new GitHub.UFO.Glif(ctx,data);ctx.translate(0,240);ctx.scale(.333,-.333);glif.draw();});});$(function(){$('a.follow').click(function(){$.post(this.href,{})
$(this).parent().find('.follow').toggle()
return false})
$('#inline_visible_repos').click(function(){var link=$(this).spin(),url=window.location+'/ajax_public_repos'
$('.projects').load(url,function(){link.stopSpin()
$('.relatize').relatizeDate()})
link.hide()
return false})
if(GitHub.editableGenerator)$('#dashboard span.edit').each(GitHub.editableGenerator({width:'200px',submittype:'put'}))
$('.user_toggle').click(function(){var options={}
options[this.name]=this.checked?'1':'0'
options['_method']='put'
$.post('/account',options)
$('#notify_save').show()
setTimeout("$('#notify_save').fadeOut()",1000)})
$('#edit_user .info .rename').click(function(){$('#edit_user .username').toggle()
$('#user_rename').toggle()
return false})
$('#add_email_action').click(function(){$(this).toggle()
$('#add_email_form').toggle().find(':text').focus()
return false})
$('#cancel_add_email').click(function(){$('#add_email_action').toggle()
$('#add_email_form').toggle().find(':text').val('')
return false})
$('.delete_email').livequery('click',function(){if($('.email').length==1){$.facebox('You must always have at least one email address.  If you want to delete this address, add a new one first.')
return false}
$.post($(this).attr('href'),{email:$(this).prev().text()})
$(this).parent().remove()
return false})
$('#user_rename > input[type=submit]').click(function(){if(!confirm(GitHub.rename_confirmation())){return false}})
if($('.email').length>0){$('#add_email_form').submit(function(){$('#add_email_form :submit').attr('disabled',true).spin()
var self=this
$(this).ajaxSubmit(function(user){if(user){$('.emails ul').append(user)}else{$('.emails .add .error_box').show()}
$('#add_email_form :submit').attr('disabled',false).stopSpin()
$(self).find(':text').val('').focus()})
return false})}
$('#change_plan_toggle').click(function(){$('.plan_box').hide()
$('.user').hide()
$('#change_plan').show()
return false})
$('#change_plan_disabled_toggle').click(function(){$('#update_cc').hide()
$('.plan_box').hide()
$('.user').hide()
$('#account_disabled_notice').hide()
$('#change_plan').show()})
$('#update_cc_toggle').click(function(){$('.plan_box').hide()
$('#update_cc').show()
return false})
$('.plan_cancel').click(function(){$('#change_plan').hide()
$('.plan_box').hide()
$('.user').show()
$('#current_plan').show()
return false})
$('.change_plan_link').click(function(){var plan=$(this).attr('href').match(/#(\w+)/)[1]
var human_plan=$(this).parent().find('h3').text()
var direction=$(this).text().replace(/e$/,'ing')
$('#update_cc_form input#plan').val(plan)
if(plan=='free'){$('#update_cc_form').submit()
return false}
$('.user').show()
$('strong.plan_pricing').hide()
$('#change_plan').hide()
if(plan=='coupon'){$('#coupon_box').show()
return false}
$('#update_plan_status').html("<h2>You're "+direction+' to the '+human_plan+' Plan</h2>').show()
$('#'+plan+'_cost').show()
$('#update_cc').show()
if(!$('#can_update_cc').is('.dont_show'))$('#can_update_cc').show()
return false})
$('#plan_update_button').click(function(){$('#update_cc_form').submit()
return false})
$('#update_cc_form input[type=submit]').click(function(){$(this).attr('disabled',true)
$(this).val('Processing Credit Card...')
$('#update_cc_form').submit()})
$('#show_card_form').submit(function(){$.post($(this).attr('action'),{},function(data){var result=$('<p>'+data+'</p>')
$('#show_card_submit').after(result)})
return false})
$('#reveal_cancel_info').click(function(){$(this).toggle()
$('#cancel_info').toggle()
return false})
$('#cancel_plan').submit(function(){var message="Are you POSITIVE you want to delete your account? There is absolutely NO going back. All your repositories, comments, wiki pages - everything will be gone. Please consider downgrading your plan."
return confirm(message)})
if(window.location.href.match(/account\/upgrade$/)){$('#change_plan_toggle').click()}});$(function(){$('#see-more-elsewhere').click(function(){$('.seen-elsewhere').show()
$(this).remove()
return false})})
