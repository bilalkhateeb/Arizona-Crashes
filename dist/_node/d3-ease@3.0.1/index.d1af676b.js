const P=e=>+e;function b(e){return e*e}function w(e){return e*(2-e)}function I(e){return((e*=2)<=1?e*e:--e*(2-e)+1)/2}function k(e){return e*e*e}function q(e){return--e*e*e+1}function O(e){return((e*=2)<=1?e*e*e:(e-=2)*e*e+2)/2}var f=3,y=function e(t){t=+t;function n(a){return Math.pow(a,t)}return n.exponent=e,n}(f),Q=function e(t){t=+t;function n(a){return 1-Math.pow(1-a,t)}return n.exponent=e,n}(f),l=function e(t){t=+t;function n(a){return((a*=2)<=1?Math.pow(a,t):2-Math.pow(2-a,t))/2}return n.exponent=e,n}(f),x=Math.PI,v=x/2;function S(e){return+e==1?1:1-Math.cos(e*v)}function L(e){return Math.sin(e*v)}function d(e){return(1-Math.cos(x*e))/2}function r(e){return(Math.pow(2,-10*e)-.0009765625)*1.0009775171065494}function g(e){return r(1-+e)}function j(e){return 1-r(e)}function B(e){return((e*=2)<=1?r(1-e):2-r(e-1))/2}function z(e){return 1-Math.sqrt(1-e*e)}function A(e){return Math.sqrt(1- --e*e)}function C(e){return((e*=2)<=1?1-Math.sqrt(1-e*e):Math.sqrt(1-(e-=2)*e)+1)/2}var h=.36363636363636365,D=6/11,F=8/11,G=3/4,H=9/11,J=10/11,K=15/16,N=21/22,R=63/64,o=1/h/h;function T(e){return 1-c(1-e)}function c(e){return(e=+e)<h?o*e*e:e<F?o*(e-=D)*e+G:e<J?o*(e-=H)*e+K:o*(e-=N)*e+R}function U(e){return((e*=2)<=1?1-c(1-e):c(e-1)+1)/2}var $=1.70158,V=function e(t){t=+t;function n(a){return(a=+a)*a*(t*(a-1)+a)}return n.overshoot=e,n}($),W=function e(t){t=+t;function n(a){return--a*a*((a+1)*t+a)+1}return n.overshoot=e,n}($),E=function e(t){t=+t;function n(a){return((a*=2)<1?a*a*((t+1)*a-t):(a-=2)*a*((t+1)*a+t)+2)/2}return n.overshoot=e,n}($),i=2*Math.PI,M=1,p=.3,X=function e(t,n){var a=Math.asin(1/(t=Math.max(1,t)))*(n/=i);function s(u){return t*r(- --u)*Math.sin((a-u)/n)}return s.amplitude=function(u){return e(u,n*i)},s.period=function(u){return e(t,u)},s}(M,p),m=function e(t,n){var a=Math.asin(1/(t=Math.max(1,t)))*(n/=i);function s(u){return 1-t*r(u=+u)*Math.sin((u+a)/n)}return s.amplitude=function(u){return e(u,n*i)},s.period=function(u){return e(t,u)},s}(M,p),Y=function e(t,n){var a=Math.asin(1/(t=Math.max(1,t)))*(n/=i);function s(u){return((u=u*2-1)<0?t*r(-u)*Math.sin((a-u)/n):2-t*r(u)*Math.sin((a+u)/n))/2}return s.amplitude=function(u){return e(u,n*i)},s.period=function(u){return e(t,u)},s}(M,p);export{E as easeBack,V as easeBackIn,E as easeBackInOut,W as easeBackOut,c as easeBounce,T as easeBounceIn,U as easeBounceInOut,c as easeBounceOut,C as easeCircle,z as easeCircleIn,C as easeCircleInOut,A as easeCircleOut,O as easeCubic,k as easeCubicIn,O as easeCubicInOut,q as easeCubicOut,m as easeElastic,X as easeElasticIn,Y as easeElasticInOut,m as easeElasticOut,B as easeExp,g as easeExpIn,B as easeExpInOut,j as easeExpOut,P as easeLinear,l as easePoly,y as easePolyIn,l as easePolyInOut,Q as easePolyOut,I as easeQuad,b as easeQuadIn,I as easeQuadInOut,w as easeQuadOut,d as easeSin,S as easeSinIn,d as easeSinInOut,L as easeSinOut};
