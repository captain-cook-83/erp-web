<template>
    <transition name="el-fade-in-linear">
        <div class="btn-container" v-if="cmds.length > 0">
            <el-tooltip v-for="cmd in cmds" :key="cmd.key" :content="cmd ? cmd.label : ''" placement="top" effect="light">
                <el-button :type="cmd.type" :icon="cmd.icon" :disabled="(model.length > 1 && !cmd.multi) || loading" @click="onClicked(cmd.key, cmd.multi)"/>
            </el-tooltip>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        model: Array,
        field: String,
        route: Object,
        loading: Boolean
    },
    data () {
        return {}
    },
    computed: {
        cmds () {
            let route = this.route;
            let model = this.model;
            if (typeof route.bannerDynamic === 'function') {
                return route.bannerDynamic(route, model, this.field);
            } else {
                return [];
            }
        }
    },
    methods: {
        onClicked: function (key, multi) {
            this.$emit(key, multi ? this.model : this.model[0]);
        }
    }
}
</script>

<style scoped>
    .btn-container {
        display: inline-block;
    }
</style>