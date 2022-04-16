<template>
    <el-tabs tab-position="left">
        <el-tab-pane :lazy="true" label="修改密码">
            <el-form :model="model" :rules="rules" ref="form">
                <el-form-item label="原始密码" label-width="100px" prop="originPassword">
                    <el-input v-model="model.originPassword" placeholder="请输入原始密码" show-password :disabled="model.id != null"
                        maxlength="16" :autofocus="true" auto-complete="off" :clearable="true" :validate-event="false" tabindex="1"></el-input>
                </el-form-item>
                <el-form-item label="新密码" label-width="100px" prop="newPassword">
                    <el-input v-model="model.newPassword" placeholder="请输入新的登录密码" show-password :disabled="model.id != null"
                        maxlength="16" auto-complete="off" :clearable="true" :validate-event="false" tabindex="2"></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" label-width="100px" prop="comfirmedPassword">
                    <el-input ref="comfirmedPassword" v-model="model.comfirmedPassword" placeholder="请再次输入登录新密码" show-password :disabled="model.id != null"
                        maxlength="16" auto-complete="off" :clearable="true" :validate-event="false" tabindex="3"></el-input>
                </el-form-item>
            </el-form>
            <div class="btn-row">
                <el-button @click="onResetClicked" :disabled="loading" tabindex="5" class="dialog-btn">重 置</el-button>
                <el-button type="primary" :loading="loading" @click="onSubmitClicked" tabindex="4" class="dialog-btn">修 改</el-button>
            </div>
        </el-tab-pane>
        <el-tab-pane :lazy="true" :disabled="true" label="更换头像">更换头像</el-tab-pane>
        <el-tab-pane :lazy="true" :disabled="true" label="个人信息">个人信息</el-tab-pane>
        <el-tab-pane :lazy="true" :disabled="true" label="设置">设置</el-tab-pane>
    </el-tabs>
</template>

<script>
import Axios from 'axios';
import Auths from '../auths.js';

const MSG = {
    '400': '参数格式错误，请联系管理员',
    '409': '原始密码输入错误',
    '507': '服务器出现错误，请稍后重试'
}

export default {
    data () {
        return {
            loading: false,
            model: {
                originPassword: null,
                newPassword: null,
                comfirmedPassword: null
            },
            rules: {
                originPassword: [
                    { required: true, message: '请输入原始密码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新的登录密码', trigger: 'blur' },
                    { min: 8, max: 16, message: '长度限制在 8 到 16 个字符', trigger: 'blur' }
                ],
                comfirmedPassword: [
                    { required: true, message: '请再次输入登录新密码', trigger: 'blur' },
                    { min: 8, max: 16, message: '长度限制在 8 到 16 个字符', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        onResetClicked: function () {
            this.model.originPassword = null;
            this.model.newPassword = null;
            this.model.comfirmedPassword = null;
            this.$refs.form.clearValidate();
        },
        onSubmitClicked: function () {
            let model = this.model;
            if (model.newPassword != model.comfirmedPassword) {
                this.$refs.comfirmedPassword.select();
                this.$message({
                    showClose: true,
                    message: '两次密码输入不一致',
                    type: 'error'
                });
            } else {
                this.$refs.form.validate(ok => {
                    if (ok) {
                        this.loading = true;
                        Axios.put('/users/' + Auths.session.id + '/password', { 
                            value: this.model.originPassword + ',' + this.model.newPassword 
                        }).then(response => {
                            this.onResetClicked();
                            this.$notify({
                                title: '成功',
                                message: '密码修改成功',
                                type: 'success'
                            });
                        }).catch(error => {
                            let status = error.response.status;
                            this.$notify.error({
                                title: '错误',
                                message: MSG[status] || '操作失败'
                            });
                        }).then(() => {
                            this.loading = false;
                        });
                    }
                });
            }
        }
    }
}
</script>

<style scoped>
    .el-tabs {
        height: 350px;
    }

    .el-tab-pane {
        height: 328px;
        padding-top: 20px;
        padding-right: 20px;
    }

    .btn-row {
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
    }
</style>


