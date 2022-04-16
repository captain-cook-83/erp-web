<template>
    <div>
        <el-popover v-if="status" placement="left-end" trigger="hover" v-model="visible">
            <p>{{ status.msg }}</p>
            <div style="text-align: right; margin: 0">
                <el-button v-for="cmd in status.cmds" :key="cmd.key" :type="cmd.primary ? 'primary' : ''" size="mini" 
                    @click="onClicked(cmd.key)">{{ cmd.label }}</el-button>
            </div>
            <i :class="icon" slot="reference"></i>
        </el-popover>
        <el-tooltip v-else :content="tips" placement="top" effect="light">
            <i :class="icon"></i>
        </el-tooltip>
    </div>
</template>

<script>
export default {
    props: {
        model: Object,
        field: String,
        route: Object
    },
    data () {
        return {
            visible: false
        }
    },
    computed: {
        value () {
            if (typeof this.route.redirect === 'function') {
                return this.route.redirect(this.model, this.field);
            } else {
                return this.model[this.field];
            }
        },
        status () {
            let route = this.route;
            let s;
            if (typeof route.dynamic === 'function') {
                s = route.dynamic(route, this.model, this.value);
            } else {
                s = route[this.value];
            }
            return s && Array.isArray(s.cmds) ? s : null;
        },
        icon () {
            let status = this.route[this.value];
            return status ? status.icon : '';
        },
        tips () {
            let status = this.route[this.value];
            return status ? status.tips : '';
        }
    },
    methods: {
        onClicked: function (key) {
            this.visible = false;
            this.$emit(key, this.model, key);
        }
    }
}
</script>