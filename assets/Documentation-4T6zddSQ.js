import{eg as s,o,b as i,es as e,a as t}from"./index-DsPNL3mG.js";const n={},l={class:"card"};function d(r,a){return o(),i("div",l,[...a[0]||(a[0]=[e(`<div class="font-semibold text-2xl mb-4" data-v-6fa5f6e7>Documentation</div><div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Get Started</div><p class="text-lg mb-4" data-v-6fa5f6e7> Poseidon is an application template and is based on <a href="https://github.com/vuejs/create-vue" class="font-medium text-primary hover:underline" data-v-6fa5f6e7>create-vue</a>, the recommended way to start a Vite-powered Vue projects. To get started, extract the contents of the zip file, cd to the directory and install the dependencies with npm, yarn or pnpm. </p><pre class="app-code" data-v-6fa5f6e7><code data-v-6fa5f6e7>npm install
npm run dev</code></pre><p class="text-lg mb-4" data-v-6fa5f6e7>Navigate to <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-6fa5f6e7>http://localhost:5173/</i> to view the application in your local environment.</p><div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Structure</div><p class="text-lg mb-4" data-v-6fa5f6e7>Poseidon consists of a couple folders, demos and layout have been separated so that you can easily remove what is not necessary for your application such as the demos.</p><ul class="leading-normal list-disc pl-8 text-lg mb-4" data-v-6fa5f6e7><li data-v-6fa5f6e7><span class="text-primary font-medium" data-v-6fa5f6e7>src/layout</span>: Main layout structure.</li><li data-v-6fa5f6e7><span class="text-primary font-medium" data-v-6fa5f6e7>src/views</span>: Demo pages like Dashboard.</li><li data-v-6fa5f6e7><span class="text-primary font-medium" data-v-6fa5f6e7>public/demo</span>: Publicly accessible assets used in demos</li><li data-v-6fa5f6e7><span class="text-primary font-medium" data-v-6fa5f6e7>public/layout</span>: Publicly accessible assets used in layout</li><li data-v-6fa5f6e7><span class="text-primary font-medium" data-v-6fa5f6e7>src/assets/demo</span>: Styles used in demos</li><li data-v-6fa5f6e7><span class="text-primary font-medium" data-v-6fa5f6e7>src/assets/layout</span>: Styles of the main layout</li></ul><div class="font-semibold text-xl my-4" data-v-6fa5f6e7>Layout Composable</div><p class="text-lg mb-4" data-v-6fa5f6e7> The <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-6fa5f6e7>src/layout/composables/layout.js</span> is a composable that manages the layout state changes including dark mode, PrimeVue theme, menu modes and states. Use this composable to change the initial configuration and handle changes reactively. </p><pre class="app-code" data-v-6fa5f6e7><code data-v-6fa5f6e7>&lt;script setup&gt;
import { useLayout } from &#39;@/layout/composables/layout&#39;;

const { layoutConfig } = useLayout();

layoutConfig.menuMode = &#39;slim&#39;                             // change to slim mode
layoutConfig.darkTheme = !layoutConfig.darkTheme;          // toggle color scheme
&lt;/script&gt;
</code></pre><div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Menu</div><p class="text-lg mb-4" data-v-6fa5f6e7> Main menu is defined at <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-6fa5f6e7>src/layout/AppMenu.vue</span> file. Update the <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-6fa5f6e7>model</i> property to define your own menu items. </p><pre class="app-code" data-v-6fa5f6e7><code data-v-6fa5f6e7>const model = ref([
{
    label: &#39;Dashboards&#39;,
    icon: &#39;pi pi-home&#39;,
    items: [
        {
            label: &#39;E-Commerce&#39;,
            icon: &#39;pi pi-fw pi-home&#39;,
            to: &#39;/&#39;
        },
        {
            label: &#39;Banking&#39;,
            icon: &#39;pi pi-fw pi-image&#39;,
            to: &#39;/dashboard-banking&#39;
        }
    ]
},
//...
</code></pre><div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Breadcrumb</div><p class="text-lg mb-4" data-v-6fa5f6e7> Breadcrumb component at the topbar section is dynamic and retrieves the path information from the router using the <span class="text-primary font-medium" data-v-6fa5f6e7>meta.breadcrumb</span> property. </p><pre class="app-code" data-v-6fa5f6e7><code data-v-6fa5f6e7>{
    path: &#39;/uikit/formlayout&#39;,
    name: &#39;formlayout&#39;,
    meta: {
        breadcrumb: [&#39;UI Kit&#39;, &#39;Form Layout&#39;]
    },
    component: () =&gt; import(&#39;@/views/uikit/FormLayout.vue&#39;)
},</code></pre><div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Learn More</div><p class="text-lg mb-4" data-v-6fa5f6e7>To learn more about how PrimeVue templates are implemented, visit the Sakai open source repository, Poseidon utilizes a similar structure as Sakai.</p>`,19),t("div",{class:"video-container mb-4"},[t("iframe",{class:"video",width:"560",height:"315",src:"https://www.youtube.com/embed/Ni_Yecfxv_g?si=11QMilH9sf06Xwi5",frameborder:"0",allowfullscreen:""})],-1),e('<div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Tailwind CSS</div><p class="text-lg mb-4" data-v-6fa5f6e7>The demo pages are developed using Tailwind CSS along with tailwind-primeui plugin, whereas the core application shell mainly uses custom CSS.</p><div class="font-semibold text-xl mb-4" data-v-6fa5f6e7>Variables</div><p class="text-lg mb-4" data-v-6fa5f6e7> CSS variables used in the template derive their values from the PrimeVue styled mode presets, use the files under <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-6fa5f6e7>src/assets/layout/variables</span> to customize according to your requirements. </p>',4)])])}const f=s(n,[["render",d],["__scopeId","data-v-6fa5f6e7"]]);export{f as default};
