<template>
<div>
    <!-- Contenedor superior (botón + selector) -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <DxButton
            @click="switchWorkingMode"
            :text="buttonText"
        />

        <DxSelectBox
            :data-source="data"
            v-model:value="dashboardIdProp"
            display-expr="name"
            value-expr="id"
            width="200px"
        />
    </div>

    <!-- Dashboard -->
    <DxDashboardControl
        style="height:900px; display:block; width:100%;"
        endpoint="/api/dashboard"
        :workingMode="workingModeProp"
        :dashboardId="dashboardIdProp"
        @beforeRender="onBeforeRender"
    />

</div>
</template>

<script>
import DxButton from 'devextreme-vue/button';
import DxSelectBox from 'devextreme-vue/select-box';
import ArrayStore from 'devextreme/data/array_store';
import { DxDashboardControl } from 'devexpress-dashboard-vue';
import { TextBoxItemEditorExtension } from 'devexpress-dashboard/designer/text-box-item-editor-extension';

export default {
    components: {
        DxDashboardControl,
        DxButton,
        DxSelectBox
    },
    data() {
        const dashboards = [];  // Se cargan desde el backend (DashboardFileStorage)
        return {
            dashboardIdProp: null,
            workingModeProp: 'Designer',
            data: new ArrayStore({
                data: dashboards,
                key: 'id'
            })
        };
    },
    methods: {
        switchWorkingMode() {
            this.workingModeProp = this.workingModeProp === 'Designer' ? 'Viewer' : 'Designer';
        },
        onBeforeRender(e) {
            e.component.registerExtension(new TextBoxItemEditorExtension(e.component));

            // Inyecta el JWT en cada petición que hace el control al backend
            const token = localStorage.getItem('token');
            if (token) {
                e.component.option('ajaxRemoteService', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        }
    },
    computed: {
        buttonText() {
            return `Switch to ${this.workingModeProp === 'Designer' ? 'Viewer' : 'Designer'}`;
        }
    }
}
</script>
