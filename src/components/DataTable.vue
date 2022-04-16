<template>
    <el-table class="data-table" :data="data" :height="height" :max-height="height" :border="border" header-cell-class-name="table-header-cell" 
            tooltip-effect="light" :highlight-current-row="true" @current-change="onSelectionChanged" @selection-change="onMultiSelectionChanged" ref="dataTable">
        <el-table-column type="selection" :width="selectorWidth" v-if="miltiSelectable"></el-table-column>
        <el-table-column v-for='colume in columes' :key="colume.prop" :prop="colume.prop" :label="colume.label" :width="colume.width" 
                :show-overflow-tooltip="colume.overflow" :sortable="colume.sortable">
            <template slot-scope="scope">
                <date-formater v-if="colume.type == 'Date'" :value="scope.row[colume.prop]" 
                    :precision="colume.precision" :hideIcon="colume.hideIcon" :locales="colume.locales"></date-formater>
                <money-formater v-else-if="colume.type == 'Amount'" :value="scope.row[colume.prop]"></money-formater>
                <status-formater v-else-if="colume.type == 'Status'" :model="scope.row" :field="colume.prop" :route="route"
                    @edit="onEvent" @commit="onEvent" @revert="onEvent" @audit="onEvent"></status-formater>
                <el-button v-else-if="colume.type == 'Action'" type="text">{{ colume.text }}</el-button>
                <percent-formater v-else-if="colume.type == 'Percent'" :value="scope.row[colume.prop]"></percent-formater>
                <enum-formater v-else-if="colume.type == 'Enum'" :value="scope.row[colume.prop]" :formater="colume.formater"></enum-formater>
                <span v-else-if="colume.type == 'Hidden'">{{ scope.row[colume.prop] ? '已删除' : '' }}</span>
                <span v-else>{{ scope.row[colume.prop] }}</span>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import DateFormater from './formaters/DateFormater.vue';
import MoneyFormater from './formaters/MoneyFormater.vue';
import PercentFormater from './formaters/PercentFormater.vue';
import StatusFormater from './formaters/StatusFormater.vue';
import EnumFormater from './formaters/EnumFormater.vue';

export default {
    components: {
        'date-formater': DateFormater,
        'money-formater': MoneyFormater,
        'percent-formater': PercentFormater,
        'status-formater': StatusFormater,
        'enum-formater': EnumFormater
    },
    props: {
        border: Boolean,
        height: String,
        columes: Array,
        data: Array,
        route: Object,
        miltiSelectable: Boolean,
        selectorWidth: Number,
        rowKey: String                  //暂时停用，数据修改后导致隐藏行情况
    },
    data () {
        return {};
    },
    methods: {
        onSelectionChanged: function (data)  {
            if (data) {
                this.$refs.dataTable.clearSelection();
                this.$refs.dataTable.toggleRowSelection(data, true);
            }
        },
        onMultiSelectionChanged: function (data)  {
            this.$emit('selection-change', data);
        },
        onEvent: function (data, key) {
            this.$emit(key, data);
        },
        toggleRowSelection: function (data, status) {
            this.$nextTick(() => {
                this.$refs.dataTable.toggleRowSelection(data, status);
            });
        }
    }
}
</script>

<style>
    .el-table {
        text-align: left;
        color: #283a44;
    }

    /* .data-table .el-table--enable-row-hover .el-table__body tr:hover>td{
        background-color: rgb(247, 248, 193) !important;
    } */

    /* .data-table .el-table__body tr.current-row>td {
        background-color: rgb(247, 248, 193) !important;
    } */
</style>


<style scoped>
    .el-button {
        margin-top: 0;
        margin-bottom: 0;
    }
</style>


