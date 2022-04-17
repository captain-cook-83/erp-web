<template>
    <div class="base">
        <el-table :data="tableData" header-cell-class-name="table-header-cell" tooltip-effect="light" :height="tableHelght" :border="border"
                row-key="id" @row-click="onSelected">
            <el-table-column v-for='colume in tableColumes' :key="colume.prop" :prop="colume.prop" :label="colume.label" :width="colume.width" 
                :show-overflow-tooltip="colume.overflow">
                <template slot-scope="scope">
                    <date-formater v-if="colume.type == 'Date'" :value="scope.row[colume.prop]" 
                    :precision="colume.precision" :hideIcon="colume.hideIcon" :locales="colume.locales"></date-formater>
                    <money-formater v-else-if="colume.type == 'Amount'" :value="scope.row[colume.prop]"></money-formater>
                    <status-formater v-else-if="colume.type == 'Status'" :model="scope.row" :field="colume.prop" :route="route"
                        @edit="onEvent" @commit="onEvent" @revert="onEvent" @audit="onEvent"></status-formater>
                    <el-button v-else-if="colume.type == 'Action'" type="text">{{ colume.text }}</el-button>
                    <percent-formater v-else-if="colume.type == 'Percent'" :value="scope.row[colume.prop]"></percent-formater>
                    <enum-formater v-else-if="colume.type == 'Enum'" :value="scope.row[colume.prop]" :formater="colume.formater"></enum-formater>
                    <span v-else>{{ scope.row[colume.prop] }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-input placeholder="请输入关键词" v-model="searchText" size="small" v-if="searchable" :clearable="true" 
                @clear="searchData(null)" @blur="searchData(searchText)" @keyup.enter.native="searchData(searchText)" ref="searchInput">
            <el-button slot="prepend" icon="el-icon-search" @click="searchData(searchText)"></el-button>
        </el-input>
        <el-pagination v-if="!hidePaging" background layout="total, sizes, prev, pager, next" :page-sizes="[20, 30, 50, 100]" :total="totalSize" 
            :page-size="paging.pageSize" :current-page="paging.pageNumber" @current-change="onCurrentPageChange" @size-change="onPageSizeChange"/>
    </div>
</template>

<script>
import Axios from 'axios';
import { Base64 } from 'js-base64';
import Utils from '../utils';

import DateFormater from './formaters/DateFormater.vue';
import MoneyFormater from './formaters/MoneyFormater.vue';
import PercentFormater from './formaters/PercentFormater.vue';

export default {
    props: {
        resourceURL: String,
        filters: Object,
        tableColumes: Array,
        height: String,
        border: Boolean,
        hidePaging: Boolean,
        dataProcessor: Function,
        searchable: Boolean,
        defaultPageSize: Number
    },
    computed: {
        tableHelght () {
            return this.height ? this.height : '75vh';
        }
    },
    data () {
        return {
            tableData: [],
            totalSize: 0,
            paging: {
                pageSize: this.defaultPageSize || 20,
                pageNumber: 1,
                fetchTotal: true
            },

            searchText: null
        }
    },
    components: {
        'date-formater': DateFormater,
        'money-formater': MoneyFormater,
        'percent-formater': PercentFormater
    },
    mounted: function () {
        this.loadData();
    },
    watch: {
        '$route' (to, from) {
            this.reload();
        },
        filters (value) {
            if (value) {
                this.reload();
            }
        }
    },
    methods: {
        reload: function () {
            this.tableData.splice(0);
            this.totalSize = 0;
            this.paging = {
                pageSize: this.defaultPageSize,
                pageNumber: 1,
                fetchTotal: true
            };
            this.loadData();
        },
        loadData: function () {
            let params = this.paging;
            if (this.searchText) {
                params = Utils.merge(params, { search: this.searchText });
            } else if (this.filters) {
                let filtersBase64 = Base64.encode(JSON.stringify(this.filters));
                params = Utils.merge(params, { filters: filtersBase64 });
            }
            
            this.$emit('loading', true);
            Axios.get(this.resourceURL, { params }).then(response => {
                let data = response.data;
                if (typeof data.totalSize === 'number') {
                    this.totalSize = data.totalSize;
                    this.paging.fetchTotal = false;
                }

                let list;
                if (typeof this.dataProcessor === 'function') {
                    list = this.dataProcessor(data.content);
                } else {
                    list = data.content;
                }

                let paging = this.paging;
                for (let i = 0; i < list.length; i++) {
                    list[i]._order = paging.pageSize * (paging.pageNumber - 1) + i + 1;
                }
                this.tableData = list;

                // this.$message({
                //     showClose: true,
                //     message: '列表数据已刷新'
                // });
            }).catch(error => {
                this.$notify.error({
                    title: '错误',
                    message: '数据查询失败，请刷新重试'
                });
            }).then(() => {
                this.$emit('loading', false);
            });
        },
        searchData: function (text) {
            if (this.searchable) {
                this.$refs.searchInput.blur();
                this.searchText = text;
                this.reload();
            } else {
                this.$message({
                    showClose: true,
                    message: '选择器未开启搜索功能',
                    type: 'warning'
                });
            }
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
        onSelected: function (data) {
            this.$emit('selected', data);
        }
    }
}
</script>

<style scoped>
    .base {
        width: 100%;
        height: 100%;
        color: #283a44;
        text-align: right;
    }

    .el-table {
        text-align: left;
        color: #283a44;
        margin-bottom: 10px;
    }

    .el-input {
        position: absolute;
        left: 20px;
        bottom: 12px;
        width: 30%;
    }
</style>