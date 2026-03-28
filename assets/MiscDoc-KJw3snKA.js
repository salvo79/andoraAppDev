import{ek as S,o as g,b as M,en as m,el as k,em as R,a as i,eo as z,f8 as y,f7 as b,fN as X,k as D,eZ as B,g2 as E,eh as Y,c as L,w as f,n as _,f3 as I,ep as q,f4 as K,eq as H,g3 as V,h as n,g as N,eG as W,fA as j,l as G}from"./index-CDZmV9jz.js";import{s as O}from"./index-B0NcyxOA.js";import{s as J}from"./index-CmXM_PUz.js";import{s as Z}from"./index-_c9joYK9.js";import{s as Q}from"./index-BQaPP0X4.js";import{s as ee}from"./index-0I_BHHrb.js";var te=`
    .p-skeleton {
        display: block;
        overflow: hidden;
        background: dt('skeleton.background');
        border-radius: dt('skeleton.border.radius');
    }

    .p-skeleton::after {
        content: '';
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));
    }

    [dir='rtl'] .p-skeleton::after {
        animation-name: p-skeleton-animation-rtl;
    }

    .p-skeleton-circle {
        border-radius: 50%;
    }

    .p-skeleton-animation-none::after {
        animation: none;
    }

    @keyframes p-skeleton-animation {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(100%);
        }
    }

    @keyframes p-skeleton-animation-rtl {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }
`,ne={root:{position:"relative"}},se={root:function(e){var o=e.props;return["p-skeleton p-component",{"p-skeleton-circle":o.shape==="circle","p-skeleton-animation-none":o.animation==="none"}]}},ie=S.extend({name:"skeleton",style:te,classes:se,inlineStyles:ne}),re={name:"BaseSkeleton",extends:k,props:{shape:{type:String,default:"rectangle"},size:{type:String,default:null},width:{type:String,default:"100%"},height:{type:String,default:"1rem"},borderRadius:{type:String,default:null},animation:{type:String,default:"wave"}},style:ie,provide:function(){return{$pcSkeleton:this,$parentInstance:this}}};function w(t){"@babel/helpers - typeof";return w=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},w(t)}function oe(t,e,o){return(e=ae(e))in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}function ae(t){var e=le(t,"string");return w(e)=="symbol"?e:e+""}function le(t,e){if(w(t)!="object"||!t)return t;var o=t[Symbol.toPrimitive];if(o!==void 0){var a=o.call(t,e);if(w(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var A={name:"Skeleton",extends:re,inheritAttrs:!1,computed:{containerStyle:function(){return this.size?{width:this.size,height:this.size,borderRadius:this.borderRadius}:{width:this.width,height:this.height,borderRadius:this.borderRadius}},dataP:function(){return R(oe({},this.shape,this.shape))}}},ce=["data-p"];function ue(t,e,o,a,p,r){return g(),M("div",m({class:t.cx("root"),style:[t.sx("root"),r.containerStyle],"aria-hidden":"true"},t.ptmi("root"),{"data-p":r.dataP}),null,16,ce)}A.render=ue;var de=`
    .p-scrollpanel-content-container {
        overflow: hidden;
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;
        float: left;
    }

    .p-scrollpanel-content {
        height: calc(100% + calc(2 * dt('scrollpanel.bar.size')));
        width: calc(100% + calc(2 * dt('scrollpanel.bar.size')));
        padding-inline: 0 calc(2 * dt('scrollpanel.bar.size'));
        padding-block: 0 calc(2 * dt('scrollpanel.bar.size'));
        position: relative;
        overflow: auto;
        box-sizing: border-box;
        scrollbar-width: none;
    }

    .p-scrollpanel-content::-webkit-scrollbar {
        display: none;
    }

    .p-scrollpanel-bar {
        position: relative;
        border-radius: dt('scrollpanel.bar.border.radius');
        z-index: 2;
        cursor: pointer;
        opacity: 0;
        outline-color: transparent;
        background: dt('scrollpanel.bar.background');
        border: 0 none;
        transition:
            outline-color dt('scrollpanel.transition.duration'),
            opacity dt('scrollpanel.transition.duration');
    }

    .p-scrollpanel-bar:focus-visible {
        box-shadow: dt('scrollpanel.bar.focus.ring.shadow');
        outline: dt('scrollpanel.barfocus.ring.width') dt('scrollpanel.bar.focus.ring.style') dt('scrollpanel.bar.focus.ring.color');
        outline-offset: dt('scrollpanel.barfocus.ring.offset');
    }

    .p-scrollpanel-bar-y {
        width: dt('scrollpanel.bar.size');
        inset-block-start: 0;
    }

    .p-scrollpanel-bar-x {
        height: dt('scrollpanel.bar.size');
        inset-block-end: 0;
    }

    .p-scrollpanel-hidden {
        visibility: hidden;
    }

    .p-scrollpanel:hover .p-scrollpanel-bar,
    .p-scrollpanel:active .p-scrollpanel-bar {
        opacity: 1;
    }

    .p-scrollpanel-grabbed {
        user-select: none;
    }
`,pe={root:"p-scrollpanel p-component",contentContainer:"p-scrollpanel-content-container",content:"p-scrollpanel-content",barX:"p-scrollpanel-bar p-scrollpanel-bar-x",barY:"p-scrollpanel-bar p-scrollpanel-bar-y"},me=S.extend({name:"scrollpanel",style:de,classes:pe}),fe={name:"BaseScrollPanel",extends:k,props:{step:{type:Number,default:5}},style:me,provide:function(){return{$pcScrollPanel:this,$parentInstance:this}}},T={name:"ScrollPanel",extends:fe,inheritAttrs:!1,initialized:!1,documentResizeListener:null,documentMouseMoveListener:null,documentMouseUpListener:null,frame:null,scrollXRatio:null,scrollYRatio:null,isXBarClicked:!1,isYBarClicked:!1,lastPageX:null,lastPageY:null,timer:null,outsideClickListener:null,data:function(){return{orientation:"vertical",lastScrollTop:0,lastScrollLeft:0}},mounted:function(){this.$el.offsetParent&&this.initialize()},updated:function(){!this.initialized&&this.$el.offsetParent&&this.initialize()},beforeUnmount:function(){this.unbindDocumentResizeListener(),this.frame&&window.cancelAnimationFrame(this.frame)},methods:{initialize:function(){this.moveBar(),this.bindDocumentResizeListener(),this.calculateContainerHeight()},calculateContainerHeight:function(){var e=getComputedStyle(this.$el),o=getComputedStyle(this.$refs.xBar),a=X(this.$el)-parseInt(o.height,10);e["max-height"]!=="none"&&a===0&&(this.$refs.content.offsetHeight+parseInt(o.height,10)>parseInt(e["max-height"],10)?this.$el.style.height=e["max-height"]:this.$el.style.height=this.$refs.content.offsetHeight+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)+"px")},moveBar:function(){var e=this;if(this.$refs.content){var o=this.$refs.content.scrollWidth,a=this.$refs.content.clientWidth,p=(this.$el.clientHeight-this.$refs.xBar.clientHeight)*-1;this.scrollXRatio=a/o;var r=this.$refs.content.scrollHeight,s=this.$refs.content.clientHeight,v=(this.$el.clientWidth-this.$refs.yBar.clientWidth)*-1;this.scrollYRatio=s/r;var c=Math.max(this.scrollYRatio*100,10);this.frame=this.requestAnimationFrame(function(){e.$refs.xBar&&(e.scrollXRatio>=1?(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&b(e.$refs.xBar,"p-scrollpanel-hidden")):(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&y(e.$refs.xBar,"p-scrollpanel-hidden"),e.$refs.xBar.style.cssText="width:"+Math.max(e.scrollXRatio*100,10)+"%; inset-inline-start:"+Math.abs(e.$refs.content.scrollLeft)/o*100+"%;bottom:"+p+"px;")),e.$refs.yBar&&(e.scrollYRatio>=1?(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&b(e.$refs.yBar,"p-scrollpanel-hidden")):(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&y(e.$refs.yBar,"p-scrollpanel-hidden"),e.$refs.yBar.style.cssText="height:"+c+"%; top: calc("+e.$refs.content.scrollTop/(r-s)*(100-c)+"% - "+e.$refs.xBar.clientHeight+"px); inset-inline-end:"+v+"px;"))})}},onYBarMouseDown:function(e){this.isYBarClicked=!0,this.$refs.yBar.focus(),this.lastPageY=e.pageY,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&b(this.$refs.yBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&b(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onXBarMouseDown:function(e){this.isXBarClicked=!0,this.$refs.xBar.focus(),this.lastPageX=e.pageX,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&b(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&b(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onScroll:function(e){this.lastScrollLeft!==e.target.scrollLeft?(this.lastScrollLeft=e.target.scrollLeft,this.orientation="horizontal"):this.lastScrollTop!==e.target.scrollTop&&(this.lastScrollTop=e.target.scrollTop,this.orientation="vertical"),this.moveBar()},onKeyDown:function(e){if(this.orientation==="vertical")switch(e.code){case"ArrowDown":{this.setTimer("scrollTop",this.step),e.preventDefault();break}case"ArrowUp":{this.setTimer("scrollTop",this.step*-1),e.preventDefault();break}case"ArrowLeft":case"ArrowRight":{e.preventDefault();break}}else if(this.orientation==="horizontal")switch(e.code){case"ArrowRight":{this.setTimer("scrollLeft",this.step),e.preventDefault();break}case"ArrowLeft":{this.setTimer("scrollLeft",this.step*-1),e.preventDefault();break}case"ArrowDown":case"ArrowUp":{e.preventDefault();break}}},onKeyUp:function(){this.clearTimer()},repeat:function(e,o){this.$refs.content[e]+=o,this.moveBar()},setTimer:function(e,o){var a=this;this.clearTimer(),this.timer=setTimeout(function(){a.repeat(e,o)},40)},clearTimer:function(){this.timer&&clearTimeout(this.timer)},onDocumentMouseMove:function(e){this.isXBarClicked?this.onMouseMoveForXBar(e):this.isYBarClicked?this.onMouseMoveForYBar(e):(this.onMouseMoveForXBar(e),this.onMouseMoveForYBar(e))},onMouseMoveForXBar:function(e){var o=this,a=e.pageX-this.lastPageX;this.lastPageX=e.pageX,this.frame=this.requestAnimationFrame(function(){o.$refs.content.scrollLeft+=a/o.scrollXRatio})},onMouseMoveForYBar:function(e){var o=this,a=e.pageY-this.lastPageY;this.lastPageY=e.pageY,this.frame=this.requestAnimationFrame(function(){o.$refs.content.scrollTop+=a/o.scrollYRatio})},onFocus:function(e){this.$refs.xBar.isSameNode(e.target)?this.orientation="horizontal":this.$refs.yBar.isSameNode(e.target)&&(this.orientation="vertical")},onBlur:function(){this.orientation==="horizontal"&&(this.orientation="vertical")},onDocumentMouseUp:function(){this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&y(this.$refs.yBar,"p-scrollpanel-grabbed"),this.$refs.xBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&y(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&y(document.body,"p-scrollpanel-grabbed"),this.unbindDocumentMouseListeners(),this.isXBarClicked=!1,this.isYBarClicked=!1},requestAnimationFrame:function(e){var o=window.requestAnimationFrame||this.timeoutFrame;return o(e)},refresh:function(){this.moveBar()},scrollTop:function(e){var o=this.$refs.content.scrollHeight-this.$refs.content.clientHeight;e=e>o?o:e>0?e:0,this.$refs.content.scrollTop=e},timeoutFrame:function(e){setTimeout(e,0)},bindDocumentMouseListeners:function(){var e=this;this.documentMouseMoveListener||(this.documentMouseMoveListener=function(o){e.onDocumentMouseMove(o)},document.addEventListener("mousemove",this.documentMouseMoveListener)),this.documentMouseUpListener||(this.documentMouseUpListener=function(o){e.onDocumentMouseUp(o)},document.addEventListener("mouseup",this.documentMouseUpListener))},unbindDocumentMouseListeners:function(){this.documentMouseMoveListener&&(document.removeEventListener("mousemove",this.documentMouseMoveListener),this.documentMouseMoveListener=null),this.documentMouseUpListener&&(document.removeEventListener("mouseup",this.documentMouseUpListener),this.documentMouseUpListener=null)},bindDocumentResizeListener:function(){var e=this;this.documentResizeListener||(this.documentResizeListener=function(){e.moveBar()},window.addEventListener("resize",this.documentResizeListener))},unbindDocumentResizeListener:function(){this.documentResizeListener&&(window.removeEventListener("resize",this.documentResizeListener),this.documentResizeListener=null)}},computed:{contentId:function(){return this.$id+"_content"}}},he=["id"],ve=["aria-controls","aria-valuenow"],be=["aria-controls","aria-valuenow"];function ge(t,e,o,a,p,r){return g(),M("div",m({class:t.cx("root")},t.ptmi("root")),[i("div",m({class:t.cx("contentContainer")},t.ptm("contentContainer")),[i("div",m({ref:"content",id:r.contentId,class:t.cx("content"),onScroll:e[0]||(e[0]=function(){return r.onScroll&&r.onScroll.apply(r,arguments)}),onMouseenter:e[1]||(e[1]=function(){return r.moveBar&&r.moveBar.apply(r,arguments)})},t.ptm("content")),[z(t.$slots,"default")],16,he)],16),i("div",m({ref:"xBar",class:t.cx("barx"),tabindex:"0",role:"scrollbar","aria-orientation":"horizontal","aria-controls":r.contentId,"aria-valuenow":p.lastScrollLeft,onMousedown:e[2]||(e[2]=function(){return r.onXBarMouseDown&&r.onXBarMouseDown.apply(r,arguments)}),onKeydown:e[3]||(e[3]=function(s){return r.onKeyDown(s)}),onKeyup:e[4]||(e[4]=function(){return r.onKeyUp&&r.onKeyUp.apply(r,arguments)}),onFocus:e[5]||(e[5]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)}),onBlur:e[6]||(e[6]=function(){return r.onBlur&&r.onBlur.apply(r,arguments)})},t.ptm("barx"),{"data-pc-group-section":"bar"}),null,16,ve),i("div",m({ref:"yBar",class:t.cx("bary"),tabindex:"0",role:"scrollbar","aria-orientation":"vertical","aria-controls":r.contentId,"aria-valuenow":p.lastScrollTop,onMousedown:e[7]||(e[7]=function(){return r.onYBarMouseDown&&r.onYBarMouseDown.apply(r,arguments)}),onKeydown:e[8]||(e[8]=function(s){return r.onKeyDown(s)}),onKeyup:e[9]||(e[9]=function(){return r.onKeyUp&&r.onKeyUp.apply(r,arguments)}),onFocus:e[10]||(e[10]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)})},t.ptm("bary"),{"data-pc-group-section":"bar"}),null,16,be)],16)}T.render=ge;var ye=`
    .p-scrolltop.p-button {
        position: fixed !important;
        inset-block-end: 20px;
        inset-inline-end: 20px;
    }

    .p-scrolltop-sticky.p-button {
        position: sticky !important;
        display: flex;
        margin-inline-start: auto;
    }

    .p-scrolltop-enter-from {
        opacity: 0;
    }

    .p-scrolltop-enter-active {
        transition: opacity 300ms;
    }

    .p-scrolltop-leave-to {
        opacity: 0;
    }

    .p-scrolltop-leave-active {
        transition: opacity 300ms;
    }
`,we={root:function(e){var o=e.props;return["p-scrolltop",{"p-scrolltop-sticky":o.target!=="window"}]},icon:"p-scrolltop-icon"},xe=S.extend({name:"scrolltop",style:ye,classes:we}),Be={name:"BaseScrollTop",extends:k,props:{target:{type:String,default:"window"},threshold:{type:Number,default:400},icon:{type:String,default:void 0},behavior:{type:String,default:"smooth"},buttonProps:{type:Object,default:function(){return{rounded:!0}}}},style:xe,provide:function(){return{$pcScrollTop:this,$parentInstance:this}}},P={name:"ScrollTop",extends:Be,inheritAttrs:!1,scrollListener:null,container:null,data:function(){return{visible:!1}},mounted:function(){this.target==="window"?this.bindDocumentScrollListener():this.target==="parent"&&this.bindParentScrollListener()},beforeUnmount:function(){this.target==="window"?this.unbindDocumentScrollListener():this.target==="parent"&&this.unbindParentScrollListener(),this.container&&(B.clear(this.container),this.overlay=null)},methods:{onClick:function(){var e=this.target==="window"?window:this.$el.parentElement;e.scroll({top:0,behavior:this.behavior})},checkVisibility:function(e){e>this.threshold?this.visible=!0:this.visible=!1},bindParentScrollListener:function(){var e=this;this.scrollListener=function(){e.checkVisibility(e.$el.parentElement.scrollTop)},this.$el.parentElement.addEventListener("scroll",this.scrollListener)},bindDocumentScrollListener:function(){var e=this;this.scrollListener=function(){e.checkVisibility(E())},window.addEventListener("scroll",this.scrollListener)},unbindParentScrollListener:function(){this.scrollListener&&(this.$el.parentElement.removeEventListener("scroll",this.scrollListener),this.scrollListener=null)},unbindDocumentScrollListener:function(){this.scrollListener&&(window.removeEventListener("scroll",this.scrollListener),this.scrollListener=null)},onEnter:function(e){B.set("overlay",e,this.$primevue.config.zIndex.overlay)},onAfterLeave:function(e){B.clear(e)},containerRef:function(e){this.container=e?e.$el:void 0}},computed:{scrollTopAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.scrollTop:void 0}},components:{ChevronUpIcon:Z,Button:D}};function Le(t,e,o,a,p,r){var s=Y("Button");return g(),L(K,m({name:"p-scrolltop",appear:"",onEnter:r.onEnter,onAfterLeave:r.onAfterLeave},t.ptm("transition")),{default:f(function(){return[p.visible?(g(),L(s,m({key:0,ref:r.containerRef,class:t.cx("root"),onClick:r.onClick,"aria-label":r.scrollTopAriaLabel,unstyled:t.unstyled},t.buttonProps,{pt:t.ptm("root")}),{icon:f(function(v){return[z(t.$slots,"icon",{class:_(t.cx("icon"))},function(){return[(g(),L(I(t.icon?"span":"ChevronUpIcon"),m({class:[t.cx("icon"),t.icon,v.class]},t.ptm("root").icon,{"data-pc-section":"icon"}),null,16,["class"]))]})]}),_:3},16,["class","onClick","aria-label","unstyled","pt"])):q("",!0)]}),_:3},16,["onEnter","onAfterLeave"])}P.render=Le;const Se={class:"space-y-4"},Me={class:"card"},ke={class:"flex flex-col md:flex-row gap-4"},$e={class:"md:w-1/2"},ze={class:"md:w-1/2"},De={class:"flex flex-col md:flex-row gap-8"},Ae={class:"md:w-1/2 space-y-4"},Te={class:"card"},Pe={class:"flex gap-2"},Ue={class:"flex gap-6"},Ce={class:"flex gap-2"},Fe={class:"flex items-start gap-2"},Re={class:"card"},Xe={class:"card"},Ee={class:"md:w-1/2 space-y-4"},Ye={class:"card"},_e={class:"flex gap-2"},Ie={class:"flex gap-2"},qe={class:"flex gap-2"},Ke={class:"card"},He={class:"flex items-center flex-col sm:flex-row gap-2"},Ve={class:"flex items-center flex-col sm:flex-row gap-2"},Ne={class:"flex items-center flex-col sm:flex-row gap-2"},We={class:"card"},je={class:"rounded-border border border-surface p-6"},Ge={class:"flex mb-4"},Oe={class:"flex justify-between mt-4"},st={__name:"MiscDoc",setup(t){const e=N(0);let o=null;function a(){o=setInterval(()=>{let r=e.value+Math.floor(Math.random()*10)+1;r>=100&&(r=100),e.value=r},2e3)}function p(){clearInterval(o),o=null}return H(()=>{a()}),V(()=>{p()}),(r,s)=>{const v=ee,c=j,x=W,$=D,d=G,U=Q,C=P,F=T,l=J,u=O,h=A;return g(),M("div",Se,[i("div",Me,[s[0]||(s[0]=i("div",{class:"font-semibold text-xl mb-4"},"ProgressBar",-1)),i("div",ke,[i("div",$e,[n(v,{value:e.value},null,8,["value"])]),i("div",ze,[n(v,{value:50,showValue:!1})])])]),i("div",De,[i("div",Ae,[i("div",Te,[s[4]||(s[4]=i("div",{class:"font-semibold text-xl mb-4"},"Badge",-1)),i("div",Pe,[n(c,{value:2}),n(c,{value:8,severity:"success"}),n(c,{value:4,severity:"info"}),n(c,{value:12,severity:"Warn"}),n(c,{value:3,severity:"danger"})]),s[5]||(s[5]=i("div",{class:"font-semibold my-4"},"Overlay",-1)),i("div",Ue,[n(x,{value:"2"},{default:f(()=>[...s[1]||(s[1]=[i("i",{class:"pi pi-bell",style:{"font-size":"2rem"}},null,-1)])]),_:1}),n(x,{value:"4",severity:"danger"},{default:f(()=>[...s[2]||(s[2]=[i("i",{class:"pi pi-calendar",style:{"font-size":"2rem"}},null,-1)])]),_:1}),n(x,{severity:"danger"},{default:f(()=>[...s[3]||(s[3]=[i("i",{class:"pi pi-envelope",style:{"font-size":"2rem"}},null,-1)])]),_:1})]),s[6]||(s[6]=i("div",{class:"font-semibold my-4"},"Button",-1)),i("div",Ce,[n($,{label:"Emails",badge:"8",class:"mr-2"}),n($,{label:"Messages",icon:"pi pi-users",severity:"warn",badge:"8",badgeClass:"p-badge-danger"})]),s[7]||(s[7]=i("div",{class:"font-semibold my-4"},"Sizes",-1)),i("div",Fe,[n(c,{value:2}),n(c,{value:4,size:"large",severity:"warn"}),n(c,{value:6,size:"xlarge",severity:"success"})])]),i("div",Re,[s[8]||(s[8]=i("div",{class:"font-semibold text-xl mb-4"},"Avatar",-1)),s[9]||(s[9]=i("div",{class:"font-semibold mb-4"},"Group",-1)),n(U,null,{default:f(()=>[n(d,{image:"https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png",size:"large",shape:"circle"}),n(d,{image:"https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png",size:"large",shape:"circle"}),n(d,{image:"https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png",size:"large",shape:"circle"}),n(d,{image:"https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png",size:"large",shape:"circle"}),n(d,{image:"https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png",size:"large",shape:"circle"}),n(d,{label:"+2",shape:"circle",size:"large"})]),_:1}),s[10]||(s[10]=i("div",{class:"font-semibold my-4"},"Label - Circle",-1)),n(d,{label:"P",class:"mr-2",size:"xlarge",shape:"circle"}),n(d,{label:"V",class:"mr-2",size:"large",style:{"background-color":"#2196F3",color:"#ffffff"},shape:"circle"}),n(d,{label:"U",class:"mr-2",style:{"background-color":"#9c27b0",color:"#ffffff"},shape:"circle"}),s[11]||(s[11]=i("div",{class:"font-semibold my-4"},"Icon - Badge",-1)),n(x,{value:"4",severity:"danger",class:"inline-flex"},{default:f(()=>[n(d,{label:"U",size:"xlarge"})]),_:1})]),i("div",Xe,[s[13]||(s[13]=i("div",{class:"font-semibold text-xl mb-4"},"ScrollTop",-1)),n(F,{style:{width:"250px",height:"200px"}},{default:f(()=>[s[12]||(s[12]=i("p",null," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae et leo duis ut diam. Ultricies mi quis hendrerit dolor magna eget est lorem. Amet consectetur adipiscing elit ut. Nam libero justo laoreet sit amet. Pharetra massa massa ultricies mi quis hendrerit dolor magna. Est ultricies integer quis auctor elit sed vulputate. Consequat ac felis donec et. Tellus orci ac auctor augue mauris. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Tincidunt arcu non sodales neque sodales. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Sodales ut etiam sit amet nisl purus. Cursus sit amet dictum sit amet. Tristique senectus et netus et malesuada fames ac turpis egestas. Et tortor consequat id porta nibh venenatis cras sed. Diam maecenas ultricies mi eget mauris. Eget egestas purus viverra accumsan in nisl nisi. Suscipit adipiscing bibendum est ultricies integer. Mattis aliquam faucibus purus in massa tempor nec. ",-1)),n(C,{target:"parent",threshold:100,icon:"pi pi-arrow-up"})]),_:1})])]),i("div",Ee,[i("div",Ye,[s[14]||(s[14]=i("div",{class:"font-semibold text-xl mb-4"},"Tag",-1)),s[15]||(s[15]=i("div",{class:"font-semibold mb-4"},"Default",-1)),i("div",_e,[n(l,{value:"Primary"}),n(l,{severity:"success",value:"Success"}),n(l,{severity:"info",value:"Info"}),n(l,{severity:"warn",value:"Warn"}),n(l,{severity:"danger",value:"Danger"})]),s[16]||(s[16]=i("div",{class:"font-semibold my-4"},"Pills",-1)),i("div",Ie,[n(l,{value:"Primary",rounded:!0}),n(l,{severity:"success",value:"Success",rounded:!0}),n(l,{severity:"info",value:"Info",rounded:!0}),n(l,{severity:"warn",value:"Warn",rounded:!0}),n(l,{severity:"danger",value:"Danger",rounded:!0})]),s[17]||(s[17]=i("div",{class:"font-semibold my-4"},"Icons",-1)),i("div",qe,[n(l,{icon:"pi pi-user",value:"Primary"}),n(l,{icon:"pi pi-check",severity:"success",value:"Success"}),n(l,{icon:"pi pi-info-circle",severity:"info",value:"Info"}),n(l,{con:"pi pi-exclamation-triangle",severity:"warn",value:"Warn"}),n(l,{icon:"pi pi-times",severity:"danger",value:"Danger"})])]),i("div",Ke,[s[18]||(s[18]=i("div",{class:"font-semibold text-xl mb-4"},"Chip",-1)),s[19]||(s[19]=i("div",{class:"font-semibold mb-4"},"Basic",-1)),i("div",He,[n(u,{label:"Action"}),n(u,{label:"Comedy"}),n(u,{label:"Mystery"}),n(u,{label:"Thriller",removable:!0})]),s[20]||(s[20]=i("div",{class:"font-semibold my-4"},"Icon",-1)),i("div",Ve,[n(u,{label:"Apple",icon:"pi pi-apple"}),n(u,{label:"Facebook",icon:"pi pi-facebook"}),n(u,{label:"Google",icon:"pi pi-google"}),n(u,{label:"Microsoft",icon:"pi pi-microsoft",removable:!0})]),s[21]||(s[21]=i("div",{class:"font-semibold my-4"},"Image",-1)),i("div",Ne,[n(u,{label:"Amy Elsner",image:"https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"}),n(u,{label:"Asiya Javayant",image:"https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png"}),n(u,{label:"Xuxue Feng",image:"https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png",removable:""})])]),i("div",We,[s[22]||(s[22]=i("div",{class:"font-semibold text-xl mb-4"},"Skeleton",-1)),i("div",je,[i("div",Ge,[n(h,{shape:"circle",size:"4rem",class:"mr-2"}),i("div",null,[n(h,{width:"10rem",class:"mb-2"}),n(h,{width:"5rem",class:"mb-2"}),n(h,{height:".5rem"})])]),n(h,{width:"100%",height:"150px"}),i("div",Oe,[n(h,{width:"4rem",height:"2rem"}),n(h,{width:"4rem",height:"2rem"})])])])])])])}}};export{st as default};
