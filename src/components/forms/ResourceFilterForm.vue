<template>
    <el-form :model="model" ref="form">
        <el-form-item v-for="condition in conditions" :key="condition.prop" :label="condition.label" label-width="80px" :prop="condition.prop">
            <el-popover v-if="condition.type == 'Resource'" placement="right" :width="condition.selectorWidth || '400'" trigger="focus">
                <resource-selector :resourceURL="condition.resourceURL" :filters="condition.filters" :tableColumes="condition.selectorColumes" 
                    :searchable="condition.searchable" @selected="onResourceSelected(condition, $event)"/>
                <el-input slot="reference" v-model="model[condition.displayProp]" suffix-icon='el-icon-arrow-down' :validate-event="false" 
                    :placeholder="condition.placeholder" clearable @clear='onResourceClear(condition)'/>
            </el-popover>
            <el-date-picker v-if="condition.type == 'Date'" v-model="model[condition.prop]" :type="condition.range || 'daterange'" align="right" unlink-panels 
                range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="dateOptions"/>
            <el-select v-else-if="condition.type == 'Enum'" v-model="model[condition.prop]" :placeholder="condition.placeholder" clearable>
                <el-option v-for="item in condition.options" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
        </el-form-item>
    </el-form>
</template>

<script>
import Vue from 'vue';
import ResourceSelector from '../ResourceSelector.vue';

const DAY_MS = 24 * 3600 * 1000;

export default {
    props: {
        conditions: Array
    },
    data () {
        return {
            // model: JSON.parse('{"createDate":["2019-01-05T01:31:01.769Z","2019-04-05T01:31:01.769Z"],"accountingDate":["2019-03-06T01:31:03.425Z","2019-04-05T01:31:03.425Z"],"status":3,"projectId":23,"projectName":"北京市海淀区翠湖科技园项目","operatorId":1,"operatorName":"ZHANG-ZA"}'),
            model: {},
            dateOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        end.setHours(23, 59, 59);

                        const start = new Date();
                        start.setTime(end.getTime() - DAY_MS * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        end.setHours(23, 59, 59);

                        const start = new Date();
                        start.setTime(end.getTime() - DAY_MS * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        end.setHours(23, 59, 59);

                        const start = new Date();
                        start.setTime(end.getTime() - DAY_MS * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            }
        };
    },
    components: {
        'resource-selector': ResourceSelector
    },
    methods: {
        setModel: function (model) {
            this.model = model;
        },
        getModel: function () {
            let result = {};
            for (let i = 0; i < this.conditions.length; i++) {
                let condition = this.conditions[i];
                let value = this.model[condition.prop];
                if (value || typeof value === 'number') {
                    if (condition.type == 'Date') {
                        let dates = [];
                        for (let j = 0; j < value.length; j++) {
                            dates[j] = value[j].getTime();
                        }
                        value = dates;
                    }
                    result[condition.prop] = value;
                }
            }

            for (let k in result) {
                return result 
            }
            return null;
        },
        onResourceSelected: function (condition, resource) {
            Vue.set(this.model, condition.prop, resource.id);
            Vue.set(this.model, condition.displayProp, resource[condition.displaySource]);
        },
        onResourceClear: function (condition) {
            Vue.set(this.model, condition.prop, null);
        },
        clear: function () {
            this.model = {};
        }
    }
}
</script>