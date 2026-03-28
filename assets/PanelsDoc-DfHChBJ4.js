import{ek as x,o as c,b as g,F as C,r as me,c as D,f3 as B,en as p,a as s,ep as b,el as $,em as j,fD as N,fL as ge,fF as he,fM as ve,fN as be,eW as z,fJ as w,eP as ye,eo as h,fg as Se,h as r,w as a,fh as M,fq as H,f4 as W,eK as V,t as k,n as X,eh as Pe,k as J,et as ze,s as we,i as xe,j as $e,f as v,g as I}from"./index-DN79DTGH.js";import{s as Le}from"./index-CcacRJ2z.js";import{s as Ee}from"./index-DDJfoYBH.js";import{s as Y}from"./index-CgDTRIn3.js";import{s as Q}from"./index-D_XIIc_e.js";import{s as _e,a as qe,b as Te}from"./index-CXBtR4d4.js";import{s as Ie,a as Me}from"./index-B3QXq-Gp.js";import{s as ke,a as Ae,b as De,c as Be}from"./index-DskVLYw3.js";import{s as je}from"./index-A_z6KUfH.js";import{s as Oe}from"./index--koHGzBJ.js";import"./index-IX3qY2hA.js";import"./index-Bu3_L-Ce.js";import"./index-DpAuhjtG.js";import"./index-MODJXfTV.js";import"./index-Cj365AWb.js";var Ke=`
    .p-splitter {
        display: flex;
        flex-wrap: nowrap;
        border: 1px solid dt('splitter.border.color');
        background: dt('splitter.background');
        border-radius: dt('border.radius.md');
        color: dt('splitter.color');
    }

    .p-splitter-vertical {
        flex-direction: column;
    }

    .p-splitter-gutter {
        flex-grow: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        background: dt('splitter.gutter.background');
    }

    .p-splitter-gutter-handle {
        border-radius: dt('splitter.handle.border.radius');
        background: dt('splitter.handle.background');
        transition:
            outline-color dt('splitter.transition.duration'),
            box-shadow dt('splitter.transition.duration');
        outline-color: transparent;
    }

    .p-splitter-gutter-handle:focus-visible {
        box-shadow: dt('splitter.handle.focus.ring.shadow');
        outline: dt('splitter.handle.focus.ring.width') dt('splitter.handle.focus.ring.style') dt('splitter.handle.focus.ring.color');
        outline-offset: dt('splitter.handle.focus.ring.offset');
    }

    .p-splitter-horizontal.p-splitter-resizing {
        cursor: col-resize;
        user-select: none;
    }

    .p-splitter-vertical.p-splitter-resizing {
        cursor: row-resize;
        user-select: none;
    }

    .p-splitter-horizontal > .p-splitter-gutter > .p-splitter-gutter-handle {
        height: dt('splitter.handle.size');
        width: 100%;
    }

    .p-splitter-vertical > .p-splitter-gutter > .p-splitter-gutter-handle {
        width: dt('splitter.handle.size');
        height: 100%;
    }

    .p-splitter-horizontal > .p-splitter-gutter {
        cursor: col-resize;
    }

    .p-splitter-vertical > .p-splitter-gutter {
        cursor: row-resize;
    }

    .p-splitterpanel {
        flex-grow: 1;
        overflow: hidden;
    }

    .p-splitterpanel-nested {
        display: flex;
    }

    .p-splitterpanel .p-splitter {
        flex-grow: 1;
        min-width: 0;
        min-height: 0;
        border: 0 none;
    }
`,Ce={root:function(t){var n=t.props;return["p-splitter p-component","p-splitter-"+n.layout]},gutter:"p-splitter-gutter",gutterHandle:"p-splitter-gutter-handle"},Ne=x.extend({name:"splitter",style:Ke,classes:Ce}),Re={name:"BaseSplitter",extends:$,props:{layout:{type:String,default:"horizontal"},gutterSize:{type:Number,default:4},stateKey:{type:String,default:null},stateStorage:{type:String,default:"session"},step:{type:Number,default:5}},style:Ne,provide:function(){return{$pcSplitter:this,$parentInstance:this}}};function y(e){"@babel/helpers - typeof";return y=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},y(e)}function R(e,t,n){return(t=Ue(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Ue(e){var t=Ge(e,"string");return y(t)=="symbol"?t:t+""}function Ge(e,t){if(y(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var l=n.call(e,t);if(y(l)!="object")return l;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function U(e){return Ve(e)||We(e)||He(e)||Fe()}function Fe(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function He(e,t){if(e){if(typeof e=="string")return A(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?A(e,t):void 0}}function We(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Ve(e){if(Array.isArray(e))return A(e)}function A(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,l=Array(t);n<t;n++)l[n]=e[n];return l}var Z={name:"Splitter",extends:Re,inheritAttrs:!1,emits:["resizestart","resizeend","resize"],dragging:!1,mouseMoveListener:null,mouseUpListener:null,touchMoveListener:null,touchEndListener:null,size:null,gutterElement:null,startPos:null,prevPanelElement:null,nextPanelElement:null,nextPanelSize:null,prevPanelSize:null,panelSizes:null,prevPanelIndex:null,timer:null,data:function(){return{prevSize:null}},mounted:function(){this.initializePanels()},beforeUnmount:function(){this.clear(),this.unbindMouseListeners()},methods:{isSplitterPanel:function(t){return t.type.name==="SplitterPanel"},initializePanels:function(){var t=this;if(this.panels&&this.panels.length){var n=!1;if(this.isStateful()&&(n=this.restoreState()),!n){var l=U(this.$el.children).filter(function(o){return o.getAttribute("data-pc-name")==="splitterpanel"}),u=[];this.panels.map(function(o,i){var d=o.props&&ye(o.props.size)?o.props.size:null,f=d??100/t.panels.length;u[i]=f,l[i].style.flexBasis="calc("+f+"% - "+(t.panels.length-1)*t.gutterSize+"px)"}),this.panelSizes=u,this.prevSize=parseFloat(u[0]).toFixed(4)}}},onResizeStart:function(t,n,l){this.gutterElement=t.currentTarget||t.target.parentElement,this.size=this.horizontal?ve(this.$el):be(this.$el),l||(this.dragging=!0,this.startPos=this.layout==="horizontal"?t.pageX||t.changedTouches[0].pageX:t.pageY||t.changedTouches[0].pageY),this.prevPanelElement=this.gutterElement.previousElementSibling,this.nextPanelElement=this.gutterElement.nextElementSibling,l?(this.prevPanelSize=this.horizontal?z(this.prevPanelElement,!0):w(this.prevPanelElement,!0),this.nextPanelSize=this.horizontal?z(this.nextPanelElement,!0):w(this.nextPanelElement,!0)):(this.prevPanelSize=100*(this.horizontal?z(this.prevPanelElement,!0):w(this.prevPanelElement,!0))/this.size,this.nextPanelSize=100*(this.horizontal?z(this.nextPanelElement,!0):w(this.nextPanelElement,!0))/this.size),this.prevPanelIndex=n,this.$emit("resizestart",{originalEvent:t,sizes:this.panelSizes}),this.$refs.gutter[n].setAttribute("data-p-gutter-resizing",!0),this.$el.setAttribute("data-p-resizing",!0)},onResize:function(t,n,l){var u,o,i;l?this.horizontal?(o=100*(this.prevPanelSize+n)/this.size,i=100*(this.nextPanelSize-n)/this.size):(o=100*(this.prevPanelSize-n)/this.size,i=100*(this.nextPanelSize+n)/this.size):(this.horizontal?he(this.$el)?u=(this.startPos-t.pageX)*100/this.size:u=(t.pageX-this.startPos)*100/this.size:u=(t.pageY-this.startPos)*100/this.size,o=this.prevPanelSize+u,i=this.nextPanelSize-u),this.validateResize(o,i)||(o=Math.min(Math.max(this.prevPanelMinSize,o),100-this.nextPanelMinSize),i=Math.min(Math.max(this.nextPanelMinSize,i),100-this.prevPanelMinSize)),this.prevPanelElement.style.flexBasis="calc("+o+"% - "+(this.panels.length-1)*this.gutterSize+"px)",this.nextPanelElement.style.flexBasis="calc("+i+"% - "+(this.panels.length-1)*this.gutterSize+"px)",this.panelSizes[this.prevPanelIndex]=o,this.panelSizes[this.prevPanelIndex+1]=i,this.prevSize=parseFloat(o).toFixed(4),this.$emit("resize",{originalEvent:t,sizes:this.panelSizes})},onResizeEnd:function(t){this.isStateful()&&this.saveState(),this.$emit("resizeend",{originalEvent:t,sizes:this.panelSizes}),this.$refs.gutter.forEach(function(n){return n.setAttribute("data-p-gutter-resizing",!1)}),this.$el.setAttribute("data-p-resizing",!1),this.clear()},repeat:function(t,n,l){this.onResizeStart(t,n,!0),this.onResize(t,l,!0)},setTimer:function(t,n,l){var u=this;this.timer||(this.timer=setInterval(function(){u.repeat(t,n,l)},40))},clearTimer:function(){this.timer&&(clearInterval(this.timer),this.timer=null)},onGutterKeyUp:function(){this.clearTimer(),this.onResizeEnd()},onGutterKeyDown:function(t,n){switch(t.code){case"ArrowLeft":{this.layout==="horizontal"&&this.setTimer(t,n,this.step*-1),t.preventDefault();break}case"ArrowRight":{this.layout==="horizontal"&&this.setTimer(t,n,this.step),t.preventDefault();break}case"ArrowDown":{this.layout==="vertical"&&this.setTimer(t,n,this.step*-1),t.preventDefault();break}case"ArrowUp":{this.layout==="vertical"&&this.setTimer(t,n,this.step),t.preventDefault();break}}},onGutterMouseDown:function(t,n){this.onResizeStart(t,n),this.bindMouseListeners()},onGutterTouchStart:function(t,n){this.onResizeStart(t,n),this.bindTouchListeners(),t.preventDefault()},onGutterTouchMove:function(t){this.onResize(t),t.preventDefault()},onGutterTouchEnd:function(t){this.onResizeEnd(t),this.unbindTouchListeners(),t.preventDefault()},bindMouseListeners:function(){var t=this;this.mouseMoveListener||(this.mouseMoveListener=function(n){return t.onResize(n)},document.addEventListener("mousemove",this.mouseMoveListener)),this.mouseUpListener||(this.mouseUpListener=function(n){t.onResizeEnd(n),t.unbindMouseListeners()},document.addEventListener("mouseup",this.mouseUpListener))},bindTouchListeners:function(){var t=this;this.touchMoveListener||(this.touchMoveListener=function(n){return t.onResize(n.changedTouches[0])},document.addEventListener("touchmove",this.touchMoveListener)),this.touchEndListener||(this.touchEndListener=function(n){t.resizeEnd(n),t.unbindTouchListeners()},document.addEventListener("touchend",this.touchEndListener))},validateResize:function(t,n){return!(t>100||t<0||n>100||n<0||this.prevPanelMinSize>t||this.nextPanelMinSize>n)},unbindMouseListeners:function(){this.mouseMoveListener&&(document.removeEventListener("mousemove",this.mouseMoveListener),this.mouseMoveListener=null),this.mouseUpListener&&(document.removeEventListener("mouseup",this.mouseUpListener),this.mouseUpListener=null)},unbindTouchListeners:function(){this.touchMoveListener&&(document.removeEventListener("touchmove",this.touchMoveListener),this.touchMoveListener=null),this.touchEndListener&&(document.removeEventListener("touchend",this.touchEndListener),this.touchEndListener=null)},clear:function(){this.dragging=!1,this.size=null,this.startPos=null,this.prevPanelElement=null,this.nextPanelElement=null,this.prevPanelSize=null,this.nextPanelSize=null,this.gutterElement=null,this.prevPanelIndex=null},isStateful:function(){return this.stateKey!=null},getStorage:function(){switch(this.stateStorage){case"local":return window.localStorage;case"session":return window.sessionStorage;default:throw new Error(this.stateStorage+' is not a valid value for the state storage, supported values are "local" and "session".')}},saveState:function(){ge(this.panelSizes)&&this.getStorage().setItem(this.stateKey,JSON.stringify(this.panelSizes))},restoreState:function(){var t=this,n=this.getStorage(),l=n.getItem(this.stateKey);if(l){this.panelSizes=JSON.parse(l);var u=U(this.$el.children).filter(function(o){return o.getAttribute("data-pc-name")==="splitterpanel"});return u.forEach(function(o,i){o.style.flexBasis="calc("+t.panelSizes[i]+"% - "+(t.panels.length-1)*t.gutterSize+"px)"}),!0}return!1},resetState:function(){this.initializePanels()}},computed:{panels:function(){var t=this,n=[];return this.$slots.default().forEach(function(l){t.isSplitterPanel(l)?n.push(l):l.children instanceof Array&&l.children.forEach(function(u){t.isSplitterPanel(u)&&n.push(u)})}),n},gutterStyle:function(){return this.horizontal?{width:this.gutterSize+"px"}:{height:this.gutterSize+"px"}},horizontal:function(){return this.layout==="horizontal"},getPTOptions:function(){var t;return{context:{nested:(t=this.$parentInstance)===null||t===void 0?void 0:t.nestedState}}},prevPanelMinSize:function(){var t=N(this.panels[this.prevPanelIndex],"minSize");return this.panels[this.prevPanelIndex].props&&t?t:0},nextPanelMinSize:function(){var t=N(this.panels[this.prevPanelIndex+1],"minSize");return this.panels[this.prevPanelIndex+1].props&&t?t:0},dataP:function(){var t;return j(R(R({},this.layout,this.layout),"nested",((t=this.$parentInstance)===null||t===void 0?void 0:t.nestedState)!=null))}}},Xe=["data-p"],Je=["onMousedown","onTouchstart","onTouchmove","onTouchend","data-p"],Ye=["aria-orientation","aria-valuenow","onKeydown","data-p"];function Qe(e,t,n,l,u,o){return c(),g("div",p({class:e.cx("root"),"data-p-resizing":!1,"data-p":o.dataP},e.ptmi("root",o.getPTOptions)),[(c(!0),g(C,null,me(o.panels,function(i,d){return c(),g(C,{key:d},[(c(),D(B(i),{tabindex:"-1"})),d!==o.panels.length-1?(c(),g("div",p({key:0,ref_for:!0,ref:"gutter",class:e.cx("gutter"),role:"separator",tabindex:"-1",onMousedown:function(m){return o.onGutterMouseDown(m,d)},onTouchstart:function(m){return o.onGutterTouchStart(m,d)},onTouchmove:function(m){return o.onGutterTouchMove(m,d)},onTouchend:function(m){return o.onGutterTouchEnd(m,d)},"data-p-gutter-resizing":!1,"data-p":o.dataP},{ref_for:!0},e.ptm("gutter")),[s("div",p({class:e.cx("gutterHandle"),tabindex:"0",style:[o.gutterStyle],"aria-orientation":e.layout,"aria-valuenow":u.prevSize,onKeyup:t[0]||(t[0]=function(){return o.onGutterKeyUp&&o.onGutterKeyUp.apply(o,arguments)}),onKeydown:function(m){return o.onGutterKeyDown(m,d)},"data-p":o.dataP},{ref_for:!0},e.ptm("gutterHandle")),null,16,Ye)],16,Je)):b("",!0)],64)}),128))],16,Xe)}Z.render=Qe;var Ze={root:function(t){var n=t.instance;return["p-splitterpanel",{"p-splitterpanel-nested":n.isNested}]}},et=x.extend({name:"splitterpanel",classes:Ze}),tt={name:"BaseSplitterPanel",extends:$,props:{size:{type:Number,default:null},minSize:{type:Number,default:null}},style:et,provide:function(){return{$pcSplitterPanel:this,$parentInstance:this}}},ee={name:"SplitterPanel",extends:tt,inheritAttrs:!1,data:function(){return{nestedState:null}},computed:{isNested:function(){var t=this;return this.$slots.default().some(function(n){return t.nestedState=n.type.name==="Splitter"?!0:null,t.nestedState})},getPTOptions:function(){return{context:{nested:this.isNested}}}}};function nt(e,t,n,l,u,o){return c(),g("div",p({ref:"container",class:e.cx("root")},e.ptmi("root",o.getPTOptions)),[h(e.$slots,"default")],16)}ee.render=nt;var it=`
    .p-fieldset {
        background: dt('fieldset.background');
        border: 1px solid dt('fieldset.border.color');
        border-radius: dt('fieldset.border.radius');
        color: dt('fieldset.color');
        padding: dt('fieldset.padding');
        margin: 0;
    }

    .p-fieldset-legend {
        background: dt('fieldset.legend.background');
        border-radius: dt('fieldset.legend.border.radius');
        border-width: dt('fieldset.legend.border.width');
        border-style: solid;
        border-color: dt('fieldset.legend.border.color');
        color: dt('fieldset.legend.color');
        padding: dt('fieldset.legend.padding');
        transition:
            background dt('fieldset.transition.duration'),
            color dt('fieldset.transition.duration'),
            outline-color dt('fieldset.transition.duration'),
            box-shadow dt('fieldset.transition.duration');
    }

    .p-fieldset-toggleable > .p-fieldset-legend {
        padding: 0;
    }

    .p-fieldset-toggle-button {
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        text-decoration: none;
        display: flex;
        gap: dt('fieldset.legend.gap');
        align-items: center;
        justify-content: center;
        padding: dt('fieldset.legend.padding');
        background: transparent;
        border: 0 none;
        border-radius: dt('fieldset.legend.border.radius');
        transition:
            background dt('fieldset.transition.duration'),
            color dt('fieldset.transition.duration'),
            outline-color dt('fieldset.transition.duration'),
            box-shadow dt('fieldset.transition.duration');
        outline-color: transparent;
    }

    .p-fieldset-legend-label {
        font-weight: dt('fieldset.legend.font.weight');
    }

    .p-fieldset-toggle-button:focus-visible {
        box-shadow: dt('fieldset.legend.focus.ring.shadow');
        outline: dt('fieldset.legend.focus.ring.width') dt('fieldset.legend.focus.ring.style') dt('fieldset.legend.focus.ring.color');
        outline-offset: dt('fieldset.legend.focus.ring.offset');
    }

    .p-fieldset-toggleable > .p-fieldset-legend:hover {
        color: dt('fieldset.legend.hover.color');
        background: dt('fieldset.legend.hover.background');
    }

    .p-fieldset-toggle-icon {
        color: dt('fieldset.toggle.icon.color');
        transition: color dt('fieldset.transition.duration');
    }

    .p-fieldset-toggleable > .p-fieldset-legend:hover .p-fieldset-toggle-icon {
        color: dt('fieldset.toggle.icon.hover.color');
    }

    .p-fieldset-content-container {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-fieldset-content-wrapper {
        min-height: 0;
    }

    .p-fieldset-content {
        padding: dt('fieldset.content.padding');
    }
`,ot={root:function(t){var n=t.props;return["p-fieldset p-component",{"p-fieldset-toggleable":n.toggleable}]},legend:"p-fieldset-legend",legendLabel:"p-fieldset-legend-label",toggleButton:"p-fieldset-toggle-button",toggleIcon:"p-fieldset-toggle-icon",contentContainer:"p-fieldset-content-container",contentWrapper:"p-fieldset-content-wrapper",content:"p-fieldset-content"},st=x.extend({name:"fieldset",style:it,classes:ot}),rt={name:"BaseFieldset",extends:$,props:{legend:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:null,default:null}},style:st,provide:function(){return{$pcFieldset:this,$parentInstance:this}}},te={name:"Fieldset",extends:rt,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{d_collapsed:this.collapsed}},watch:{collapsed:function(t){this.d_collapsed=t}},methods:{toggle:function(t){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:t,value:this.d_collapsed})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&(this.toggle(t),t.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.legend},dataP:function(){return j({toggleable:this.toggleable})}},directives:{ripple:V},components:{PlusIcon:Q,MinusIcon:Y}};function S(e){"@babel/helpers - typeof";return S=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},S(e)}function G(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);t&&(l=l.filter(function(u){return Object.getOwnPropertyDescriptor(e,u).enumerable})),n.push.apply(n,l)}return n}function F(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?G(Object(n),!0).forEach(function(l){lt(e,l,n[l])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):G(Object(n)).forEach(function(l){Object.defineProperty(e,l,Object.getOwnPropertyDescriptor(n,l))})}return e}function lt(e,t,n){return(t=at(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function at(e){var t=ut(e,"string");return S(t)=="symbol"?t:t+""}function ut(e,t){if(S(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var l=n.call(e,t);if(S(l)!="object")return l;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var dt=["data-p"],pt=["data-p"],ct=["id"],ft=["id","aria-controls","aria-expanded","aria-label"],mt=["id","aria-labelledby"];function gt(e,t,n,l,u,o){var i=Se("ripple");return c(),g("fieldset",p({class:e.cx("root"),"data-p":o.dataP},e.ptmi("root")),[s("legend",p({class:e.cx("legend"),"data-p":o.dataP},e.ptm("legend")),[h(e.$slots,"legend",{toggleCallback:o.toggle},function(){return[e.toggleable?b("",!0):(c(),g("span",p({key:0,id:e.$id+"_header",class:e.cx("legendLabel")},e.ptm("legendLabel")),k(e.legend),17,ct)),e.toggleable?M((c(),g("button",p({key:1,id:e.$id+"_header",type:"button","aria-controls":e.$id+"_content","aria-expanded":!u.d_collapsed,"aria-label":o.buttonAriaLabel,class:e.cx("toggleButton"),onClick:t[0]||(t[0]=function(){return o.toggle&&o.toggle.apply(o,arguments)}),onKeydown:t[1]||(t[1]=function(){return o.onKeyDown&&o.onKeyDown.apply(o,arguments)})},F(F({},e.toggleButtonProps),e.ptm("toggleButton"))),[h(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:u.d_collapsed,class:X(e.cx("toggleIcon"))},function(){return[(c(),D(B(u.d_collapsed?"PlusIcon":"MinusIcon"),p({class:e.cx("toggleIcon")},e.ptm("toggleIcon")),null,16,["class"]))]}),s("span",p({class:e.cx("legendLabel")},e.ptm("legendLabel")),k(e.legend),17)],16,ft)),[[i]]):b("",!0)]})],16,pt),r(W,p({name:"p-collapsible"},e.ptm("transition")),{default:a(function(){return[M(s("div",p({id:e.$id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":e.$id+"_header"},e.ptm("contentContainer")),[s("div",p({class:e.cx("contentWrapper")},e.ptm("contentWrapper")),[s("div",p({class:e.cx("content")},e.ptm("content")),[h(e.$slots,"default")],16)],16)],16,mt),[[H,!u.d_collapsed]])]}),_:3},16)],16,dt)}te.render=gt;var ht=`
    .p-panel {
        display: block;
        border: 1px solid dt('panel.border.color');
        border-radius: dt('panel.border.radius');
        background: dt('panel.background');
        color: dt('panel.color');
    }

    .p-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('panel.header.padding');
        background: dt('panel.header.background');
        color: dt('panel.header.color');
        border-style: solid;
        border-width: dt('panel.header.border.width');
        border-color: dt('panel.header.border.color');
        border-radius: dt('panel.header.border.radius');
    }

    .p-panel-toggleable .p-panel-header {
        padding: dt('panel.toggleable.header.padding');
    }

    .p-panel-title {
        line-height: 1;
        font-weight: dt('panel.title.font.weight');
    }

    .p-panel-content-container {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-panel-content-wrapper {
        min-height: 0;
    }

    .p-panel-content {
        padding: dt('panel.content.padding');
    }

    .p-panel-footer {
        padding: dt('panel.footer.padding');
    }
`,vt={root:function(t){var n=t.props;return["p-panel p-component",{"p-panel-toggleable":n.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",contentWrapper:"p-panel-content-wrapper",content:"p-panel-content",footer:"p-panel-footer"},bt=x.extend({name:"panel",style:ht,classes:vt}),yt={name:"BasePanel",extends:$,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:bt,provide:function(){return{$pcPanel:this,$parentInstance:this}}},ne={name:"Panel",extends:yt,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{d_collapsed:this.collapsed}},watch:{collapsed:function(t){this.d_collapsed=t}},methods:{toggle:function(t){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:t,value:this.d_collapsed})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&(this.toggle(t),t.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header},dataP:function(){return j({toggleable:this.toggleable})}},components:{PlusIcon:Q,MinusIcon:Y,Button:J},directives:{ripple:V}},St=["data-p"],Pt=["data-p"],zt=["id"],wt=["id","aria-labelledby"];function xt(e,t,n,l,u,o){var i=Pe("Button");return c(),g("div",p({class:e.cx("root"),"data-p":o.dataP},e.ptmi("root")),[s("div",p({class:e.cx("header"),"data-p":o.dataP},e.ptm("header")),[h(e.$slots,"header",{id:e.$id+"_header",class:X(e.cx("title")),collapsed:u.d_collapsed},function(){return[e.header?(c(),g("span",p({key:0,id:e.$id+"_header",class:e.cx("title")},e.ptm("title")),k(e.header),17,zt)):b("",!0)]}),s("div",p({class:e.cx("headerActions")},e.ptm("headerActions")),[h(e.$slots,"icons"),e.toggleable?h(e.$slots,"togglebutton",{key:0,collapsed:u.d_collapsed,toggleCallback:function(f){return o.toggle(f)},keydownCallback:function(f){return o.onKeyDown(f)}},function(){return[r(i,p({id:e.$id+"_header",class:e.cx("pcToggleButton"),"aria-label":o.buttonAriaLabel,"aria-controls":e.$id+"_content","aria-expanded":!u.d_collapsed,unstyled:e.unstyled,onClick:t[0]||(t[0]=function(d){return o.toggle(d)}),onKeydown:t[1]||(t[1]=function(d){return o.onKeyDown(d)})},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:a(function(d){return[h(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:u.d_collapsed},function(){return[(c(),D(B(u.d_collapsed?"PlusIcon":"MinusIcon"),p({class:d.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","pt"])]}):b("",!0)],16)],16,Pt),r(W,p({name:"p-collapsible"},e.ptm("transition")),{default:a(function(){return[M(s("div",p({id:e.$id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":e.$id+"_header"},e.ptm("contentContainer")),[s("div",p({class:e.cx("contentWrapper")},e.ptm("contentWrapper")),[s("div",p({class:e.cx("content")},e.ptm("content")),[h(e.$slots,"default")],16),e.$slots.footer?(c(),g("div",p({key:0,class:e.cx("footer")},e.ptm("footer")),[h(e.$slots,"footer")],16)):b("",!0)],16)],16,wt),[[H,!u.d_collapsed]])]}),_:3},16)],16,St)}ne.render=xt;const $t={class:"flex flex-col space-y-4"},Lt={class:"card"},Et={class:"flex flex-col md:flex-row gap-8"},_t={class:"md:w-1/2 space-y-4"},qt={class:"card"},Tt={class:"card"},It={class:"md:w-1/2 mt-6 md:mt-0 space-y-4"},Mt={class:"card"},kt={class:"card"},At={class:"flex items-center justify-between mb-0"},Dt={class:"card mt-8"},Bt={class:"flex flex-col md:flex-row"},jt={class:"w-full md:w-5/12 flex flex-col items-center justify-center gap-3 py-5"},Ot={class:"flex flex-col gap-2"},Kt={class:"flex flex-col gap-2"},Ct={class:"flex"},Nt={class:"w-full md:w-2/12"},Rt={class:"w-full md:w-5/12 flex items-center justify-center py-5"},Ut={class:"card"},rn={__name:"PanelsDoc",setup(e){const t=I([{label:"Save",icon:"pi pi-check"},{label:"Update",icon:"pi pi-upload"},{label:"Delete",icon:"pi pi-trash"},{label:"Home Page",icon:"pi pi-home"}]),n=I([{label:"Save",icon:"pi pi-fw pi-check"},{label:"Update",icon:"pi pi-fw pi-refresh"},{label:"Delete",icon:"pi pi-fw pi-trash"}]),l=I(null);function u(){l.value.toggle(event)}return(o,i)=>{const d=J,f=xe,m=$e,ie=we,oe=Oe,se=je,L=De,E=Be,_=Ae,re=ke,q=Te,le=qe,T=Me,ae=Ie,ue=_e,de=ne,pe=te,ce=Ee,fe=Le,O=ze,P=ee,K=Z;return c(),g("div",$t,[s("div",Lt,[i[1]||(i[1]=s("div",{class:"font-semibold text-xl mb-4"},"Toolbar",-1)),r(se,null,{start:a(()=>[r(d,{icon:"pi pi-plus",class:"mr-2",severity:"secondary",text:""}),r(d,{icon:"pi pi-print",class:"mr-2",severity:"secondary",text:""}),r(d,{icon:"pi pi-upload",severity:"secondary",text:""})]),center:a(()=>[r(ie,null,{default:a(()=>[r(f,null,{default:a(()=>[...i[0]||(i[0]=[s("i",{class:"pi pi-search"},null,-1)])]),_:1}),r(m,{placeholder:"Search"})]),_:1})]),end:a(()=>[r(oe,{label:"Save",model:t.value},null,8,["model"])]),_:1})]),s("div",Et,[s("div",_t,[s("div",qt,[i[8]||(i[8]=s("div",{class:"font-semibold text-xl mb-4"},"Accordion",-1)),r(re,{value:"0"},{default:a(()=>[r(_,{value:"0"},{default:a(()=>[r(L,null,{default:a(()=>[...i[2]||(i[2]=[v("Header I",-1)])]),_:1}),r(E,null,{default:a(()=>[...i[3]||(i[3]=[s("p",{class:"m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1)])]),_:1})]),_:1}),r(_,{value:"1"},{default:a(()=>[r(L,null,{default:a(()=>[...i[4]||(i[4]=[v("Header II",-1)])]),_:1}),r(E,null,{default:a(()=>[...i[5]||(i[5]=[s("p",{class:"m-0"}," Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi. ",-1)])]),_:1})]),_:1}),r(_,{value:"2"},{default:a(()=>[r(L,null,{default:a(()=>[...i[6]||(i[6]=[v("Header III",-1)])]),_:1}),r(E,null,{default:a(()=>[...i[7]||(i[7]=[s("p",{class:"m-0"}," At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus. ",-1)])]),_:1})]),_:1})]),_:1})]),s("div",Tt,[i[15]||(i[15]=s("div",{class:"font-semibold text-xl mb-4"},"Tabs",-1)),r(ue,{value:"0"},{default:a(()=>[r(le,null,{default:a(()=>[r(q,{value:"0"},{default:a(()=>[...i[9]||(i[9]=[v("Header I",-1)])]),_:1}),r(q,{value:"1"},{default:a(()=>[...i[10]||(i[10]=[v("Header II",-1)])]),_:1}),r(q,{value:"2"},{default:a(()=>[...i[11]||(i[11]=[v("Header III",-1)])]),_:1})]),_:1}),r(ae,null,{default:a(()=>[r(T,{value:"0"},{default:a(()=>[...i[12]||(i[12]=[s("p",{class:"m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1)])]),_:1}),r(T,{value:"1"},{default:a(()=>[...i[13]||(i[13]=[s("p",{class:"m-0"}," Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi. ",-1)])]),_:1}),r(T,{value:"2"},{default:a(()=>[...i[14]||(i[14]=[s("p",{class:"m-0"}," At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus. ",-1)])]),_:1})]),_:1})]),_:1})])]),s("div",It,[s("div",Mt,[i[17]||(i[17]=s("div",{class:"font-semibold text-xl mb-4"},"Panel",-1)),r(de,{header:"Header",toggleable:!0},{default:a(()=>[...i[16]||(i[16]=[s("p",{class:"leading-normal m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1)])]),_:1})]),s("div",kt,[i[19]||(i[19]=s("div",{class:"font-semibold text-xl mb-4"},"Fieldset",-1)),r(pe,{legend:"Legend",toggleable:!0},{default:a(()=>[...i[18]||(i[18]=[s("p",{class:"leading-normal m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1)])]),_:1})]),r(fe,null,{title:a(()=>[s("div",At,[i[20]||(i[20]=s("div",{class:"font-semibold text-xl mb-4"},"Card",-1)),r(d,{icon:"pi pi-plus",text:"",onClick:u})]),r(ce,{id:"config_menu",ref_key:"menuRef",ref:l,model:n.value,popup:!0},null,8,["model"])]),content:a(()=>[...i[21]||(i[21]=[s("p",{class:"leading-normal m-0"}," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",-1)])]),_:1})])]),s("div",Dt,[i[26]||(i[26]=s("div",{class:"font-semibold text-xl mb-4"},"Divider",-1)),s("div",Bt,[s("div",jt,[s("div",Ot,[i[22]||(i[22]=s("label",{for:"username"},"Username",-1)),r(m,{id:"username",type:"text"})]),s("div",Kt,[i[23]||(i[23]=s("label",{for:"password"},"Password",-1)),r(m,{id:"password",type:"password"})]),s("div",Ct,[r(d,{label:"Login",icon:"pi pi-user",class:"w-full max-w-[17.35rem] mx-auto"})])]),s("div",Nt,[r(O,{layout:"vertical",class:"hidden! md:flex!"},{default:a(()=>[...i[24]||(i[24]=[s("b",null,"OR",-1)])]),_:1}),r(O,{layout:"horizontal",class:"flex! md:hidden!",align:"center"},{default:a(()=>[...i[25]||(i[25]=[s("b",null,"OR",-1)])]),_:1})]),s("div",Rt,[r(d,{label:"Sign Up",icon:"pi pi-user-plus",severity:"success",class:"w-full max-w-[17.35rem] mx-auto"})])])]),s("div",Ut,[i[30]||(i[30]=s("div",{class:"font-semibold text-xl mb-4"},"Splitter",-1)),r(K,{style:{height:"300px"},class:"mb-8"},{default:a(()=>[r(P,{size:30,minSize:10},{default:a(()=>[...i[27]||(i[27]=[s("div",{className:"h-full flex items-center justify-center"},"Panel 1",-1)])]),_:1}),r(P,{size:70},{default:a(()=>[r(K,{layout:"vertical"},{default:a(()=>[r(P,{size:15},{default:a(()=>[...i[28]||(i[28]=[s("div",{className:"h-full flex items-center justify-center"},"Panel 2",-1)])]),_:1}),r(P,{size:50},{default:a(()=>[...i[29]||(i[29]=[s("div",{className:"h-full flex items-center justify-center"},"Panel 3",-1)])]),_:1})]),_:1})]),_:1})]),_:1})])])}}};export{rn as default};
