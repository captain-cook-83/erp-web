<template>
    <div class="base">
        <div class="center-container" ref="centerContainer">
            <div class="header-container">
                <div class="major-div">
                    <h1>项目情况汇总</h1>
                    <div>
                        <span>合同总额</span>
                        <money-formater :value="totalAmount"></money-formater>
                        <span>发生总额</span>
                        <money-formater :value="totalOccurAmount"></money-formater>
                        <span>开票总额</span>
                        <money-formater :value="totalInvoiceAmount"></money-formater>
                        <span>回款总额</span>
                        <money-formater :value="totalCashAmount"></money-formater>
                    </div>
                </div>
                <div class="local-filter">
                    <el-input placeholder="输入项目名称/客户名称搜索" v-model="localFilter">
                        <el-button slot="append" icon="el-icon-search" @click="onLocalFilterClicked"></el-button>
                    </el-input>
                </div>
                <el-button class="download-btn" @click="onDownloadClicked">下载</el-button>
                <!-- <div id="chart-div"></div> -->
            </div>
            <div class="table-card" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.65)">
                <el-table :data="localFilterData(tableData)" @row-click="onRowClicked" @sort-change="onTableSortChanged" @expand-change="onTableRowExpanded"
                        header-cell-class-name="table-header-cell" :height="tableHeight" :max-height="tableHeight" :empty-text="loadFailed ? '加载失败' : '暂无数据'" 
                        tooltip-effect="light" row-key="id" :row-class-name="projectRowClassName" :expand-row-keys="expandRowKeys" ref="table">
                    <el-table-column type="expand" width="30">
                        <template slot-scope="scope">
                            <!-- <transition name="el-fade-in-linear"> -->
                                <contract-statistic-table :value="scope.row.contracts" :rowClassName="projectRowClassName" @show="onContractShow"></contract-statistic-table>
                            <!-- </transition> -->
                        </template>
                    </el-table-column>
                    <el-table-column prop="refreshDate" label="核算月份" sortable="custom" width="110">
                        <template slot-scope="scope">
                            <date-formater :value="scope.row.refreshDate" precision="month" :hideIcon="true"></date-formater>
                        </template>
                    </el-table-column>
                    <el-table-column prop="customerName" label="客户名称" width="160" :show-overflow-tooltip="true" ></el-table-column>
                    <el-table-column prop="name" label="项目名称" width="160" :show-overflow-tooltip="true"></el-table-column>
                
                    <el-table-column prop="amount" label="合同总额" width="135">
                        <template slot-scope="scope">
                            <money-formater :value="scope.row.amount"></money-formater>
                        </template>
                    </el-table-column>
                    <el-table-column prop="occurAmount" label="累计发生额" sortable="custom" width="135">
                        <template slot-scope="scope">
                            <money-formater :value="scope.row.occurAmount"></money-formater>
                        </template>
                    </el-table-column>
                    <el-table-column prop="invoiceAmount" label="累计开票额" sortable="custom" width="135">
                        <template slot-scope="scope">
                            <money-formater :value="scope.row.invoiceAmount"></money-formater>
                        </template>
                        <!-- <template slot-scope="scope">
                            <el-popover
                                placement="top-start"
                                title="未开票金额"
                                width="200"
                                trigger="hover"
                                :content="(scope.row.occurAmount-scope.row.invoiceAmount).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })">
                                <money-formater slot="reference" :value="scope.row.invoiceAmount"></money-formater>
                            </el-popover>
                        </template> -->
                    </el-table-column>
                    <el-table-column label="开票回款率" width="90">
                        <template slot-scope="scope">
                            <percent-formater :value="scope.row.cashAmount/scope.row.invoiceAmount"></percent-formater>
                        </template>
                    </el-table-column>
                    <el-table-column prop="cashAmount" label="累计回款额" sortable="custom" width="135">
                        <template slot-scope="scope">
                            <money-formater :value="scope.row.cashAmount"></money-formater>
                        </template>
                        <!-- <template slot-scope="scope">
                            <el-popover
                                placement="top-start"
                                title="已开票未回款金额"
                                width="200"
                                trigger="hover"
                                :content="(scope.row.invoiceAmount-scope.row.cashAmount).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })">
                                <money-formater slot="reference" :value="scope.row.cashAmount"></money-formater>
                            </el-popover>
                        </template> -->
                    </el-table-column>
                    <el-table-column label="实际回款率" width="90">
                        <template slot-scope="scope">
                            <percent-formater :value="scope.row.cashAmount/scope.row.occurAmount"></percent-formater>
                        </template>
                    </el-table-column>
                    <el-table-column prop="missingInvoice" label="未开票金额" width="135"/>
                    <el-table-column prop="missingInvoiceAmount" label="已开票应收" width="135"/>
                    <el-table-column prop="missingAmount" label="实际应收总额" width="135"/>
                    <template slot="append" v-if="hasMoreData">
                        <div class="load-more">
                            <el-button type="primary" :loading="loading" @click="loadProjectStatistics">加载更多</el-button>
                        </div>
                    </template>
                </el-table>
                <!-- <el-pagination background layout="total, sizes, prev, pager, next" :page-sizes="[30, 50, 100, 200]" :total="totalSize" 
                    :page-size="pageSize" :current-page="currentPage" @current-change="onCurrentPageChange" @size-change="onPageSizeChange"></el-pagination> -->
            </div>
            <el-dialog title="合同月度明细" :visible.sync="contractMonthlyShown" :close-on-click-modal="false" :center="true" 
                    width="98vw" top="5vh" custom-class="popup-dialog">
                <template>
                    <div>
                        <el-row :gutter="0">
                            <el-col :span="2.5"><span>合同标题：</span></el-col>
                            <el-col :span="7"><span>{{ currentContract && currentContract.title }}</span></el-col>
                            <el-col :span="2.5"><span>合同编号：</span></el-col>
                            <el-col :span="6"><span>{{ currentContract && currentContract.serialNumber }}</span></el-col>
                            <el-col :span="2.5"><span>项目名称：</span></el-col>
                            <el-col :span="6"><span>{{ currentProjectName }}</span></el-col>
                        </el-row>
                        <el-row :gutter="0">
                            <el-col :span="2.5"><span>所属部门：</span></el-col>
                            <el-col :span="7">
                                <span>{{ currentContract && currentContract.departmentName }}</span>
                                <span>{{ currentContract && currentContract.companyName && ('（ ' + currentContract.companyName + ' ）') }}</span>
                            </el-col>
                            <el-col :span="2.5"><span>签署日期：</span></el-col>
                            <el-col :span="6"><date-formater :value="currentContract && currentContract.signDate" :hideIcon="true"></date-formater></el-col>
                            <el-col :span="2.5"><span>合同金额：</span></el-col>
                            <el-col :span="6"><money-formater :value="currentContract && currentContract.amount"></money-formater></el-col>
                        </el-row>
                        <div class="line"></div>
                    </div>
                    <resource-selector resourceURL="/contractItems" :filters="contractMonthlyFilters" height="63vh" :border="true" :hidePaging="true" :defaultPageSize="500"
                        :tableColumes="contractMonthlyColumes" :dataProcessor="onContractMonthlyData" @loading="onBillsLoading" ref="billsTable"/>
                </template>
                <div slot="footer" class="dialog-footer">
                    <transition name="el-fade-in-linear">
                        <el-button type="primary" :loading="billsLoading" @click="onBillsRefreshClicked" class="dialog-btn">刷 新</el-button>
                    </transition>
                    <el-button type="primary" @click="contractMonthlyShown = false" class="dialog-btn">关 闭</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import Axios from 'axios';
import G2 from '@antv/g2';
import Auths from '../auths.js';

import DateFormater from '../components/formaters/DateFormater.vue';
import MoneyFormater from '../components/formaters/MoneyFormater.vue';
import PercentFormater from '../components/formaters/PercentFormater.vue';
import ContractStatisticTable from '../components/ContractStatisticTable.vue';
import ResourceSelector from '../components/ResourceSelector.vue';

const MSG = {
    '400': '资源数据参数错误',
    '404': '数据加载失败，请刷新重试',
    '409': '数据状态已发生改变，操作被禁止',
    '422': '参数不符合业务规则',
    '500': '服务器出现错误，请在稍后重试',
    'D400': '敏感数据不允许批量删除'
}

let chartData = [
    { genre: 'Sports', sold: 175 },
    { genre: 'Strategy', sold: 115 },
    { genre: 'Action', sold: 120 },
    { genre: 'Shooter', sold: 250 },
    { genre: 'Other', sold: 50 }
];

let chart;
let query = {
    sort: 'refreshDate,desc',
    sortSkip: undefined
}

export default {
    data () {
        return {
            tableHeight: 500,
            tableData: [],
            currentPage: 1,
            pageSize: 300,
            totalSize: 0,
            hasMoreData: true,
            loadFailed: false,
            loading: false,
            billsLoading: false,

            totalAmount: '-',
            totalOccurAmount: '-',
            totalInvoiceAmount: '-',
            totalCashAmount: '-',

            expandRowKeys: [],

            localFilter: '',

            currentProjectName: null,
            currentContract: null,
            contractMonthlyShown: false,
            contractMonthlyFilters: null,
            contractMonthlyColumes: [
                { prop: 'createTime', label: '填表日期', type: 'Date', hideIcon: true },
                { prop: 'accountingDate', label: '核算月份', width: '110', type: 'Date', precision: 'month', hideIcon: true },
                { prop: 'occurAmount', label: '当期发生', width: '125', type: 'Amount' },
                { prop: 'totalOccur', label: '累计发生', width: '130', type: 'Amount' },
                { prop: 'invoiceAmount', label: '当期开票', width: '125', type: 'Amount' },
                { prop: 'totalInvoice', label: '累计开票', width: '130', type: 'Amount' },

                { prop: 'missingInvoice', label: '未开票金额', width: '130', type: 'Amount' },

                { prop: 'cashAmount', label: '当期回款', width: '125', type: 'Amount' },
                { prop: 'totalCash', label: '累计回款', width: '130', type: 'Amount' },

                { prop: 'missingInvoiceAmount', label: '已开票应收额', width: '135', type: 'Amount' },
                { prop: 'missingAmount', label: '实际应收总额', width: '130', type: 'Amount' },

                { prop: 'invoicePercent', label: '开票回款率', width: '95', type: 'Percent' },
                { prop: 'occurPercent', label: '发生回款率', width: '95', type: 'Percent' },
                // { prop: 'remarks', label: '备注', overflow: true }
            ]
        }
    },
    components: {
        'date-formater': DateFormater,
        'money-formater': MoneyFormater,
        'percent-formater': PercentFormater,
        'contract-statistic-table': ContractStatisticTable,
        'resource-selector': ResourceSelector
    },
    mounted: function () {
        Auths.pending(() => {
            this.$nextTick(this.clearAndReload);
        });
        this.$nextTick(() => {
            this.tableHeight = this.$refs.centerContainer.offsetHeight - 110;
        });
    },
    watch: {
        '$route' (to, from) {
            this.$nextTick(this.clearAndReload);
        }
    },
    methods: {
        localFilterData: function (array) {
            if (this.localFilter) {
                return array.filter((ele) => {
                    return ele.name.indexOf(this.localFilter) != -1 || ele.customerName.indexOf(this.localFilter) != -1;
                });
            } else {
                return array;
            }
        },
        clearAndReload: function () {
            query = {
                sort: 'refreshDate,desc',
                sortSkip: undefined
            };

            this.tableData.splice(0);
            this.currentPage = 1;
            this.totalSize = 0;

            this.hasMoreData = true;
            this.loadFailed = false;
            this.loading = false;
            this.billsLoading = false;

            this.currentProjectName = null;
            this.currentContract = null;
            this.contractMonthlyFilters = null,

            // this.setDataForChart(chartData);
            this.loadProjectStatistics();
        },
        loadProjectStatistics: function () {
            this.loading = true;
            Axios.get('/s/project', {
                params: {
                    limit: this.pageSize,
                    sort: query.sort,
                    sortSkip: query.sortSkip
                }
            }).then(response => {
                let data = response.data;
                query.sortSkip = data.nextSkip;
                query.sort = data.sort;

                if (typeof data.totalSize === 'number') {
                    this.totalSize = data.totalSize;
                }

                this.loadFailed = false;
                
                this.hasMoreData = data.hasMore;
                this.$nextTick(() => {
                    data.content.forEach(element => {
                        let missingInvoice = element.occurAmount-element.invoiceAmount;
                        let missingInvoiceAmount = element.invoiceAmount-element.cashAmount;
                        element.missingInvoice = missingInvoice.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
                        element.missingInvoiceAmount = missingInvoiceAmount.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
                        element.missingAmount = (missingInvoice + missingInvoiceAmount).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
                    });

                    this.tableData.push.apply(this.tableData, data.content);
                });

                this.$message({
                    showClose: true,
                    message: '列表数据已刷新'
                });
            }).catch(error => {
                this.loadFailed = true;
                let status = error.response.status;
                this.$notify.error({
                    title: '错误',
                    message: MSG['G' + status] || MSG[status] || status
                });
            }).then(() => {
                this.loading = false;
            });

            Axios.get('/s/project/summa').then(response => {
                let data = response.data;
                this.totalAmount = data.amount;
                this.totalOccurAmount = data.occurAmount;
                this.totalInvoiceAmount = data.invoiceAmount;
                this.totalCashAmount = data.cashAmount;
            }).catch(error => {
                let status = error.response.status;
                this.$notify.error({
                    title: '错误',
                    message: MSG['G' + status] || MSG[status] || status
                });
            });
        },
        loadContractStatistics: function (project, callback) {
            this.loading = true;
            Axios.get('/s/contract', {
                params: {
                    projectId: project.id,
                    limit: 500,                 //TODO 最多限制了 500 条合同记录
                    sort: 'refreshDate,desc'
                }
            }).then(response => {
                project.contracts = response.data.content;
                if (typeof callback === 'function') {
                    callback();
                }
            }).catch(error => {
                let status = error.response.status;
                let indicator = method.substr(0, 1).toUpperCase();
                this.$notify.error({
                    title: '错误',
                    message: MSG[indicator + status] || MSG[status] || status
                });
            }).then(() => {
                this.loading = false;
            });
        },
        setDataForChart: function (data) {
            if (chart) {
                chart.destroy();
                chart = undefined;
            }
            chart = new G2.Chart({
                container: 'chart-div',
                width : 400,
                height : 100,
                padding: [ 5, 10, 30, 30 ]
            });
            chart.source(data);
            chart.interval().position('genre*sold').color('genre');
            chart.legend(false);
            chart.render();
        },
        onTableSortChanged: function (e) {
            if (e.prop) {
                query.sort = e.prop + ',' + (e.order == 'descending' ? 'desc' : 'asc');
                query.sortSkip = undefined;
                this.tableData.splice(0);
                this.loadProjectStatistics();
            }
        },
        onRowClicked: function (row) {
            let index = this.expandRowKeys.indexOf(row.id);
            if (index != -1) {
                this.expandRowKeys.splice(index, 1);
            } else {
                this.expandRowKeys = [ row.id ];        // 每次仅展开一行，之前行自动折叠
                // this.expandRowKeys.push(row.id);     // 同时展开多行，各自独立
                if (row.contracts === undefined) {
                    this.loadContractStatistics(row);
                }
            }
        },
        onTableRowExpanded: function (row, expandedRows) {
            this.onRowClicked(row);
        },
        onCurrentPageChange: function (e) {
            this.currentPage = e;
            
        },
        onPageSizeChange: function (e) {
            this.pageSize = e;
        },
        onContractShow: function (data) {
            if (data) {
                let projectId = data.projectId;
                let project = this.tableData.find(i => i.id == projectId);
                this.currentProjectName = project ? project.name : null;
            } else {
                this.currentProjectName = null;
            }
            this.currentContract = data;
            this.contractMonthlyFilters = { contractId: data.id, status: 3 };
            this.contractMonthlyShown = true;
        },
        onContractMonthlyData: function (data) {
            data = data.sort(this.contractDataSorted);

            let totalOccur = 0, totalInvoice = 0, totalCash = 0;
            for (let i = data.length - 1; i >= 0; i--) {
                let item = data[i];
                item.totalOccur = (totalOccur += item.occurAmount);
                item.totalInvoice = (totalInvoice += item.invoiceAmount);
                item.totalCash = (totalCash += item.cashAmount);

                item.missingInvoice = item.totalOccur - item.totalInvoice;
                item.missingInvoiceAmount = item.totalInvoice - item.totalCash;
                item.missingAmount = item.missingInvoice + item.missingInvoiceAmount;

                item.occurPercent = item.totalCash / item.totalOccur;
                item.invoicePercent = item.totalCash / item.totalInvoice;
            }
            return data;
        },
        contractDataSorted: function (a, b) {
            if (a.accountingYear > b.accountingYear) return -1;
            else if (a.accountingYear < b.accountingYear) return 1;
            else if (a.accountingMonth > b.accountingMonth) return -1;
            else if (a.accountingMonth < b.accountingMonth) return 1;
            else return 0;
        },
        onBillsLoading: function (value) {
            this.billsLoading = value;
        },
        onBillsRefreshClicked: function () {
            let component = this.$refs.billsTable;
            if (component) {
                component.reload();
            }
        },
        onLocalFilterClicked: function () {
            this.tableData = this.tableData;
        },
        onDownloadClicked: function () {
            Axios.get('/s/project/export', {
                responseType: 'arraybuffer',
                headers:{'filename':'utf-8'}
            }).then(response => {
                let data = response.data;
                let blob = new Blob([data], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheets'});
                
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, '项目情况汇总.xlsx');
                } else {
                    let link = document.createElement("a");
                    let evt = document.createEvent("HTMLEvents");
                    evt.initEvent("click", false, false);
                    link.href = URL.createObjectURL(blob); 
                    link.download = '项目情况汇总.xlsx';
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    URL.revokeObjectURL(link.href);
                }
            }).catch(error => {
                this.$notify.error({
                    title: '下载错误',
                    message: JSON.stringify(error)
                });
            });
            Axios.get('/s/contract/export', {
                responseType: 'arraybuffer',
                headers:{'filename':'utf-8'}
            }).then(response => {
                let data = response.data;
                let blob = new Blob([data], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheets'});
                
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, '项目情况汇总.xlsx');
                } else {
                    let link = document.createElement("a");
                    let evt = document.createEvent("HTMLEvents");
                    evt.initEvent("click", false, false);
                    link.href = URL.createObjectURL(blob); 
                    link.download = '合同情况汇总.xlsx';
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    URL.revokeObjectURL(link.href);
                }
            }).catch(error => {
                this.$notify.error({
                    title: '下载错误',
                    message: JSON.stringify(error)
                });
            });

            this.$message({
                showClose: false,
                message: '统计进行中，请稍等片刻 ...'
            });
        },
        projectRowClassName: function (scope) {
            if (scope.row.cashAmount / scope.row.invoiceAmount < 0.7) {
                return 'warning-row';
            } else {
                return null;
            }
        }
    }
}
</script>

<style scoped>
    .base {
        width: 100%;
        height: 100%;
    }

    .center-container {
        margin: auto;
        width: 95%;
        height: 100%;
        min-width: 1200px;
        max-width: 1500px;
    }

    .header-container {
        position: relative;
        width: 100%;
        height: 100px;
        text-align: right;
    }

    .major-div {
        position: absolute;
        bottom: 0;
        padding-bottom: 20px;
        text-align: left;
    }

    .major-div h1 {
        display: inline-block;
        font-size: 32px;
    }

    .major-div span {
        color: #717a7f;
    }

    .major-div span:nth-child(2n) {
        margin-left: 5px;
        color: #80a34c;
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
    }

    .major-div span:nth-child(2n):not(:last-child) {
        padding-right: 10px;
        margin-right: 10px;
        border-right: 1px solid lightgrey;
    }

    .chart-div {
        width: 600px;
    }

    .table-card {
        width: 100%;
        padding: 10px 10px 10px 10px;
        text-align: right;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.03);
    }

    .el-table {
        text-align: left;
        /* color: #283a44; */
        min-height: 400px;
    }

    .load-more {
        width: 100%;
        text-align: center;
        padding-top: 10px;
        padding-bottom: 10px;
        font-weight: normal;
    }

    .el-row {
        margin-bottom: 8px;
    }

    .el-row .el-col:nth-child(2n + 1) {
        color: rgb(124, 153, 190);
    }

    .line {
        width: 100%;
        border-bottom: 1px solid rgb(255, 255, 255);
        margin: 8px 0 8px 0;
    }

    .local-filter {
        position: absolute;
        right: 70px;
        bottom: 20px;
        width: 250px;
    }

    .download-btn {
        position: absolute;
        right: -20px;
        bottom: 20px;
    }
</style>
