<template>
    <div>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>合同标题：</span></el-col>
            <el-col :span="20"><span>{{ model.title }}</span></el-col>
        </el-row>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>合同编号：</span></el-col>
            <el-col :span="20"><span>{{ model.serialNumber }}</span></el-col>
        </el-row>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>项目名称：</span></el-col>
            <el-col :span="20"><span>{{ model.projectName }}</span></el-col>
        </el-row>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>所属部门：</span></el-col>
            <el-col :span="20"><span>{{ model.departmentName }}</span></el-col>
        </el-row>
        <div class="line"></div>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>签署日期：</span></el-col>
            <el-col :span="8"><date-formater :value="model.signDate" :hideIcon="true"></date-formater></el-col>
            <el-col :span="2.5"><span>合同金额：</span></el-col>
            <el-col :span="5"><money-formater :value="model.amount"></money-formater></el-col>
        </el-row>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>录入日期：</span></el-col>
            <el-col :span="8"><date-formater :value="model.createTime" :hideIcon="true"></date-formater></el-col>
            <el-col :span="2.5"><span>录入人员：</span></el-col>
            <el-col :span="5"><span>{{ model.operatorName }}</span></el-col>
        </el-row>
        <el-collapse v-model="activeName" accordion>
            <el-collapse-item title="审核记录" name="1">
                <template slot="title">
                    <span>审核记录</span>
                </template>
                <el-timeline v-if="activities.length">
                    <el-timeline-item v-for="(activity, index) in activities"
                            :key="index" :icon="activity.icon" :type="activity.type" size="large"
                            :timestamp="activity.createTime">
                        {{ activity.message}}
                    </el-timeline-item>
                </el-timeline>
                <div v-else class="text-place-row"><span>没有历史数据</span></div>
            </el-collapse-item>
        </el-collapse>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>完结状态：</span></el-col>
            <el-col :span="20">
                <span v-if="model.finished">已完结</span>
                <el-button v-else size="mini" type="primary" @click="onFinishContract">设置为已完结</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import MoneyFormater from '../formaters/MoneyFormater.vue';
import DateFormater from '../formaters/DateFormater.vue';

import Axios from 'axios';

const dateTimeOptions = { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

export default {
    data () {
        return {
            model: {},
            tableColumes: [
                { prop: 'signDate', label: '日期', width: '130', type: 'Date', precision: 'date', hideIcon: true },
                { prop: 'label', label: '标题', overflow: true, placeholder: '请输入标题' },
                { prop: 'amount', label: '金额', width: '135', type: 'Amount' },
                { prop: 'handlerName', label: '经手人', width: '100', type: 'User' },
                { prop: 'remarks', label: '备注', overflow: true, placeholder: '请输入备注' }
            ],

            activities: [],
            activeName: '1',
            loading: false
        }
    },
    components: {
        'money-formater': MoneyFormater,
        'date-formater': DateFormater
    },
    methods: {
        setModel: function (model) {
            this.model = model;

            this.loading = true;
            Axios.get('/contracts/' + model.id + "/auditHistories").then(response => {
                let activities = response.data;
                for (let i = 0; i < activities.length; i++) {
                    let activity = activities[i];
                    activity.createTime = new Date(activity.createTime).toLocaleDateString('zh-CN', dateTimeOptions);
                    activity.message = activity.operatorName + (activity.message ? '：' + activity.message : '')
                    switch (activity.result) {
                        case 1:
                            activity.message = '[提交] - ' + activity.message;
                            activity.type = 'info';
                            activity.icon = 'el-icon-loading';
                            break;
                        case 2:
                            activity.message = '[驳回] - ' + activity.message;
                            activity.type = 'warning';
                            activity.icon = 'el-icon-close';
                            break;
                        case 3:
                            activity.message = '[通过] - ' + activity.message;
                            activity.type = 'success';
                            activity.icon = 'el-icon-check';
                            break;
                    }
                }
                this.activities = activities.sort(this.activitySortFunction);
            }).catch(error => {
                let status = error.response.status;
                this.$notify.error({
                    title: '错误',
                    message: '审核记录查询失败'
                });
            });
        },
        getModel: function () {
            return this.model;
        },
        onPictureBtnClicked: function (data) {

        },
        billSortFunction: function (a, b) {
            if (a.signDate > b.signDate) return -1;
            else if (a.signDate < b.signDate) return 1;
            return 0;
        },
        activitySortFunction: function (a, b) {
            if (a.createTime > b.createTime) return 1;
            else if (a.createTime < b.createTime) return -1;
            return 0;
        },
        onFinishContract: function () {
            this.$confirm('确定要设置当前合同为完结状态码？', '请确认操作', {
                confirmButtonText: '完结',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Axios.put('/contracts/' + this.model.id + "/finished").then(response => {
                    let contract = response.data;
                    this.model.finished = contract.finished;
                }).catch(error => {
                    let status = error.response.status;
                    this.$notify.error({
                        title: '错误',
                        message: '完结状态修改失败'
                    });
                });
            });
        }
    }
}
</script>

<style scoped>
    .el-row {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    .el-row .el-col:nth-child(2n + 1) {
        color: rgb(124, 153, 190);
    }

    .el-collapse {
        margin-top: 20px;
    }

    .el-collapse-item span {
        color: #283a44;
        font-size: 14px;
        font-weight: normal;
        margin-right: 10px;
    }

    .text-place-row {
        width: 100%;
        text-align: center;
    }

    .text-place-row span {
        color: grey;
    }

    .line {
        width: 100%;
        border-bottom: 1px solid rgb(182, 159, 159);
        margin: 8px 0 8px 0;
    }
</style>
