<template>
    <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.65)">
        <el-form :model="model" :rules="rules" ref="form">
            <el-form-item label="关联合同" label-width="80px" prop="contractId">
                <el-popover placement="bottom" :offset="-40" width="950" v-model="contractSeletorSHown">
                    <resource-selector resourceURL="/contracts" :filters="contractFilters" :tableColumes="contractSelectorColumes" 
                        :searchable="true" height="60vh" @selected="onContractSelected" ref="resourceSelector"/>
                    <el-input slot="reference" v-model="model.contractTitle" suffix-icon='el-icon-search' placeholder="请选择关联合同" 
                        :validate-event="false" :clearable="true" tabindex="1"
                        @keyup.enter.native="onContractSearch" @clear="onContractClear" @change="onContractTitleChange" @blur="onContractBlur"/>
                </el-popover>
            </el-form-item>
            <el-form-item label="备注" label-width="80px" prop="remarks">
                <el-input v-model="model.remarks" :autosize="{ minRows: 1, maxRows: 2}" tabindex="6"/>
            </el-form-item>
            <el-form-item label="发生期间" label-width="80px" prop="periodDates">
                <el-date-picker v-model="model.periodDates" type="daterange" align="right" unlink-panels :picker-options="pickerDateOptions"
                    range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="onPeriodDatesChanged"/>
            </el-form-item>
            <!-- <el-form-item label="合同编号" label-width="80px" prop="serialNumber">
                <el-input v-model="model.serialNumber" :readonly="true" placeholder="只读显示"></el-input>
            </el-form-item>
            <el-form-item label="项目名称" label-width="80px" prop="projectName">
                <el-input v-model="model.projectName" :readonly="true" placeholder="只读显示"></el-input>
            </el-form-item> -->
            <el-form-item label="核算月份" label-width="80px" prop="accountingDate">
                <el-date-picker v-model="model.accountingDate" align="right" placeholder="请选择核算月份" :editable="false" :clearable="true"
                    :validate-event="false" :picker-options="pickerDateOptions" type="month" tabindex="2"/>
            </el-form-item>
            <el-form-item label="发生金额" label-width="80px" prop="occurAmount">
                <!-- <el-input-number v-model="model.occurAmount" controls-position="right" 
                    :precision="2" :step="10000" :min="0" :max="100000000" tabindex="3"/> -->
                <el-input-number v-model="model.occurAmount" controls-position="right" 
                    :precision="2" :step="10000" tabindex="3"/>
                <money-hint v-model="model.occurAmount"></money-hint>
            </el-form-item>
            <el-form-item label="开票金额" label-width="80px" prop="invoiceAmount">
                <el-input-number v-model="model.invoiceAmount" controls-position="right" 
                    :precision="2" :step="10000" :min="0" :max="100000000" tabindex="4"/>
                <money-hint v-model="model.invoiceAmount"></money-hint>
            </el-form-item>
            <el-form-item label="回款金额" label-width="80px" prop="cashAmount">
                <el-input-number v-model="model.cashAmount" controls-position="right" 
                    :precision="2" :step="10000" :min="0" :max="100000000" tabindex="5"/>
                <money-hint v-model="model.cashAmount"></money-hint>
            </el-form-item>
        </el-form>
        <div class="bills-container">
            <div>
                <el-popover v-model="createDialogShown" placement="bottom-end" width="900">
                    <accounting-bill-form v-once :columes="billColumes" :border="true" ref="createDialog" 
                        @cancel="onCreateDialogCancel" @save="onCreateDialogSave"></accounting-bill-form>
                    <el-button slot="reference" type="primary" icon="el-icon-plus" @click="onBillCreateClicked"></el-button>
                </el-popover>
                <el-popover v-model="modifyDialogShown" placement="bottom-end" width="900">
                    <accounting-bill-form v-once :columes="billColumes" :border="true" ref="modifyDialog" 
                        @cancel="onModifyDialogCancel" @save="onModifyDialogSave"></accounting-bill-form>
                    <el-button slot="reference" type="primary" icon="el-icon-edit" :disabled="selection.length != 1" @click="onBillModifyClicked"/>
                </el-popover>
                <el-button type="danger" icon="el-icon-delete" :disabled="!selection.length" @click="onBillDeleteClicked"></el-button>
            </div>
            <data-table ref="table" :columes="billColumes" :data="billsData" :height="tableHeight" :border="true" 
                :milti-selectable="true" :selector-width="36" @selection-change="onBillSelected"/>
        </div>
    </div>
</template>

<script>
import AccountingBillForm from './AccountingBillForm.vue';
import DataTable from '../DataTable.vue';
import ResourceSelector from '../ResourceSelector.vue';
import MoneyHint from '../MoneyHint.vue';

import Vue from 'vue';
import Axios from 'axios';
import Utils from '../../utils.js';

const ENTITY_SIGN = {
    CREATE: 'C',
    UPDATE: 'U'
};

const MSG = {

};

export default {
    data () {
        return {
            model: {},
            rules: {
                contractId: [
                    { required: true, message: '请选择关联合同', trigger: 'blur' },
                ],
                periodDates: [
                    { required: true, message: '请选择发生期间', trigger: 'blur' }
                ],
                accountingDate: [
                    { required: true, message: '请选择核算月份', trigger: 'blur' }
                ],
                occurAmount: [
                    { required: true, message: '请输入当期发生金额', trigger: 'blur' }
                ],
                invoiceAmount: [
                    { required: true, message: '请输入当期开票金额', trigger: 'blur' }
                ],
                cashAmount: [
                    { required: true, message: '请输入当期回款金额', trigger: 'blur' }
                ],
                remarks: [
                    { min: 0, max: 64, message: '最多可输入 64 个汉字', trigger: 'blur' }
                ]
            },
            pickerDateOptions: {
                disabledDate (time) {
                    return time.getTime() > Date.now();
                }
            },
            contractSelectorColumes: [
                { prop: 'serialNumber', label: '编号', overflow: true, width: '200' },
                { prop: 'title', label: '合同标题', overflow: true },
                { prop: 'projectName', label: '项目名称', overflow: true }
            ],
            contractFilters: {
                status: 3
            },
            
            billsData: [],
            tableHeight: '252px',
            billColumes: [
                { prop: 'type', label: '阶段', width: '75', type: 'Enum', sortable: true, inputColumtWidth: '100', inputWidth: '80', options: [
                    { label: '发生', value: 1 },
                    { label: '开票', value: 2 },
                    { label: '回款', value: 3 }
                ], formater: {
                    '1': '发生',
                    '2': '开票',
                    '3': '回款'
                } },
                { prop: 'signDate', label: '日期', width: '130', type: 'Date', sortable: true, inputColumtWidth: '162', inputWidth: '142', precision: 'date', hideIcon: true },
                { prop: 'label', label: '标题', overflow: true, placeholder: '请输入标题' },
                { prop: 'amount', label: '金额', width: '135', type: 'Amount', sortable: true, inputWidth: '115' },
                { prop: 'handlerName', label: '经手人', width: '100', type: 'User' },
                { prop: 'remarks', label: '备注', overflow: true, placeholder: '请输入备注' }
            ],

            deletedData: [],
            selection: [],
            createDialogShown: false,
            modifyDialogShown: false,
            contractSeletorSHown: false,

            loading: false
        }
    },
    components: {
        'accounting-bill-form': AccountingBillForm,
        'data-table': DataTable,
        'resource-selector': ResourceSelector,
        'money-hint': MoneyHint
    },
    methods: {
        setModel: function (model) {
            this.model = model;
            
            this.billsData.splice(0);
            this.deletedData.splice(0);
            this.selection.splice(0);

            if (model.id) {
                this.loading = true;
                Axios.get('/contractItems/' + model.id + "/bills").then(response => {
                    this.billsData = response.data;
                }).catch(error => {
                        let status = error.response.status;
                        this.$notify.error({
                            title: '错误',
                            message: MSG['D' + status] || MSG[status] || status
                        });
                }).then(() => {
                    this.loading = false;
                });
            }
        },
        getModel: function () {
            let billsChanged = [].concat(this.deletedData);
            this.billsData.forEach(item => {
                if (item._s) {
                    if (item._s == ENTITY_SIGN.CREATE) {
                        item.id = null;
                    }
                    billsChanged.push(item);
                }
            });

            return {
                id: this.model.id,                  // 外层逻辑用以识别 CREATE 或 UPDATE（作为路径参数）
                element: this.model,
                bills: billsChanged,
                _origin: 'element'                  // 标识这是一个被保装过的 Model 数据，不同于 setModule 传入的对象，并指明了获取原始数据引用的字段名
            };
        },
        validate: function (callback) {
            this.$refs.form.validate(callback);
        },
        clearValidate: function () {
            this.$refs.form.clearValidate();
        },
        onContractSelected: function (data) {
            if (data.status == 3) {
                Vue.set(this.model, 'contractTitle', data.title);
                Vue.set(this.model, 'contractId', data.id);
                Vue.set(this.model, 'serialNumber', data.serialNumber);
                Vue.set(this.model, 'projectName', data.projectName);

                this.contractSeletorSHown = false;
            } else {
                this.$message({
                    message: '合同尚未审核，不能在此关联',
                    type: 'warning'
                }); 
            }
        },
        onContractSearch: function () {
            this.$refs.resourceSelector.searchData(this.model.contractTitle);
        },
        onContractClear: function () {
            this.$refs.resourceSelector.searchData(null);
        },
        onContractTitleChange: function (value) {                       // clear 操作同样会出发 change 事件
            Vue.set(this.model, 'contractId', null);
            Vue.set(this.model, 'serialNumber', null);
            Vue.set(this.model, 'projectName', null);
        },
        onContractBlur: function () {                                   // 选中标题被修改后，blur 在 change 事件之后出发，用来清空标题（已被修改）显示
            if (!this.model.contractId) {
                Vue.set(this.model, 'contractTitle', null);
            }
        },
        onBillSelected: function (e) {
            this.selection = e;
        },
        onBillCreateClicked: function (e) {
            this.$refs.createDialog.setModel({});
        },
        onBillModifyClicked: function () {
            let model = Utils.copy(this.selection[0]);
            this.$refs.modifyDialog.setModel(model);
        },
        onBillDeleteClicked: function () {
            let selection = this.selection;
            let dict = {};
            for (let i = 0; i < selection.length; i++) {
                let item = selection[i];
                dict[item.id] = true;
                if (item._s != ENTITY_SIGN.CREATE) {
                    this.deletedData.push({ id: item.id });
                }
            }
            selection.splice(0);

            let billsData = this.billsData;
            for (let i = billsData.length - 1; i >= 0; i--) {
                if (dict[billsData[i].id]) billsData.splice(i, 1);
            }
        },
        onCreateDialogCancel: function () {
            this.createDialogShown = false;
        },
        onModifyDialogCancel: function () {
            this.modifyDialogShown = false;
        },
        onCreateDialogSave: function (data) {
            data._s = ENTITY_SIGN.CREATE;
            data.id = new Date().getTime();             // 赋予临时ID，以便修改和删除时进行元素定为（提交数据时依据 _s = 'C' 进行ID清除）
            this.billsData.unshift(data);
            this.createDialogShown = false;
        },
        onModifyDialogSave: function (data) {
            for (let i = 0; i < this.billsData.length; i++) {
                if (this.billsData[i].id === data.id) {
                    if (! data._s) data._s = ENTITY_SIGN.UPDATE;
                    Vue.set(this.billsData, i, data);
                    break;
                }
            }
            this.modifyDialogShown = false;
        },
        onPeriodDatesChanged: function () {
            let model = this.model;
            let periodDates = model.periodDates;
            if (Array.isArray(periodDates)) {
                Vue.set(model, 'accountingDate', periodDates.length == 2 ? periodDates[1] : null);
            } else {
                Vue.set(model, 'accountingDate', null);
            }
        }
    }
}
</script>

<style scoped>
    .bills-container {
        position: relative;
        width: 100%;
        /* border: 1px solid #000; */
    }

    .bills-container div:first-child {
        position: absolute;
        top: -63px;
        right: 0px;
    }

    .bills-container .el-button {
        margin-left: 10px;
    }
</style>
