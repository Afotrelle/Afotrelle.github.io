import{r as g}from"./index.yBjzXJbu.js";var f={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function x(){if(p)return o;p=1;var u=g(),t=Symbol.for("react.element"),n=Symbol.for("react.fragment"),a=Object.prototype.hasOwnProperty,w=u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,R={key:!0,ref:!0,__self:!0,__source:!0};function c(i,e,l){var r,s={},d=null,m=null;l!==void 0&&(d=""+l),e.key!==void 0&&(d=""+e.key),e.ref!==void 0&&(m=e.ref);for(r in e)a.call(e,r)&&!R.hasOwnProperty(r)&&(s[r]=e[r]);if(i&&i.defaultProps)for(r in e=i.defaultProps,e)s[r]===void 0&&(s[r]=e[r]);return{$$typeof:t,type:i,key:d,ref:m,props:s,_owner:w.current}}return o.Fragment=n,o.jsx=c,o.jsxs=c,o}var _;function y(){return _||(_=1,f.exports=x()),f.exports}var v=y();const b="arturo-windsurf-mode",h={"/windsurfing":"/","/windsurfing/sessions":"/projects","/windsurfing/contact":"/contact"};function O({label:u}){const t=typeof window<"u"?window.location.pathname:"/",n=t==="/windsurfing"||t.startsWith("/windsurfing/");return v.jsx("button",{type:"button",className:"lang-toggle","aria-label":n?"Disable Windsurfing mode":"Enable Windsurfing mode","aria-pressed":n,title:n?"Back to normal mode":"Activate Windsurfing mode",onClick:()=>{const a=n?h[t]??"/":"/windsurfing";window.localStorage.setItem(b,String(!n)),window.location.assign(a)},children:u??""})}export{O as default};
