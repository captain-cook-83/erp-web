<template>
    <div class="base">
        <el-table :data="value" header-cell-class-name="inner-table-header-cell" :row-class-name="rowClassName" 
                tooltip-effect="light" row-key="id" @row-click="onRowClicked" border stripe :empty-text="loadingText" 
                v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.65)">
            <el-table-column prop="refreshDate" label="核算月份" sortable width="110">
                <template slot-scope="scope">
                    <date-formater :value="scope.row.refreshDate" precision="month" :hide-icon="true"></date-formater>
                </template>
            </el-table-column>
            <el-table-column prop="title" label="合同标题" :show-overflow-tooltip="true"></el-table-column>
                
            <el-table-column prop="amount" label="合同金额" sortable width="135">
                <template slot-scope="scope">
                    <money-formater :value="scope.row.amount"></money-formater>
                </template>
            </el-table-column>
            <el-table-column prop="occurAmount" label="发生总额" sortable width="135">
                <template slot-scope="scope">
                    <money-formater :value="scope.row.occurAmount"></money-formater>
                </template>
            </el-table-column>
            <el-table-column label="%（发生）" width="90">
                <template slot-scope="scope">
                    <percent-formater :value="scope.row.cashAmount/scope.row.occurAmount"></percent-formater>
                </template>
            </el-table-column>
            <el-table-column prop="invoiceAmount" label="开票金额" sortable width="135">
                <template slot-scope="scope">
                    <el-popover placement="top-start" title="未开票金额" width="200" trigger="hover"
                            :content="(scope.row.occurAmount-scope.row.invoiceAmount).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })">
                        <money-formater slot="reference" :value="scope.row.invoiceAmount"></money-formater>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="%（开票）" width="90">
                <template slot-scope="scope">
                    <percent-formater :value="scope.row.cashAmount/scope.row.invoiceAmount"></percent-formater>
                </template>
            </el-table-column>
            <el-table-column prop="cashAmount" label="回款金额" sortable width="135">
                <template slot-scope="scope">
                    <el-popover placement="top-start" title="已开票未回款金额" width="200" trigger="hover"
                            :content="(scope.row.invoiceAmount-scope.row.cashAmount).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })">
                        <money-formater slot="reference" :value="scope.row.cashAmount"></money-formater>
                    </el-popover>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="serialNumber" label="合同编号" width="120" :show-overflow-tooltip="true" ></el-table-column> -->
            <el-table-column prop="departmentName" label="所属部门" width="90" :show-overflow-tooltip="true" ></el-table-column>
            <el-table-column prop="companyName" label="记账公司" width="90" :show-overflow-tooltip="true" ></el-table-column>
        </el-table>
    </div>
</template>

<script>
import Axios from 'axios';

import DateFormater from './formaters/DateFormater.vue';
import MoneyFormater from './formaters/MoneyFormater.vue';
import PercentFormater from './formaters/PercentFormater.vue';

export default {
    props: {
        value: Array,
        rowClassName: Function
    },
    data () {
        return {
            tableData: [],
            loadingText: '数据加载中...',
            loading: false
        }
    },
    components: {
        'date-formater': DateFormater,
        'money-formater': MoneyFormater,
        'percent-formater': PercentFormater
    },
    methods: {
        load: function (project, callback) {
            this.loading = true;
            this.loadingText = '数据加载中...';
            Axios.get('/s/contract', {
                params: {
                    projectId: project.id,
                    limit: 100,                 //TODO 最多限制了 100 条合同记录
                    sort: 'refreshDate,desc'
                }
            }).then(response => {
                if (typeof callback === 'function') {
                    callback(response.data.content);
                }
            }).catch(error => {
                this.loadingText = '加载失败';
                if (typeof callback === 'function') {
                    callback();
                }
            }).then(() => {
                this.loading = false;
                this.loadingText = '暂无数据';
            });
        },
        onRowClicked: function (row, column, event) {
            this.$emit('show', row);
        }
    }
}
</script>

<style scoped>
    .base {
        width: 100%;
        height: 100%;
        color: #283a44;
    }

    .el-table {
        text-align: left;
        color: #283a44;
        border-radius: 10px;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.03);
    }
</style>