<template>
    <el-form :model="model" :rules="rules" ref="form">
        <el-form-item label="标题" label-width="80px" prop="title">
            <el-input v-model="model.title" placeholder="请输入合同标题" :validate-event="false" 
                maxlength="64" auto-complete="off" :clearable="true" :autofocus="true" tabindex="1"></el-input>
        </el-form-item>
        <el-form-item label="编号" label-width="80px" prop="serialNumber">
            <el-input v-model="model.serialNumber" placeholder="请输入合同编号" maxlength="32" auto-complete="off" 
                :validate-event="false" :clearable="true" tabindex="2"></el-input>
        </el-form-item>
        <el-form-item label="金额" label-width="80px" prop="amount">
            <el-input-number v-model="model.amount" controls-position="right" :precision="2" :step="10000" :min="0" :max="100000000" 
                :validate-event="false" tabindex="3"></el-input-number>
            <money-hint v-model="model.amount"></money-hint>
        </el-form-item>
        <el-form-item label="签署日期" label-width="80px" prop="signDate">
            <el-date-picker v-model="model.signDate" align="right" type="date" placeholder="选择签署日期" :editable="false" :clearable="false"
                :validate-event="false" :picker-options="pickerSignDateOptions"></el-date-picker>
        </el-form-item>
        <el-form-item label="项目名称" label-width="80px" prop="projectId">
            <el-popover placement="right" width="650" v-model="projectSelectorShown">
                <resource-selector resourceURL="/projects" :tableColumes="projectSelectorColumes" 
                    :searchable="true" @selected="onProjectSelected" ref="resourceSelector"/>
                <el-input slot="reference" v-model="model.projectName" suffix-icon='el-icon-search' :validate-event="false" :clearable="true" 
                    placeholder="请选择所属项目" @keyup.enter.native="onProjectSearch" @clear="onProjectClear" @change="onProjectNameChange" @blur="onProjectBlur"/>
            </el-popover>
        </el-form-item>
        <el-form-item label="所属部门" label-width="80px" prop="departmentId">
            <el-popover placement="right" width="400" v-model="departmentSelectorShown">
                <resource-selector resourceURL="/departments" :filters="departmentFilters" :tableColumes="departmentSelectorColumes" 
                    @selected="onDepartmentSelected"></resource-selector>
                <el-input slot="reference" v-model="model.departmentName" suffix-icon='el-icon-arrow-down' :readonly="true" :validate-event="false" 
                    placeholder="请选择所属部门"></el-input>
            </el-popover>
        </el-form-item>
        <el-form-item label="记账公司" label-width="80px" prop="companyId">
            <el-popover placement="right" width="400" v-model="companySelectorShown">
                <resource-selector resourceURL="/companies" :filters="companyFilters" :tableColumes="companySelectorColumes" 
                    @selected="onCompanySelected"></resource-selector>
                <el-input slot="reference" v-model="model.companyName" suffix-icon='el-icon-arrow-down' :readonly="true" :validate-event="false" 
                    placeholder="请选择记账公司"></el-input>
            </el-popover>
        </el-form-item>
    </el-form>
</template>

<script>
import Vue from 'vue';
import ResourceSelector from '../ResourceSelector.vue';
import MoneyHint from '../MoneyHint.vue';

export default {
    data () {
        return {
            model: {},
            departmentFilters: {},
            companyFilters: {},
            rules: {
                title: [
                    { required: true, message: '请输入合同名称', trigger: 'blur' },
                    { min: 4, max: 64, message: '长度限制在 4 到 64 个汉字', trigger: 'blur' }
                ],
                serialNumber: [
                    { required: true, message: '请输入合同编号', trigger: 'blur' },
                    { min: 4, max: 32, message: '长度限制在 4 到 32 个字符', trigger: 'blur' }
                ],
                amount: [
                    { required: true, message: '请输入合同金额', trigger: 'blur' }
                ],
                signDate: [
                    { required: true, message: '请输选择签署日期', trigger: 'blur' }
                ],
                projectId: [
                    { required: true, message: '请输选择所属项目', trigger: 'blur' }
                ],
                departmentId: [
                    { required: true, message: '请输选择所属部门', trigger: 'blur' }
                ]
            },
            pickerSignDateOptions: {
                disabledDate (time) {
                    return time.getTime() > Date.now();
                }
            },
            projectSelectorColumes: [
                { prop: '_order', label: '序号', width: '60' },
                { prop: 'name', label: '项目名称', overflow: true },
                { prop: 'customerName', label: '客户名称', overflow: true, width: '180' }
            ],
            departmentSelectorColumes: [
                { prop: '_order', label: '序号', width: '60' },
                { prop: 'name', label: '部门名称', overflow: true },
                { prop: 'managerName', label: '负责人', overflow: true, width: '120' }
            ],
            companySelectorColumes: [
                { prop: '_order', label: '序号', width: '60' },
                { prop: 'name', label: '公司名称', overflow: true }
            ],

            projectSelectorShown: false,
            departmentSelectorShown: false,
            companySelectorShown: false
        }
    },
    components: {
        'resource-selector': ResourceSelector,
        'money-hint': MoneyHint
    },
    methods: {
        setModel: function (model) {
            this.model = model;
        },
        getModel: function () {
            return this.model;
        },
        validate: function (callback) {
            this.$refs.form.validate(callback);
        },
        clearValidate: function () {
            this.$refs.form.clearValidate();
        },
        onProjectSelected: function (data) {
            Vue.set(this.model, 'projectId', data.id);
            Vue.set(this.model, 'projectName', data.name);

            this.projectSelectorShown = false;
        },
        onProjectSearch: function () {
            this.$refs.resourceSelector.searchData(this.model.projectName);
        },
        onProjectClear: function () {
            this.$refs.resourceSelector.searchData(null);
        },
        onProjectNameChange: function (value) {                       // clear 操作同样会出发 change 事件
            Vue.set(this.model, 'projectId', null);
        },
        onProjectBlur: function () {                                   // 选中标题被修改后，blur 在 change 事件之后出发，用来清空标题（已被修改）显示
            if (!this.model.projectId) {
                Vue.set(this.model, 'projectName', null);
            }
        },
        onDepartmentSelected: function (data) {
            Vue.set(this.model, 'departmentId', data.id);
            Vue.set(this.model, 'departmentName', data.name);

            this.departmentSelectorShown = false;
        },
        onCompanySelected: function (data) {
            Vue.set(this.model, 'companyId', data.id);
            Vue.set(this.model, 'companyName', data.name);

            this.companySelectorShown = false;
        }
    }
}
</script>