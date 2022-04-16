<template>
    <el-form :model="model" :rules="rules" ref="form">
        <el-form-item label="项目名称" label-width="80px" prop="name">
            <el-input v-model="model.name" placeholder="请输入项目名称" :validate-event="false" 
                maxlength="32" auto-complete="off" :clearable="true" :autofocus="true" tabindex="1"></el-input>
        </el-form-item>
        <el-form-item label="客户名称" label-width="80px" prop="customerName">
            <el-select v-model="model.customerName" auto-complete="off" :clearable="true"
                filterable remote reserve-keyword
                placeholder="请输入进行搜索" 
                maxlength="32" 
                tabindex="2" 
                popper-class="popper-options"
                :remote-method="remoteSearchCustomers"
                :loading="loading" 
                @change="onSelectChanged">
                <el-option v-for="item in customers" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
        </el-form-item>
    </el-form>
</template>

<script>
import Vue from 'vue';
import Axios from 'axios';

export default {
    data () {
        return {
            model: {},
            loading: false,
            searchURL: '/customers?search=',
            searchLimit: 20,
            customers: [],
            rules: {
                name: [
                    { required: true, message: '请输入项目名称', trigger: 'blur' },
                    { min: 4, max: 32, message: '长度限制在 4 到 32 个汉字', trigger: 'blur' }
                ],
                customerName: [
                    { required: true, message: '请搜索并选择项目客户', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        setModel: function (model) {
            this.model = model;
        },
        getModel: function () {
            return this.model;
        },
        remoteSearchCustomers: function (query) {
            if (query) {
                this.loading = true;
                Axios.get(this.searchURL + query + '&limit=' + this.searchLimit).then(response => {
                    let data = response.data;
                    this.customers =  data;
                    if (data.length == this.searchLimit) {
                        this.$message({
                            showClose: true,
                            message: '查询数据仅返回最匹配的 ' + this.searchLimit + ' 条'
                        });
                    }
                }).catch(error => {
                    console.error(error);
                    this.$notify.error({
                        title: '错误',
                        message: JSON.stringify(error.response.data)
                    });
                }).then(() => {
                    this.loading = false;
                });
            } else {
                this.customers = [];
            }
        },
        validate: function (callback) {
            this.$refs.form.validate(callback);
        },
        clearValidate: function () {
            this.$refs.form.clearValidate();
        },
        onSelectChanged: function (e) {
            if (e) {
                Vue.set(this.model, 'customerId', e.id);
                Vue.set(this.model, 'customerName', e.name);
            }
        }
    }
}
</script>

<style scoped>
    .el-select {
        width: 100%;
    }
</style>
