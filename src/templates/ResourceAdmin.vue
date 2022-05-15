<template>
    <div id="base">
        <div class="center-container" ref="centerContainer">
            <div class="header-container">
                <div class="major-div">
                    <h1>{{ title }}</h1>
                    <div v-html="underTitle"></div>
                </div>
                <div class="operate-div">
                    <sensitive-button :field="statusCtlFiled" :route="statusRoute" :model="selection" :loading="loading" @create="onCreateClicked" 
                        @edit="onEditClicked" @commit="onCommitClicked" @revert="onRevertClicked" @audit="onAuditClicked" 
                        @delete="onDeleteClicked" @refresh="onRefreshClicked" />
                </div>
            </div>
            <div class="table-card" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.65)">
                <data-table :columes="tableColumes" :data="tableData" row-key="id" :height="tableHeight" :route="statusRoute" :milti-selectable="true" :selector-width="40"
                    @selection-change="onSelectionChanged" @edit="onEditClicked" @commit="onCommitClicked" @revert="onRevertClicked" @audit="onAuditClicked" ref="table"/>
                <div id="page-controller">
                    <el-tooltip :content="dynamicFilters ? '数据过滤生效中' : '打开数据过滤设置'" placement="top" effect="light">
                        <el-button :type="dynamicFilters ? 'success' : ''" size="small" icon="el-icon-search" v-show="filterConditions != null" 
                            @click="onSearchClicked"/>
                    </el-tooltip>
                    <el-pagination background layout="total, sizes, prev, pager, next" :page-sizes="[20, 30, 50, 100]" 
                        :total="totalSize" :page-size="paging.pageSize" :current-page="paging.pageNumber" 
                        @current-change="onCurrentPageChange" @size-change="onPageSizeChange"></el-pagination>
                </div>
            </div>
        </div>
        <el-dialog title="筛选条件" :visible.sync="filterFormVisible" :center="true" :close-on-click-modal="false" width="600px">
            <resource-filter-form :conditions="filterConditions" ref="filter"></resource-filter-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="onFilterClear" :disabled="loading" class="dialog-btn">清 除</el-button>
                <el-button type="primary" @click="onFilterSubmit" :loading="loading" class="dialog-btn">设 置</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :center="true" :close-on-click-modal="false" 
                :width="dialogWidth" :top="dialogTop" custom-class="popup-dialog">
            <component v-bind:is="formComponent" ref="form"></component>
            <div slot="footer" class="dialog-footer">
                <el-checkbox v-model="continueCreate" v-show="isCreateForm" class="continue-create-option">连续创建</el-checkbox>
                <el-button @click="onFormCancel('form')" class="dialog-btn">取 消</el-button>
                <el-button type="primary" @click="onFormSubmit('form')" :loading="loading" class="dialog-btn">{{ isCreateForm ? '创 建' : '修 改' }}</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="auditComponent" :title="dialogTitle" :visible.sync="dialogAuditVisible" :close-on-click-modal="false" 
                :center="true" :width="dialogWidth" :top="dialogTop" custom-class="popup-dialog">
            <component v-bind:is="auditComponent" ref="audit"></component>
            <div slot="footer" class="dialog-footer">
                <el-popover placement="top" width="300" v-model="rejectReasonShown">
                    <el-input class="reason-input" v-model="rejectReason" placeholder="请输入驳回原因（ 4-32个字 ）" maxlength="32"></el-input>
                    <div style="text-align: right; margin: 0">
                        <el-button size="mini" type="text" @click="rejectReasonShown = false">取 消</el-button>
                        <el-button type="primary" size="mini" :disabled="rejectReason.length < 4" :loading="loading" 
                            @click="onRejectConfirmed">驳 回</el-button>
                    </div>
                    <el-button slot="reference" class="dialog-btn">驳 回</el-button>
                </el-popover>
                <el-popover placement="top" width="300" v-model="auditConfirmShown">
                    <el-input class="reason-input" v-model="auditReason" placeholder="可以输入一些备注（可选）" maxlength="32"></el-input>
                    <div style="text-align: right; margin: 0">
                        <el-button size="mini" type="text" @click="auditConfirmShown = false">取 消</el-button>
                        <el-button type="primary" size="mini" :loading="loading" @click="onAuditConfirmed">通 过</el-button>
                    </div>
                    <el-button slot="reference" type="primary" class="dialog-btn">通 过</el-button>
                </el-popover>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import Axios from 'axios';
import { Base64 } from 'js-base64';
import Utils from '../utils.js';
import Auths from '../auths.js';

import SensitiveButton from '../components/SensitiveButton.vue';
import ResourceFilterForm from '../components/forms/ResourceFilterForm.vue';
import DataTable from '../components/DataTable.vue';

const MSG = {
    '400': '资源数据参数错误',
    '404': '数据加载失败，请刷新重试',
    '409': '数据状态已发生改变，操作被禁止',
    '422': '参数不符合业务规则',
    '500': '服务器出现错误，请在稍钟后重试',
    'D400': '敏感数据不允许批量删除'
}

export default {
    props: {
        resourceURL: String,
        title: String,
        underTitle: String,
        tableColumes: Array,
        dialogTitle: String,
        filterConditions: Array,
        formComponent: Object,
        auditComponent: Object,
        statusRoute: Object,
        dialogWidth: String,
        dialogTop: String,
        statusCtlFiled: String,
        fefreshAfterEdit: Boolean
    },
    data () {
        return {
            tableHeight: '400px',
            tableData: [],
            totalSize: 0,
            paging: {
                pageSize: 20,
                pageNumber: 1,
                fetchTotal: true
            },
            selection: [],
            dynamicFilters: null,
            filterFormVisible: false,
            dialogFormVisible: false,
            dialogAuditVisible: false,
            isCreateForm: true,

            rejectReasonShown: false,
            rejectReason: '',
            auditConfirmShown: false,
            auditReason: '',
            loading: false,

            continueCreate: false
        }
    },
    components: {
        'sensitive-button': SensitiveButton,
        'data-table': DataTable,
        'resource-filter-form': ResourceFilterForm
    },
    mounted: function () {
        Auths.pending(() => {
            this.$nextTick(this.loadData);
        });
        this.$nextTick(() => {
            let centerContainer = this.$refs.centerContainer;
            if (centerContainer) {
                this.tableHeight = (centerContainer.offsetHeight - 150) + 'px';
            }
        });
    },
    watch: {
        '$route' (to, from) {
            this.selection.splice(0);
            this.tableData.splice(0);
            this.totalSize = 0;
            this.paging = {
                pageSize: 20,
                pageNumber: 1,
                fetchTotal: true
            };

            this.$nextTick(this.onFilterClear);
        }
    },
    methods: {
        loadData: function (callback) {
            let params = this.paging;
            if (this.dynamicFilters) {
                let filtersBase64 = Base64.encode(JSON.stringify(this.dynamicFilters));
                params = Utils.merge(params, { filters: filtersBase64 });
            }
            this.callAxiosSync('get', this.resourceURL, params, data => {
                if (typeof data.totalSize === 'number') {
                    this.totalSize = data.totalSize;
                    this.paging.fetchTotal = false;
                }

                let list = data.content;
                let paging = this.paging;
                for (let i = 0; i < list.length; i++) {
                    list[i]._order = paging.pageSize * (paging.pageNumber - 1) + i + 1;
                }

                this.tableData = list;

                if (typeof callback === 'function') {
                    this.$nextTick(callback);
                }
                // this.$message({
                //     showClose: true,
                //     message: '列表数据已刷新'
                // });
            });
        },
        createSubmit: function (model) {
            this.callAxiosSync('post', this.resourceURL + '?batch=true', model, data => {
                if (this.paging.pageNumber == 1) {
                    this.paging.fetchTotal = true;
                    this.loadData(() => {
                        this.$nextTick(() => {
                            let item = this.tableData.find(e => e.id === data.id);
                            this.$refs.table.toggleRowSelection(item, true);
                        });
                    });
                } else {
                    this.totalSize += 1;
                }
                        
                this.$notify({
                    title: '添加成功',
                    message: (model.name || model.title || '数据'),
                    type: 'success'
                });

                if (this.continueCreate) {
                    this.$nextTick(() => {
                        this.$refs.form.setModel({});
                    });
                } else {
                    this.dialogFormVisible = false;
                }
            });
        },
        updateSubmit: function (model, id) {
            this.callAxiosSync('put', this.resourceURL + '/' + id + '?batch=true', model, data => {
                if (model._origin) {
                    model = model[model._origin];
                }

                this.dialogFormVisible = false;
                let tableData = this.tableData;
                for (let i = 0; i < tableData.length; i++) {
                    if (tableData[i].id == model.id) {                                  //TODO 进行 loadData 更加安全
                        // if (typeof model.status === 'number' && !ignoreRefreshAfterEdit) {
                        if (typeof model.status === 'number') {
                            model.status = 0;         // 将状态设置为 NEW 
                        }
                        Vue.set(tableData, i, model);
                        this.$refs.table.toggleRowSelection(model, true);
                        break;
                    }
                }

                if (this.fefreshAfterEdit) {
                    this.$nextTick(this.loadData);
                }
                        
                this.$notify({
                    title: '修改成功',
                    message: (model.name || model.title || '数据'),
                    type: 'success'
                });
            });
        },
        deleteSubmit: function (ids) {
            let additionParam = ids.length > 1 ? '?batch=true' : '';
            this.callAxiosSync('delete', this.resourceURL + '/' + ids.join(',') + additionParam, null, data => {
                this.selection.splice(0);
                this.totalSize -= ids.length;
                this.loadData();
                this.$notify({
                    title: '删除成功',
                    message: ids.length + ' 条数据已成功删除',
                    type: 'success'
                });
            });
        },
        statusSubmit: function (model, target, message, title, callback) {
            let url = this.resourceURL + '/' + model.id + '?target=' + target;
            this.callAxiosSync('put', url, { value: message }, data => {
                let tableData = this.tableData;
                for (let i = 0; i < tableData.length; i++) {
                    if (tableData[i].id == model.id) {
                        model.status = data.status;
                        Vue.set(tableData, i, model);
                        this.$refs.table.toggleRowSelection(model, true);
                        break;
                    }
                }

                if (typeof callback === 'function') {
                    callback();
                }
                        
                this.$notify({
                    title: title,
                    message: model.name || model.title || ('数据状态' + title),
                    type: 'success'
                });
            });
        },
        callAxios: function (method, url, data, onResponse, onError, onFinally, sync) {
            if (typeof onError !== 'function') {
                onError = error => {
                    let msg = error.response.data;
                    if (typeof msg === 'string' && msg.indexOf('Duplicate entry') == 0) {
                        let offset = msg.indexOf("'");
                        let end = msg.indexOf("' for key '");
                        msg = msg.substr(offset, end - offset + 1) + ' 已经存在，请修改后再提交';
                    } else {
                        msg = null;
                    }

                    let status = error.response.status;
                    let indicator = method.substr(0, 1).toUpperCase();
                    this.$notify.error({
                        title: '错误',
                        message: error.response.data || msg || MSG[indicator + status] || MSG[status] || status
                    });
                    if (status == 409) {
                        this.loadData();
                    }
                };
            }
            if (sync) this.loading = true;

            let config = { method: method, url: url };
            if (method == 'post' || method == 'put' || method == 'patch') {
                config.data = data;
            } else {
                config.params = data;
            }

            Axios(config).then(response => {
                if (typeof onResponse === 'function') {
                    onResponse(response.data);
                }
            }).catch(onError).then(() => {
                if (sync) this.loading = false;
                if (typeof onFinally === 'function') {
                    onFinally();
                }
            });
        },
        callAxiosSync: function (method, url, data, onResponse, onError, onFinally) {
            this.callAxios(method, url, data, onResponse, onError, onFinally, true);
        },
        onCurrentPageChange: function (e) {
            this.paging.pageNumber = e;
            this.loadData();
        },
        onPageSizeChange: function (e) {
            this.paging.pageNumber = 1;
            this.paging.pageSize = e;
            this.loadData();
        },
        onSelectionChanged: function (e) {
            this.selection = e;
        },
        onSearchClicked: function () {
            this.filterFormVisible = true;
        },
        onCreateClicked: function () {
            this.dialogFormVisible = true;
            this.isCreateForm = true;
            this.continueCreate = false;
            this.$nextTick(() => {
                this.$refs.form.setModel({});
            });
        },
        onEditClicked: function (model) {
            this.dialogFormVisible = true;
            this.isCreateForm = false;
            this.$nextTick(() => {
                this.$refs.form.setModel(Utils.copy(model));
            });
        },
        onCommitClicked: function (model) {
            this.statusSubmit(model, 'commit', null, '提交成功');
        },
        onRevertClicked: function (model) {
            this.statusSubmit(model, 'revert', null, '撤销成功');
        },
        onAuditClicked: function (model) {
            this.dialogAuditVisible = true;
            this.$nextTick(() => {
                this.$refs.audit.setModel(Utils.copy(model));
            });
        },
        onDeleteClicked: function (selection) {
            if (selection.length) {
                this.$confirm('删除后无法轻易恢复，确定要删除这 ' + selection.length + ' 条数据吗？', '请确认操作', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let ids = selection.map(item => item.id);
                    this.deleteSubmit(ids);
                });
            } else {
                this.$message({
                    showClose: true,
                    message: '请先选中您要删除的复选框',
                    type: 'error'
                });
            }
        },
        onFormSubmit: function (formName) {
            let component = this.$refs[formName];
            let model = component.getModel();
            component.validate((valid, ignoreError) => {
                if (valid) {
                    let data = component.getModel();
                    if (model.id) {
                        this.updateSubmit(data, model.id);
                    } else {
                        this.createSubmit(data);
                    }
                } else if (!ignoreError) {
                    this.$message({
                        showClose: true,
                        message: '输入信息验证失败',
                        type: 'error'
                    });
                }
            });
        },
        onFormCancel: function (formName) {
            this.$refs[formName].clearValidate();
            this.dialogFormVisible = false;
        },
        onRejectConfirmed: function () {
            let model = this.$refs.audit.getModel();
            this.statusSubmit(model, 'reject', this.rejectReason, '成功驳回', () => {
                this.rejectReasonShown = false;
                this.rejectReason = '';
                this.dialogAuditVisible = false;
            });
        },
        onAuditConfirmed: function () {
            let model = this.$refs.audit.getModel();
            this.statusSubmit(model, 'audit', this.auditReason, '审核通过', () => {
                this.auditConfirmShown = false;
                this.auditReason = '';
                this.dialogAuditVisible = false;
            });
        },
        onRefreshClicked: function () {
            this.loadData();
        },
        onFilterClear: function () {
            let filter = this.$refs.filter;
            if (filter) {
                filter.clear();
            }
            this.dynamicFilters = null;
            this.paging.fetchTotal = true;
            this.filterFormVisible = false;
            this.loadData();
        },
        onFilterSubmit: function () {
            this.dynamicFilters = this.$refs.filter.getModel();
            this.paging.fetchTotal = true;
            this.filterFormVisible = false;
            this.loadData();
        }
    }
}
</script>

<style scoped>
    #base {
        width: 100%;
        height: 100%;
    }

    .center-container {
        margin: auto;
        width: 95%;
        height: 100%;
        max-width: 1500px;
    }

    .header-container {
        position: relative;
        top: -15px;
        padding-top: 0;
        width: 100%;
        text-align: right;
    }

    .major-div {
        padding-bottom: 20px;
        text-align: left;
    }

    .major-div h1 {
        display: inline-block;
        font-size: 32px;
    }

    .operate-div {
        position: absolute;
        right: 0;
        bottom: 10px;
    }

    .table-card {
        position: relative;
        top: -15px;
        width: 100%;
        padding: 10px 10px 10px 10px;
        text-align: right;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.03);
    }

    .dialog-btn {
        margin-left: 10px;
        margin-right: 10px;
    }

    #page-controller {
        position: relative;
        margin-top: 10px;
    }

    #page-controller .el-button {
        position: absolute;
        left: 10px;
    }

    .reason-input {
        margin-bottom: 10px;
    }

    .continue-create-option {
        position: absolute;
        left: 20px;
        bottom: 20px;
        font-weight: normal;
        color: #adb7bd
    }
</style>