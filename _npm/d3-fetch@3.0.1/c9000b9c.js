/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.37.0.
 * Original file: /npm/d3-fetch@3.0.1/src/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import{dsvFormat as t,csvParse as n,tsvParse as r}from"../d3-dsv@3.0.1/d5dacb58.js";function e(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.blob()}function o(t,n){return fetch(t,n).then(e)}function u(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.arrayBuffer()}function f(t,n){return fetch(t,n).then(u)}function i(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.text()}function s(t,n){return fetch(t,n).then(i)}function a(t){return function(n,r,e){return 2===arguments.length&&"function"==typeof r&&(e=r,r=void 0),s(n,r).then((function(n){return t(n,e)}))}}function c(n,r,e,o){3===arguments.length&&"function"==typeof e&&(o=e,e=void 0);var u=t(n);return s(r,e).then((function(t){return u.parse(t,o)}))}var h=a(n),l=a(r);function m(t,n){return new Promise((function(r,e){var o=new Image;for(var u in n)o[u]=n[u];o.onerror=e,o.onload=function(){r(o)},o.src=t}))}function w(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);if(204!==t.status&&205!==t.status)return t.json()}function p(t,n){return fetch(t,n).then(w)}function x(t){return(n,r)=>s(n,r).then((n=>(new DOMParser).parseFromString(n,t)))}var v=x("application/xml"),d=x("text/html"),g=x("image/svg+xml");export{o as blob,f as buffer,h as csv,c as dsv,d as html,m as image,p as json,g as svg,s as text,l as tsv,v as xml};export default null;
