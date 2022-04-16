<template>
    <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.65)">
        <el-row :gutter="0">
            <el-col :span="2.5"><span>合同标题：</span></el-col>
            <el-col :span="20"><span>{{ model.contractTitle +  '（ 编号：' + model.serialNumber + ' ）' }}</span></el-col>
        </el-row>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>项目名称：</span></el-col>
            <el-col :span="20"><span>{{ model.projectName }}</span></el-col>
        </el-row>
        <div class="line"></div>
        <el-row :gutter="0">
            <el-col :span="2.5"><span>核算月份：</span></el-col>
            <el-col :span="5"><date-formater :value="model.accountingDate" precision="month" :hideIcon="true"></date-formater></el-col>
            <!-- <el-col :span="2.5"><span>核算人员：</span></el-col>
            <el-col :span="5"><span>{{ model.operatorName }}</span></el-col> -->
            <el-col :span="2.5"><span>发生期间：</span></el-col>
            <el-col :span="3">
                <date-formater v-if="Array.isArray(model.periodDates)" :value="model.periodDates[0]" :hideIcon="true"/>
            </el-col>
            <el-col :span="0.1">
                <span style="padding-right: 8px;">-</span>
            </el-col>
            <el-col :span="5">
                <date-formater v-if="Array.isArray(model.periodDates)" :value="model.periodDates[1]" :hideIcon="true"/>
            </el-col>
            <el-col :span="2.5"><span>录入日期：</span></el-col>
            <el-col :span="3"><date-formater :value="model.createTime" :hideIcon="true"></date-formater></el-col>
        </el-row>
        <el-collapse v-model="activeName" accordion>
            <el-collapse-item title="发生明细" name="1">
                <template slot="title">
                    <span>发生金额</span>
                    <money-formater :value="model.occurAmount"/>
                    <money-formater :value="occurBillsAmount" :package="true" v-if="model.occurAmount != occurBillsAmount"/>
                </template>
                <data-table v-if="occurData.length" :columes="tableColumes" :data="occurData" :border="true" @audit="onPictureBtnClicked"/>
                <div v-else class="text-place-row"><span>没有明细数据</span></div>
            </el-collapse-item>
            <el-collapse-item title="开票明细" name="2">
                <template slot="title">
                    <span>开票金额</span>
                    <money-formater :value="model.invoiceAmount"/>
                    <money-formater :value="invoiceBillsAmount" :package="true" v-if="model.invoiceAmount != invoiceBillsAmount"/>
                </template>
                <data-table v-if="invoiceData.length" :columes="tableColumes" :data="invoiceData" :border="true" @audit="onPictureBtnClicked"/>
                <div v-else class="text-place-row"><span>没有明细数据</span></div>
            </el-collapse-item>
            <el-collapse-item title="回款明细" name="3">
                <template slot="title">
                    <span>回款金额</span>
                    <money-formater :value="model.cashAmount"/>
                    <money-formater :value="cashBillsAmount" :package="true" v-if="model.cashAmount != cashBillsAmount"/>
                </template>
                <data-table v-if="cashData.length" :columes="tableColumes" :data="cashData" :border="true" @audit="onPictureBtnClicked"/>
                <div v-else class="text-place-row"><span>没有明细数据</span></div>
            </el-collapse-item>
            <el-collapse-item title="审核记录" name="4">
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
            <el-collapse-item title="备注" name="5">
                <template slot="title">
                    <span>备注</span>
                </template>
                <div class="text-place-row"><span>{{ model.remarks ? model.remarks : '没有备注信息' }}</span></div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
import MoneyFormater from '../formaters/MoneyFormater.vue';
import DateFormater from '../formaters/DateFormater.vue';
import DataTable from '../DataTable.vue';

import Axios from 'axios';

const dateTimeOptions = { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

export default {
    data () {
        return {
            activeName: '5',
            model: {},
            tableColumes: [
                { prop: 'signDate', label: '日期', width: '130', type: 'Date', precision: 'date', hideIcon: true },
                { prop: 'label', label: '标题', overflow: true, placeholder: '请输入标题' },
                { prop: 'amount', label: '金额', width: '135', type: 'Amount' },
                { prop: 'handlerName', label: '经手人', width: '100', type: 'User' },
                { prop: 'remarks', label: '备注', overflow: true, placeholder: '请输入备注' }
            ],
            occurData: [],
            invoiceData: [],
            cashData: [],

            activities: [],

            occurBillsAmount: 0,
            invoiceBillsAmount: 0,
            cashBillsAmount: 0,

            loading: false
        }
    },
    components: {
        'money-formater': MoneyFormater,
        'date-formater': DateFormater,
        'data-table': DataTable
    },
    methods: {
        setModel: function (model) {
            this.model = model;

            this.occurData.splice(0);
            this.invoiceData.splice(0);
            this.cashData.splice(0);

            this.activities.splice(0);

            this.occurBillsAmount = 0;
            this.invoiceBillsAmount = 0;
            this.cashBillsAmount = 0;

            this.loading = true;
            Axios.get('/contractItems/' + model.id + "/bills").then(response => {
                let bills = response.data;
                for (let i = 0; i < bills.length; i++) {
                    let bill = bills[i];
                    switch (bill.type) {
                        case 1: 
                            this.occurData.push(bill); 
                            this.occurBillsAmount += bill.amount;
                            break;
                        case 2: 
                            this.invoiceData.push(bill); 
                            this.invoiceBillsAmount += bill.amount;
                            break;
                        case 3: 
                            this.cashData.push(bill); 
                            this.cashBillsAmount += bill.amount;
                            break;
                    }
                }
                this.occurData.sort(this.billSortFunction);
                this.invoiceData.sort(this.billSortFunction);
                this.cashData.sort(this.billSortFunction);

                Axios.get('/contractItems/' + model.id + "/auditHistories").then(response => {
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
                }).then(() => {
                    this.loading = false;
                });
            }).catch(error => {
                this.loading = false;
                let status = error.response.status;
                this.$notify.error({
                    title: '错误',
                    message: '明细列表查询失败，请关闭弹窗后重新打开'
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

    .el-collapse-item .money-formater:nth-child(2n+1) {
        color: rgb(218, 0, 0);
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

    data-table {
        border-radius: 10px;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.03);
    }
</style>
