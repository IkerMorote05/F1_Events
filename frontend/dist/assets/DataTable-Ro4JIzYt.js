import{i as d,j as e}from"./index-_1vbSI1F.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=d("Pencil",[["path",{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",key:"5qss01"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=d("Power",[["path",{d:"M12 2v10",key:"mnfbl"}],["path",{d:"M18.4 6.6a9 9 0 1 1-12.77.04",key:"obofu9"}]]),o=({columns:s,rows:l,rowKey:r,emptyMessage:i})=>e.jsx("div",{className:"piloto-table-container data-table-container",children:e.jsxs("table",{className:"f1-table",children:[e.jsx("thead",{children:e.jsx("tr",{children:s.map(a=>e.jsx("th",{scope:"col",children:a.label},a.key))})}),e.jsx("tbody",{children:l.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:s.length,className:"piloto-table-empty",children:i})}):l.map((a,n)=>e.jsx("tr",{children:s.map(t=>e.jsx("td",{children:t.render?t.render(a):a[t.key]},t.key))},r(a,n)))})]})});export{o as D,p as P,h as a};
