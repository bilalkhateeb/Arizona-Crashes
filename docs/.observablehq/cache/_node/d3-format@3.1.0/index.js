function V(e){return Math.abs(e=Math.round(e))>=1e21?e.toLocaleString("en").replace(/,/g,""):e.toString(10)}function z(e,n){if((t=(e=n?e.toExponential(n-1):e.toExponential()).indexOf("e"))<0)return null;var t,r=e.slice(0,t);return[r.length>1?r[0]+r.slice(2):r,+e.slice(t+1)]}function y(e){return e=z(Math.abs(e)),e?e[1]:NaN}function W(e,n){return function(t,r){for(var a=t.length,s=[],d=0,h=e[0],b=0;a>0&&h>0&&(b+h+1>r&&(h=Math.max(1,r-b)),s.push(t.substring(a-=h,a+h)),!((b+=h+1)>r));)h=e[d=(d+1)%e.length];return s.reverse().join(n)}}function _(e){return function(n){return n.replace(/[0-9]/g,function(t){return e[+t]})}}var ee=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function A(e){if(!(n=ee.exec(e)))throw new Error("invalid format: "+e);var n;return new N({fill:n[1],align:n[2],sign:n[3],symbol:n[4],zero:n[5],width:n[6],comma:n[7],precision:n[8]&&n[8].slice(1),trim:n[9],type:n[10]})}A.prototype=N.prototype;function N(e){this.fill=e.fill===void 0?" ":e.fill+"",this.align=e.align===void 0?">":e.align+"",this.sign=e.sign===void 0?"-":e.sign+"",this.symbol=e.symbol===void 0?"":e.symbol+"",this.zero=!!e.zero,this.width=e.width===void 0?void 0:+e.width,this.comma=!!e.comma,this.precision=e.precision===void 0?void 0:+e.precision,this.trim=!!e.trim,this.type=e.type===void 0?"":e.type+""}N.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(this.width===void 0?"":Math.max(1,this.width|0))+(this.comma?",":"")+(this.precision===void 0?"":"."+Math.max(0,this.precision|0))+(this.trim?"~":"")+this.type};function ne(e){e:for(var n=e.length,t=1,r=-1,a;t<n;++t)switch(e[t]){case".":r=a=t;break;case"0":r===0&&(r=t),a=t;break;default:if(!+e[t])break e;r>0&&(r=0);break}return r>0?e.slice(0,r)+e.slice(a+1):e}var G;function ie(e,n){var t=z(e,n);if(!t)return e+"";var r=t[0],a=t[1],s=a-(G=Math.max(-8,Math.min(8,Math.floor(a/3)))*3)+1,d=r.length;return s===d?r:s>d?r+new Array(s-d+1).join("0"):s>0?r.slice(0,s)+"."+r.slice(s):"0."+new Array(1-s).join("0")+z(e,Math.max(0,n+s-1))[0]}function T(e,n){var t=z(e,n);if(!t)return e+"";var r=t[0],a=t[1];return a<0?"0."+new Array(-a).join("0")+r:r.length>a+1?r.slice(0,a+1)+"."+r.slice(a+1):r+new Array(a-r.length+2).join("0")}var Y={"%":(e,n)=>(e*100).toFixed(n),b:e=>Math.round(e).toString(2),c:e=>e+"",d:V,e:(e,n)=>e.toExponential(n),f:(e,n)=>e.toFixed(n),g:(e,n)=>e.toPrecision(n),o:e=>Math.round(e).toString(8),p:(e,n)=>T(e*100,n),r:T,s:ie,X:e=>Math.round(e).toString(16).toUpperCase(),x:e=>Math.round(e).toString(16)};function Z(e){return e}var q=Array.prototype.map,D=["y","z","a","f","p","n","\xB5","m","","k","M","G","T","P","E","Z","Y"];function I(e){var n=e.grouping===void 0||e.thousands===void 0?Z:W(q.call(e.grouping,Number),e.thousands+""),t=e.currency===void 0?"":e.currency[0]+"",r=e.currency===void 0?"":e.currency[1]+"",a=e.decimal===void 0?".":e.decimal+"",s=e.numerals===void 0?Z:_(q.call(e.numerals,String)),d=e.percent===void 0?"%":e.percent+"",h=e.minus===void 0?"\u2212":e.minus+"",b=e.nan===void 0?"NaN":e.nan+"";function F(o){o=A(o);var x=o.fill,v=o.align,f=o.sign,w=o.symbol,p=o.zero,$=o.width,E=o.comma,m=o.precision,L=o.trim,u=o.type;u==="n"?(E=!0,u="g"):Y[u]||(m===void 0&&(m=12),L=!0,u="g"),(p||x==="0"&&v==="=")&&(p=!0,x="0",v="=");var J=w==="$"?t:w==="#"&&/[boxX]/.test(u)?"0"+u.toLowerCase():"",K=w==="$"?r:/[%p]/.test(u)?d:"",C=Y[u],Q=/[defgprs%]/.test(u);m=m===void 0?6:/[gprs]/.test(u)?Math.max(1,Math.min(21,m)):Math.max(0,Math.min(20,m));function X(i){var g=J,c=K,M,B,S;if(u==="c")c=C(i)+c,i="";else{i=+i;var k=i<0||1/i<0;if(i=isNaN(i)?b:C(Math.abs(i),m),L&&(i=ne(i)),k&&+i==0&&f!=="+"&&(k=!1),g=(k?f==="("?f:h:f==="-"||f==="("?"":f)+g,c=(u==="s"?D[8+G/3]:"")+c+(k&&f==="("?")":""),Q){for(M=-1,B=i.length;++M<B;)if(S=i.charCodeAt(M),48>S||S>57){c=(S===46?a+i.slice(M+1):i.slice(M))+c,i=i.slice(0,M);break}}}E&&!p&&(i=n(i,1/0));var j=g.length+i.length+c.length,l=j<$?new Array($-j+1).join(x):"";switch(E&&p&&(i=n(l+i,l.length?$-c.length:1/0),l=""),v){case"<":i=g+i+c+l;break;case"=":i=g+l+i+c;break;case"^":i=l.slice(0,j=l.length>>1)+g+i+c+l.slice(j);break;default:i=l+g+i+c;break}return s(i)}return X.toString=function(){return o+""},X}function H(o,x){var v=F((o=A(o),o.type="f",o)),f=Math.max(-8,Math.min(8,Math.floor(y(x)/3)))*3,w=Math.pow(10,-f),p=D[8+f/3];return function($){return v(w*$)+p}}return{format:F,formatPrefix:H}}var P,O,R;U({thousands:",",grouping:[3],currency:["$",""]});function U(e){return P=I(e),O=P.format,R=P.formatPrefix,P}function re(e){return Math.max(0,-y(Math.abs(e)))}function te(e,n){return Math.max(0,Math.max(-8,Math.min(8,Math.floor(y(n)/3)))*3-y(Math.abs(e)))}function ae(e,n){return e=Math.abs(e),n=Math.abs(n)-e,Math.max(0,y(n)-y(e))+1}export{N as FormatSpecifier,O as format,U as formatDefaultLocale,I as formatLocale,R as formatPrefix,A as formatSpecifier,re as precisionFixed,te as precisionPrefix,ae as precisionRound};
