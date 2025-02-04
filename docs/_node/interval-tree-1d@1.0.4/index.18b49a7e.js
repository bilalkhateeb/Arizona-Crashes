import*as E from"../binary-search-bounds@2.0.5/index.add414e4.js";function F(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function N(t){return t&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var S=N(E),g=S,u=0,f=1,v=2,B=M;function P(t,i,r,n,h){this.mid=t,this.left=i,this.right=r,this.leftPoints=n,this.rightPoints=h,this.count=(i?i.count:0)+(r?r.count:0)+n.length}var a=P.prototype;function p(t,i){t.mid=i.mid,t.left=i.left,t.right=i.right,t.leftPoints=i.leftPoints,t.rightPoints=i.rightPoints,t.count=i.count}function w(t,i){var r=l(i);t.mid=r.mid,t.left=r.left,t.right=r.right,t.leftPoints=r.leftPoints,t.rightPoints=r.rightPoints,t.count=r.count}function I(t,i){var r=t.intervals([]);r.push(i),w(t,r)}function j(t,i){var r=t.intervals([]),n=r.indexOf(i);return n<0?u:(r.splice(n,1),w(t,r),f)}a.intervals=function(t){return t.push.apply(t,this.leftPoints),this.left&&this.left.intervals(t),this.right&&this.right.intervals(t),t},a.insert=function(t){var i=this.count-this.leftPoints.length;if(this.count+=1,t[1]<this.mid)this.left?4*(this.left.count+1)>3*(i+1)?I(this,t):this.left.insert(t):this.left=l([t]);else if(t[0]>this.mid)this.right?4*(this.right.count+1)>3*(i+1)?I(this,t):this.right.insert(t):this.right=l([t]);else{var r=g.ge(this.leftPoints,t,d),n=g.ge(this.rightPoints,t,m);this.leftPoints.splice(r,0,t),this.rightPoints.splice(n,0,t)}},a.remove=function(t){var i=this.count-this.leftPoints;if(t[1]<this.mid){if(!this.left)return u;var r=this.right?this.right.count:0;if(4*r>3*(i-1))return j(this,t);var n=this.left.remove(t);return n===v?(this.left=null,this.count-=1,f):(n===f&&(this.count-=1),n)}else if(t[0]>this.mid){if(!this.right)return u;var h=this.left?this.left.count:0;if(4*h>3*(i-1))return j(this,t);var n=this.right.remove(t);return n===v?(this.right=null,this.count-=1,f):(n===f&&(this.count-=1),n)}else{if(this.count===1)return this.leftPoints[0]===t?v:u;if(this.leftPoints.length===1&&this.leftPoints[0]===t){if(this.left&&this.right){for(var o=this,e=this.left;e.right;)o=e,e=e.right;if(o===this)e.right=this.right;else{var s=this.left,n=this.right;o.count-=e.count,o.right=e.left,e.left=s,e.right=n}p(this,e),this.count=(this.left?this.left.count:0)+(this.right?this.right.count:0)+this.leftPoints.length}else this.left?p(this,this.left):p(this,this.right);return f}for(var s=g.ge(this.leftPoints,t,d);s<this.leftPoints.length&&this.leftPoints[s][0]===t[0];++s)if(this.leftPoints[s]===t){this.count-=1,this.leftPoints.splice(s,1);for(var n=g.ge(this.rightPoints,t,m);n<this.rightPoints.length&&this.rightPoints[n][1]===t[1];++n)if(this.rightPoints[n]===t)return this.rightPoints.splice(n,1),f}return u}};function _(t,i,r){for(var n=0;n<t.length&&t[n][0]<=i;++n){var h=r(t[n]);if(h)return h}}function b(t,i,r){for(var n=t.length-1;n>=0&&t[n][1]>=i;--n){var h=r(t[n]);if(h)return h}}function D(t,i){for(var r=0;r<t.length;++r){var n=i(t[r]);if(n)return n}}a.queryPoint=function(t,i){if(t<this.mid){if(this.left){var r=this.left.queryPoint(t,i);if(r)return r}return _(this.leftPoints,t,i)}else if(t>this.mid){if(this.right){var r=this.right.queryPoint(t,i);if(r)return r}return b(this.rightPoints,t,i)}else return D(this.leftPoints,i)},a.queryInterval=function(t,i,r){if(t<this.mid&&this.left){var n=this.left.queryInterval(t,i,r);if(n)return n}if(i>this.mid&&this.right){var n=this.right.queryInterval(t,i,r);if(n)return n}return i<this.mid?_(this.leftPoints,i,r):t>this.mid?b(this.rightPoints,t,r):D(this.leftPoints,r)};function C(t,i){return t-i}function d(t,i){var r=t[0]-i[0];return r||t[1]-i[1]}function m(t,i){var r=t[1]-i[1];return r||t[0]-i[0]}function l(t){if(t.length===0)return null;for(var i=[],r=0;r<t.length;++r)i.push(t[r][0],t[r][1]);i.sort(C);for(var n=i[i.length>>1],h=[],o=[],e=[],r=0;r<t.length;++r){var s=t[r];s[1]<n?h.push(s):n<s[0]?o.push(s):e.push(s)}var q=e,O=e.slice();return q.sort(d),O.sort(m),new P(n,l(h),l(o),q,O)}function y(t){this.root=t}var c=y.prototype;c.insert=function(t){this.root?this.root.insert(t):this.root=new P(t[0],null,null,[t],[t])},c.remove=function(t){if(this.root){var i=this.root.remove(t);return i===v&&(this.root=null),i!==u}return!1},c.queryPoint=function(t,i){if(this.root)return this.root.queryPoint(t,i)},c.queryInterval=function(t,i,r){if(t<=i&&this.root)return this.root.queryInterval(t,i,r)},Object.defineProperty(c,"count",{get:function(){return this.root?this.root.count:0}}),Object.defineProperty(c,"intervals",{get:function(){return this.root?this.root.intervals([]):[]}});function M(t){return!t||t.length===0?new y(null):new y(l(t))}var R=F(B);export{R as default};
