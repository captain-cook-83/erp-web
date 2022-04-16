<template>
    <el-form :model="model" :rules="rules" ref="form">
        <el-form-item label="用户姓名" label-width="80px" prop="name">
            <el-input v-model="model.name" placeholder="请输入用户姓名" :validate-event="false"
                maxlength="8" auto-complete="off" :clearable="true" :autofocus="true" tabindex="1"></el-input>
        </el-form-item>
        <el-form-item label="所属部门" label-width="80px" prop="departmentName">
            <el-popover placement="right" width="400" v-model="departmentSelectorShown">
                <resource-selector resourceURL="/departments" :filters="departmentFilters" :tableColumes="departmentSelectorColumes" 
                    @selected="onDepartmentSelected"></resource-selector>
                <el-input slot="reference" v-model="model.departmentName" suffix-icon='el-icon-arrow-down' :validate-event="false" :readonly="true" 
                    placeholder="请选择所属部门"></el-input>
            </el-popover>
        </el-form-item>
        <el-form-item label="角色" label-width="80px" prop="roles">
            <el-select v-model="model.roles" multiple placeholder="请选择角色（可多选）" :style="'width: 370px;'">
                <el-option v-for="role in roleOptions" :key="role.value" :label="role.label" :value="role.value" tabindex="2"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="登录名" label-width="80px" prop="username">
            <el-input v-model="model.username" placeholder="请输入登录名" :disabled="model.id != null" 
                maxlength="16" auto-complete="off" :clearable="true" :validate-event="false" tabindex="3"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" label-width="80px" prop="password">
            <el-input v-model="model.password" placeholder="请输入登录密码" show-password :disabled="model.id != null"
                maxlength="16" auto-complete="off" :clearable="true" :validate-event="false" tabindex="4"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" label-width="80px" prop="passwordC">
            <el-input ref="passwordC" v-model="model.passwordC" placeholder="请再次输入登录密码" show-password :disabled="model.id != null"
                maxlength="16" auto-complete="off" :clearable="true" :validate-event="false" tabindex="5"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
import Vue from 'vue';
import Utils from '../../utils.js';
import ResourceSelector from '../ResourceSelector.vue';

export default {
    data () {
        return {
            model: {},
            departmentFilters: {},
            departmentSelectorColumes: [
                { prop: 'id', label: '编号', width: '60' },
                { prop: 'name', label: '部门名称', overflow: true },
                { prop: 'managerName', label: '负责人', overflow: true, width: '120' }
            ],
            roleOptions: [
                {
                    label: '管理者',
                    value: 'MANAGER'
                },
                {
                    label: '审核人员',
                    value: 'AUDITER'
                },
                {
                    label: '录入人员',
                    value: 'REPORTER'
                }
            ],
            rules: {
                name: [
                    { required: true, message: '请输入用户姓名', trigger: 'blur' },
                    { min: 2, max: 8, message: '长度限制在 2 到 8 个汉字', trigger: 'blur' }
                ],
                username: [
                    { required: true, message: '请输入登录名', trigger: 'blur' },
                    { min: 5, max: 16, message: '长度限制在 5 到 16 个字母', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 8, max: 16, message: '长度限制在 8 到 16 个字符', trigger: 'blur' }
                ],
                passwordC: [
                    { required: true, message: '请再次输入登录密码', trigger: 'blur' },
                    { min: 8, max: 16, message: '长度限制在 8 到 16 个字符', trigger: 'blur' }
                ]
            },

            departmentSelectorShown: false
        }
    },
    components: {
        'resource-selector': ResourceSelector
    },
    methods: {
        setModel: function (model) {
            if (model.id) {
                model.password = '00000000';
                model.passwordC = '00000000';
            }
            if (typeof model.roles === 'string') {
                model.roles = model.roles.split(',');
            } else {
                model.roles = [];
            }
            this.model = model;
        },
        getModel: function () {
            let model = Utils.copy(this.model);     //防止 select 组件监听 roles 类型报错
            model.roles = model.roles.join(',');
            return model;
        },
        onDepartmentSelected: function (data) {
            Vue.set(this.model, 'departmentId', data.id);
            Vue.set(this.model, 'departmentName', data.name);

            this.departmentSelectorShown = false;
        },
        validate: function (callback) {
            let model = this.model;
            if (model.password != model.passwordC) {
                callback(false, true);
                this.$refs.passwordC.select();
                this.$message({
                    showClose: true,
                    message: '两次密码输入不一致',
                    type: 'error'
                });
            } else {
                this.$refs.form.validate(callback);
            }
        },
        clearValidate: function () {
            this.$refs.form.clearValidate();
        }
    }
}
</script>