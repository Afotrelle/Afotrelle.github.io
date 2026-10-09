import{r as g}from"./index.yBjzXJbu.js";var c={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function x(){if(p)return o;p=1;var u=g(),n=Symbol.for("react.element"),t=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,w=u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,R={key:!0,ref:!0,__self:!0,__source:!0};function f(i,r,l){var e,s={},d=null,m=null;l!==void 0&&(d=""+l),r.key!==void 0&&(d=""+r.key),r.ref!==void 0&&(m=r.ref);for(e in r)a.call(r,e)&&!R.hasOwnProperty(e)&&(s[e]=r[e]);if(i&&i.defaultProps)for(e in r=i.defaultProps,r)s[e]===void 0&&(s[e]=r[e]);return{$$typeof:n,type:i,key:d,ref:m,props:s,_owner:w.current}}return o.Fragment=t,o.jsx=f,o.jsxs=f,o}var _;function y(){return _||(_=1,c.exports=x()),c.exports}var v=y();const b="arturo-windsurf-mode",h={"/windsurfing":"/","/windsurfing/sessions":"/projects","/windsurfing/contact":"/contact"};function O({label:u}){const n=typeof window<"u"?window.location.pathname:"/",t=n==="/windsurfing"||n.startsWith("/windsurfing/");return v.jsx("button",{type:"button",className:"lang-toggle","aria-label":t?"Disable Windsurfing Instructor mode":"Enable Windsurfing Instructor mode","aria-pressed":t,title:t?"Back to normal mode":"Activate Windsurfing Instructor mode",onClick:()=>{const a=t?h[n]??"/":"/windsurfing";window.localStorage.setItem(b,String(!t)),window.location.assign(a)},children:u??""})}export{O as default};
