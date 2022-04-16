<template>
    <el-form :model="model" :rules="rules" ref="form">
        <el-form-item label="部门名称" label-width="80px" prop="name">
            <el-input v-model="model.name" placeholder="请输入部门名称" 
                maxlength="32" auto-complete="off" :clearable="true" :validate-event="false" :autofocus="true" tabindex="1"></el-input>
        </el-form-item>
        <el-form-item label="负责人" label-width="80px" prop="managerName">
            <el-popover placement="right" width="400" v-model="userSelectorShown">
                <resource-selector resourceURL="/users" :filters="userFilters" :tableColumes="userSelectorColumes" 
                    @selected="onUserSelected"></resource-selector>
                <el-input slot="reference" v-model="model.managerName" suffix-icon='el-icon-arrow-down' :validate-event="false" :readonly="true" 
                    placeholder="请选择部门负责人"></el-input>
            </el-popover>
        </el-form-item>
    </el-form>
</template>

<script>
import Vue from 'vue';
import ResourceSelector from '../ResourceSelector.vue';

export default {
    data () {
        return {
            model: {},
            userFilters: {},
            userSelectorColumes: [
                { prop: 'id', label: '编号', width: '60' },
                { prop: 'name', label: '姓名', overflow: true },
                { prop: 'departmentName', label: '所属部门', overflow: true, width: '120' }
            ],
            rules: {
                name: [
                    { required: true, message: '请输入部门名称', trigger: 'blur' },
                    { min: 2, max: 16, message: '长度限制在 2 到 8 个汉字', trigger: 'blur' }
                ]
            },

            userSelectorShown: false
        }
    },
    components: {
        'resource-selector': ResourceSelector
    },
    methods: {
        setModel: function (model) {
            this.model = model;
        },
        getModel: function () {
            return this.model;
        },
        onUserSelected: function (data) {
            Vue.set(this.model, 'managerId', data.id);
            Vue.set(this.model, 'managerName', data.name);

            this.userSelectorShown = false;
        },
        validate: function (callback) {
            this.$refs.form.validate(callback);
        },
        clearValidate: function () {
            this.$refs.form.clearValidate();
        }
    }
}
</script>