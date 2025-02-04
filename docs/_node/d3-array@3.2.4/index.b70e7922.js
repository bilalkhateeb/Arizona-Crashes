import{InternMap as P,InternSet as y}from"../internmap@2.0.3/index.4106013c.js";import{InternMap as Ft,InternSet as Rt}from"../internmap@2.0.3/index.4106013c.js";function m(n,t){return n==null||t==null?NaN:n<t?-1:n>t?1:n>=t?0:NaN}function Q(n,t){return n==null||t==null?NaN:t<n?-1:t>n?1:t>=n?0:NaN}function D(n){let t,e,o;n.length!==2?(t=m,e=(a,l)=>m(n(a),l),o=(a,l)=>n(a)-l):(t=n===m||n===Q?n:Mn,e=n,o=n);function r(a,l,i=0,h=a.length){if(i<h){if(t(l,l)!==0)return h;do{const s=i+h>>>1;e(a[s],l)<0?i=s+1:h=s}while(i<h)}return i}function f(a,l,i=0,h=a.length){if(i<h){if(t(l,l)!==0)return h;do{const s=i+h>>>1;e(a[s],l)<=0?i=s+1:h=s}while(i<h)}return i}function u(a,l,i=0,h=a.length){const s=r(a,l,i,h-1);return s>i&&o(a[s-1],l)>-o(a[s],l)?s-1:s}return{left:r,center:u,right:f}}function Mn(){return 0}function F(n){return n===null?NaN:+n}function*vn(n,t){if(t===void 0)for(let e of n)e!=null&&(e=+e)>=e&&(yield e);else{let e=-1;for(let o of n)(o=t(o,++e,n))!=null&&(o=+o)>=o&&(yield o)}}const V=D(m),W=V.right,An=V.left,xn=D(F).center;var X=W;function bn(n,t){if(!((t=+t)>=0))throw new RangeError("invalid r");let e=n.length;if(!((e=Math.floor(e))>=0))throw new RangeError("invalid length");if(!e||!t)return n;const o=G(t),r=n.slice();return o(n,r,0,e,1),o(r,n,0,e,1),o(n,r,0,e,1),n}const En=Y(G),Nn=Y(Sn);function Y(n){return function(t,e,o=e){if(!((e=+e)>=0))throw new RangeError("invalid rx");if(!((o=+o)>=0))throw new RangeError("invalid ry");let{data:r,width:f,height:u}=t;if(!((f=Math.floor(f))>=0))throw new RangeError("invalid width");if(!((u=Math.floor(u!==void 0?u:r.length/f))>=0))throw new RangeError("invalid height");if(!f||!u||!e&&!o)return t;const a=e&&n(e),l=o&&n(o),i=r.slice();return a&&l?($(a,i,r,f,u),$(a,r,i,f,u),$(a,i,r,f,u),w(l,r,i,f,u),w(l,i,r,f,u),w(l,r,i,f,u)):a?($(a,r,i,f,u),$(a,i,r,f,u),$(a,r,i,f,u)):l&&(w(l,r,i,f,u),w(l,i,r,f,u),w(l,r,i,f,u)),t}}function $(n,t,e,o,r){for(let f=0,u=o*r;f<u;)n(t,e,f,f+=o,1)}function w(n,t,e,o,r){for(let f=0,u=o*r;f<o;++f)n(t,e,f,f+u,o)}function Sn(n){const t=G(n);return(e,o,r,f,u)=>{r<<=2,f<<=2,u<<=2,t(e,o,r+0,f+0,u),t(e,o,r+1,f+1,u),t(e,o,r+2,f+2,u),t(e,o,r+3,f+3,u)}}function G(n){const t=Math.floor(n);if(t===n)return qn(n);const e=n-t,o=2*n+1;return(r,f,u,a,l)=>{if(!((a-=l)>=u))return;let i=t*f[u];const h=l*t,s=h+l;for(let c=u,d=u+h;c<d;c+=l)i+=f[Math.min(a,c)];for(let c=u,d=a;c<=d;c+=l)i+=f[Math.min(a,c+h)],r[c]=(i+e*(f[Math.max(u,c-s)]+f[Math.min(a,c+s)]))/o,i-=f[Math.max(u,c-h)]}}function qn(n){const t=2*n+1;return(e,o,r,f,u)=>{if(!((f-=u)>=r))return;let a=n*o[r];const l=u*n;for(let i=r,h=r+l;i<h;i+=u)a+=o[Math.min(f,i)];for(let i=r,h=f;i<=h;i+=u)a+=o[Math.min(f,i+l)],e[i]=a/t,a-=o[Math.max(r,i-l)]}}function R(n,t){let e=0;if(t===void 0)for(let o of n)o!=null&&(o=+o)>=o&&++e;else{let o=-1;for(let r of n)(r=t(r,++o,n))!=null&&(r=+r)>=r&&++e}return e}function In(n){return n.length|0}function Fn(n){return!(n>0)}function Rn(n){return typeof n!="object"||"length"in n?n:Array.from(n)}function Tn(n){return t=>n(...t)}function kn(...n){const t=typeof n[n.length-1]=="function"&&Tn(n.pop());n=n.map(Rn);const e=n.map(In),o=n.length-1,r=new Array(o+1).fill(0),f=[];if(o<0||e.some(Fn))return f;for(;;){f.push(r.map((a,l)=>n[l][a]));let u=o;for(;++r[u]===e[u];){if(u===0)return t?f.map(t):f;r[u--]=0}}}function _n(n,t){var e=0,o=0;return Float64Array.from(n,t===void 0?r=>e+=+r||0:r=>e+=+t(r,o++,n)||0)}function Z(n,t){let e=0,o,r=0,f=0;if(t===void 0)for(let u of n)u!=null&&(u=+u)>=u&&(o=u-r,r+=o/++e,f+=o*(u-r));else{let u=-1;for(let a of n)(a=t(a,++u,n))!=null&&(a=+a)>=a&&(o=a-r,r+=o/++e,f+=o*(a-r))}if(e>1)return f/(e-1)}function nn(n,t){const e=Z(n,t);return e&&Math.sqrt(e)}function T(n,t){let e,o;if(t===void 0)for(const r of n)r!=null&&(e===void 0?r>=r&&(e=o=r):(e>r&&(e=r),o<r&&(o=r)));else{let r=-1;for(let f of n)(f=t(f,++r,n))!=null&&(e===void 0?f>=f&&(e=o=f):(e>f&&(e=f),o<f&&(o=f)))}return[e,o]}let L=class{constructor(){this._partials=new Float64Array(32),this._n=0}add(t){const e=this._partials;let o=0;for(let r=0;r<this._n&&r<32;r++){const f=e[r],u=t+f,a=Math.abs(t)<Math.abs(f)?t-(u-f):f-(u-t);a&&(e[o++]=a),t=u}return e[o]=t,this._n=o+1,this}valueOf(){const t=this._partials;let e=this._n,o,r,f,u=0;if(e>0){for(u=t[--e];e>0&&(o=u,r=t[--e],u=o+r,f=r-(u-o),!f););e>0&&(f<0&&t[e-1]<0||f>0&&t[e-1]>0)&&(r=f*2,o=u+r,r==o-u&&(u=o))}return u}};function jn(n,t){const e=new L;if(t===void 0)for(let o of n)(o=+o)&&e.add(o);else{let o=-1;for(let r of n)(r=+t(r,++o,n))&&e.add(r)}return+e}function On(n,t){const e=new L;let o=-1;return Float64Array.from(n,t===void 0?r=>e.add(+r||0):r=>e.add(+t(r,++o,n)||0))}function M(n){return n}function tn(n,...t){return v(n,M,M,t)}function en(n,...t){return v(n,Array.from,M,t)}function rn(n,t){for(let e=1,o=t.length;e<o;++e)n=n.flatMap(r=>r.pop().map(([f,u])=>[...r,f,u]));return n}function Un(n,...t){return rn(en(n,...t),t)}function Dn(n,t,...e){return rn(fn(n,t,...e),e)}function on(n,t,...e){return v(n,M,t,e)}function fn(n,t,...e){return v(n,Array.from,t,e)}function Gn(n,...t){return v(n,M,un,t)}function Ln(n,...t){return v(n,Array.from,un,t)}function un(n){if(n.length!==1)throw new Error("duplicate key");return n[0]}function v(n,t,e,o){return function r(f,u){if(u>=o.length)return e(f);const a=new P,l=o[u++];let i=-1;for(const h of f){const s=l(h,++i,f),c=a.get(s);c?c.push(h):a.set(s,[h])}for(const[h,s]of a)a.set(h,r(s,u));return t(a)}(n,0)}function an(n,t){return Array.from(t,e=>n[e])}function z(n,...t){if(typeof n[Symbol.iterator]!="function")throw new TypeError("values is not iterable");n=Array.from(n);let[e]=t;if(e&&e.length!==2||t.length>1){const o=Uint32Array.from(n,(r,f)=>f);return t.length>1?(t=t.map(r=>n.map(r)),o.sort((r,f)=>{for(const u of t){const a=A(u[r],u[f]);if(a)return a}})):(e=n.map(e),o.sort((r,f)=>A(e[r],e[f]))),an(n,o)}return n.sort(C(e))}function C(n=m){if(n===m)return A;if(typeof n!="function")throw new TypeError("compare is not a function");return(t,e)=>{const o=n(t,e);return o||o===0?o:(n(e,e)===0)-(n(t,t)===0)}}function A(n,t){return(n==null||!(n>=n))-(t==null||!(t>=t))||(n<t?-1:n>t?1:0)}function zn(n,t,e){return(t.length!==2?z(on(n,t,e),([o,r],[f,u])=>m(r,u)||m(o,f)):z(tn(n,e),([o,r],[f,u])=>t(r,u)||m(o,f))).map(([o])=>o)}var Cn=Array.prototype,Bn=Cn.slice;function B(n){return()=>n}const Hn=Math.sqrt(50),Jn=Math.sqrt(10),Kn=Math.sqrt(2);function k(n,t,e){const o=(t-n)/Math.max(0,e),r=Math.floor(Math.log10(o)),f=o/Math.pow(10,r),u=f>=Hn?10:f>=Jn?5:f>=Kn?2:1;let a,l,i;return r<0?(i=Math.pow(10,-r)/u,a=Math.round(n*i),l=Math.round(t*i),a/i<n&&++a,l/i>t&&--l,i=-i):(i=Math.pow(10,r)*u,a=Math.round(n/i),l=Math.round(t/i),a*i<n&&++a,l*i>t&&--l),l<a&&.5<=e&&e<2?k(n,t,e*2):[a,l,i]}function ln(n,t,e){if(t=+t,n=+n,e=+e,!(e>0))return[];if(n===t)return[n];const o=t<n,[r,f,u]=o?k(t,n,e):k(n,t,e);if(!(f>=r))return[];const a=f-r+1,l=new Array(a);if(o)if(u<0)for(let i=0;i<a;++i)l[i]=(f-i)/-u;else for(let i=0;i<a;++i)l[i]=(f-i)*u;else if(u<0)for(let i=0;i<a;++i)l[i]=(r+i)/-u;else for(let i=0;i<a;++i)l[i]=(r+i)*u;return l}function x(n,t,e){return t=+t,n=+n,e=+e,k(n,t,e)[2]}function Pn(n,t,e){t=+t,n=+n,e=+e;const o=t<n,r=o?x(t,n,e):x(n,t,e);return(o?-1:1)*(r<0?1/-r:r)}function sn(n,t,e){let o;for(;;){const r=x(n,t,e);if(r===o||r===0||!isFinite(r))return[n,t];r>0?(n=Math.floor(n/r)*r,t=Math.ceil(t/r)*r):r<0&&(n=Math.ceil(n*r)/r,t=Math.floor(t*r)/r),o=r}}function cn(n){return Math.max(1,Math.ceil(Math.log(R(n))/Math.LN2)+1)}function hn(){var n=M,t=T,e=cn;function o(r){Array.isArray(r)||(r=Array.from(r));var f,u=r.length,a,l,i=new Array(u);for(f=0;f<u;++f)i[f]=n(r[f],f,r);var h=t(i),s=h[0],c=h[1],d=e(i,s,c);if(!Array.isArray(d)){const q=c,I=+d;if(t===T&&([s,c]=sn(s,c,I)),d=ln(s,c,I),d[0]<=s&&(l=x(s,c,I)),d[d.length-1]>=c)if(q>=c&&t===T){const g=x(s,c,I);isFinite(g)&&(g>0?c=(Math.floor(c/g)+1)*g:g<0&&(c=(Math.ceil(c*-g)+1)/-g))}else d.pop()}for(var p=d.length,b=0,E=p;d[b]<=s;)++b;for(;d[E-1]>c;)--E;(b||E<p)&&(d=d.slice(b,E),p=E-b);var N=new Array(p+1),U;for(f=0;f<=p;++f)U=N[f]=[],U.x0=f>0?d[f-1]:s,U.x1=f<p?d[f]:c;if(isFinite(l)){if(l>0)for(f=0;f<u;++f)(a=i[f])!=null&&s<=a&&a<=c&&N[Math.min(p,Math.floor((a-s)/l))].push(r[f]);else if(l<0){for(f=0;f<u;++f)if((a=i[f])!=null&&s<=a&&a<=c){const q=Math.floor((s-a)*l);N[Math.min(p,q+(d[q]<=a))].push(r[f])}}}else for(f=0;f<u;++f)(a=i[f])!=null&&s<=a&&a<=c&&N[X(d,a,0,p)].push(r[f]);return N}return o.value=function(r){return arguments.length?(n=typeof r=="function"?r:B(r),o):n},o.domain=function(r){return arguments.length?(t=typeof r=="function"?r:B([r[0],r[1]]),o):t},o.thresholds=function(r){return arguments.length?(e=typeof r=="function"?r:B(Array.isArray(r)?Bn.call(r):r),o):e},o}function H(n,t){let e;if(t===void 0)for(const o of n)o!=null&&(e<o||e===void 0&&o>=o)&&(e=o);else{let o=-1;for(let r of n)(r=t(r,++o,n))!=null&&(e<r||e===void 0&&r>=r)&&(e=r)}return e}function J(n,t){let e,o=-1,r=-1;if(t===void 0)for(const f of n)++r,f!=null&&(e<f||e===void 0&&f>=f)&&(e=f,o=r);else for(let f of n)(f=t(f,++r,n))!=null&&(e<f||e===void 0&&f>=f)&&(e=f,o=r);return o}function _(n,t){let e;if(t===void 0)for(const o of n)o!=null&&(e>o||e===void 0&&o>=o)&&(e=o);else{let o=-1;for(let r of n)(r=t(r,++o,n))!=null&&(e>r||e===void 0&&r>=r)&&(e=r)}return e}function K(n,t){let e,o=-1,r=-1;if(t===void 0)for(const f of n)++r,f!=null&&(e>f||e===void 0&&f>=f)&&(e=f,o=r);else for(let f of n)(f=t(f,++r,n))!=null&&(e>f||e===void 0&&f>=f)&&(e=f,o=r);return o}function j(n,t,e=0,o=1/0,r){if(t=Math.floor(t),e=Math.floor(Math.max(0,e)),o=Math.floor(Math.min(n.length-1,o)),!(e<=t&&t<=o))return n;for(r=r===void 0?A:C(r);o>e;){if(o-e>600){const l=o-e+1,i=t-e+1,h=Math.log(l),s=.5*Math.exp(2*h/3),c=.5*Math.sqrt(h*s*(l-s)/l)*(i-l/2<0?-1:1),d=Math.max(e,Math.floor(t-i*s/l+c)),p=Math.min(o,Math.floor(t+(l-i)*s/l+c));j(n,t,d,p,r)}const f=n[t];let u=e,a=o;for(S(n,e,t),r(n[o],f)>0&&S(n,e,o);u<a;){for(S(n,u,a),++u,--a;r(n[u],f)<0;)++u;for(;r(n[a],f)>0;)--a}r(n[e],f)===0?S(n,e,a):(++a,S(n,a,o)),a<=t&&(e=a+1),t<=a&&(o=a-1)}return n}function S(n,t,e){const o=n[t];n[t]=n[e],n[e]=o}function dn(n,t=m){let e,o=!1;if(t.length===1){let r;for(const f of n){const u=t(f);(o?m(u,r)>0:m(u,u)===0)&&(e=f,r=u,o=!0)}}else for(const r of n)(o?t(r,e)>0:t(r,r)===0)&&(e=r,o=!0);return e}function O(n,t,e){if(n=Float64Array.from(vn(n,e)),!(!(o=n.length)||isNaN(t=+t))){if(t<=0||o<2)return _(n);if(t>=1)return H(n);var o,r=(o-1)*t,f=Math.floor(r),u=H(j(n,f).subarray(0,f+1)),a=_(n.subarray(f+1));return u+(a-u)*(r-f)}}function Qn(n,t,e=F){if(!(!(o=n.length)||isNaN(t=+t))){if(t<=0||o<2)return+e(n[0],0,n);if(t>=1)return+e(n[o-1],o-1,n);var o,r=(o-1)*t,f=Math.floor(r),u=+e(n[f],f,n),a=+e(n[f+1],f+1,n);return u+(a-u)*(r-f)}}function mn(n,t,e=F){if(!isNaN(t=+t)){if(o=Float64Array.from(n,(a,l)=>F(e(n[l],l,n))),t<=0)return K(o);if(t>=1)return J(o);var o,r=Uint32Array.from(n,(a,l)=>l),f=o.length-1,u=Math.floor(f*t);return j(r,u,0,f,(a,l)=>A(o[a],o[l])),u=dn(r.subarray(0,u+1),a=>o[a]),u>=0?u:-1}}function Vn(n,t,e){const o=R(n),r=O(n,.75)-O(n,.25);return o&&r?Math.ceil((e-t)/(2*r*Math.pow(o,-1/3))):1}function Wn(n,t,e){const o=R(n),r=nn(n);return o&&r?Math.ceil((e-t)*Math.cbrt(o)/(3.49*r)):1}function Xn(n,t){let e=0,o=0;if(t===void 0)for(let r of n)r!=null&&(r=+r)>=r&&(++e,o+=r);else{let r=-1;for(let f of n)(f=t(f,++r,n))!=null&&(f=+f)>=f&&(++e,o+=f)}if(e)return o/e}function Yn(n,t){return O(n,.5,t)}function Zn(n,t){return mn(n,.5,t)}function*nt(n){for(const t of n)yield*t}function tt(n){return Array.from(nt(n))}function et(n,t){const e=new P;if(t===void 0)for(let f of n)f!=null&&f>=f&&e.set(f,(e.get(f)||0)+1);else{let f=-1;for(let u of n)(u=t(u,++f,n))!=null&&u>=u&&e.set(u,(e.get(u)||0)+1)}let o,r=0;for(const[f,u]of e)u>r&&(r=u,o=f);return o}function rt(n,t=ot){const e=[];let o,r=!1;for(const f of n)r&&e.push(t(o,f)),o=f,r=!0;return e}function ot(n,t){return[n,t]}function ft(n,t,e){n=+n,t=+t,e=(r=arguments.length)<2?(t=n,n=0,1):r<3?1:+e;for(var o=-1,r=Math.max(0,Math.ceil((t-n)/e))|0,f=new Array(r);++o<r;)f[o]=n+o*e;return f}function ut(n,t=m){if(typeof n[Symbol.iterator]!="function")throw new TypeError("values is not iterable");let e=Array.from(n);const o=new Float64Array(e.length);t.length!==2&&(e=e.map(t),t=m);const r=(a,l)=>t(e[a],e[l]);let f,u;return n=Uint32Array.from(e,(a,l)=>l),n.sort(t===m?(a,l)=>A(e[a],e[l]):C(r)),n.forEach((a,l)=>{const i=r(a,f===void 0?a:f);i>=0?((f===void 0||i>0)&&(f=a,u=l),o[a]=u):o[a]=NaN}),o}function at(n,t=m){let e,o=!1;if(t.length===1){let r;for(const f of n){const u=t(f);(o?m(u,r)<0:m(u,u)===0)&&(e=f,r=u,o=!0)}}else for(const r of n)(o?t(r,e)<0:t(r,r)===0)&&(e=r,o=!0);return e}function pn(n,t=m){if(t.length===1)return K(n,t);let e,o=-1,r=-1;for(const f of n)++r,(o<0?t(f,f)===0:t(f,e)<0)&&(e=f,o=r);return o}function it(n,t=m){if(t.length===1)return J(n,t);let e,o=-1,r=-1;for(const f of n)++r,(o<0?t(f,f)===0:t(f,e)>0)&&(e=f,o=r);return o}function lt(n,t){const e=pn(n,t);return e<0?void 0:e}var st=gn(Math.random);function gn(n){return function(t,e=0,o=t.length){let r=o-(e=+e);for(;r;){const f=n()*r--|0,u=t[r+e];t[r+e]=t[f+e],t[f+e]=u}return t}}function ct(n,t){let e=0;if(t===void 0)for(let o of n)(o=+o)&&(e+=o);else{let o=-1;for(let r of n)(r=+t(r,++o,n))&&(e+=r)}return e}function yn(n){if(!(f=n.length))return[];for(var t=-1,e=_(n,ht),o=new Array(e);++t<e;)for(var r=-1,f,u=o[t]=new Array(f);++r<f;)u[r]=n[r][t];return o}function ht(n){return n.length}function dt(){return yn(arguments)}function mt(n,t){if(typeof t!="function")throw new TypeError("test is not a function");let e=-1;for(const o of n)if(!t(o,++e,n))return!1;return!0}function pt(n,t){if(typeof t!="function")throw new TypeError("test is not a function");let e=-1;for(const o of n)if(t(o,++e,n))return!0;return!1}function gt(n,t){if(typeof t!="function")throw new TypeError("test is not a function");const e=[];let o=-1;for(const r of n)t(r,++o,n)&&e.push(r);return e}function yt(n,t){if(typeof n[Symbol.iterator]!="function")throw new TypeError("values is not iterable");if(typeof t!="function")throw new TypeError("mapper is not a function");return Array.from(n,(e,o)=>t(e,o,n))}function $t(n,t,e){if(typeof t!="function")throw new TypeError("reducer is not a function");const o=n[Symbol.iterator]();let r,f,u=-1;if(arguments.length<3){if({done:r,value:e}=o.next(),r)return;++u}for(;{done:r,value:f}=o.next(),!r;)e=t(e,f,++u,n);return e}function wt(n){if(typeof n[Symbol.iterator]!="function")throw new TypeError("values is not iterable");return Array.from(n).reverse()}function Mt(n,...t){n=new y(n);for(const e of t)for(const o of e)n.delete(o);return n}function vt(n,t){const e=t[Symbol.iterator](),o=new y;for(const r of n){if(o.has(r))return!1;let f,u;for(;({value:f,done:u}=e.next())&&!u;){if(Object.is(r,f))return!1;o.add(f)}}return!0}function At(n,...t){n=new y(n),t=t.map(xt);n:for(const e of n)for(const o of t)if(!o.has(e)){n.delete(e);continue n}return n}function xt(n){return n instanceof y?n:new y(n)}function $n(n,t){const e=n[Symbol.iterator](),o=new Set;for(const r of t){const f=wn(r);if(o.has(f))continue;let u,a;for(;{value:u,done:a}=e.next();){if(a)return!1;const l=wn(u);if(o.add(l),Object.is(f,l))break}}return!0}function wn(n){return n!==null&&typeof n=="object"?n.valueOf():n}function bt(n,t){return $n(t,n)}function Et(...n){const t=new y;for(const e of n)for(const o of e)t.add(o);return t}export{L as Adder,Ft as InternMap,Rt as InternSet,m as ascending,hn as bin,X as bisect,xn as bisectCenter,An as bisectLeft,W as bisectRight,D as bisector,bn as blur,En as blur2,Nn as blurImage,R as count,kn as cross,_n as cumsum,Q as descending,nn as deviation,Mt as difference,vt as disjoint,mt as every,T as extent,On as fcumsum,gt as filter,Un as flatGroup,Dn as flatRollup,jn as fsum,dn as greatest,it as greatestIndex,tn as group,zn as groupSort,en as groups,hn as histogram,Gn as index,Ln as indexes,At as intersection,at as least,pn as leastIndex,yt as map,H as max,J as maxIndex,Xn as mean,Yn as median,Zn as medianIndex,tt as merge,_ as min,K as minIndex,et as mode,sn as nice,rt as pairs,an as permute,O as quantile,mn as quantileIndex,Qn as quantileSorted,j as quickselect,ft as range,ut as rank,$t as reduce,wt as reverse,on as rollup,fn as rollups,lt as scan,st as shuffle,gn as shuffler,pt as some,z as sort,bt as subset,ct as sum,$n as superset,Vn as thresholdFreedmanDiaconis,Wn as thresholdScott,cn as thresholdSturges,x as tickIncrement,Pn as tickStep,ln as ticks,yn as transpose,Et as union,Z as variance,dt as zip};
