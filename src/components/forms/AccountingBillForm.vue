<template>
    <div>
        <el-table :data="[ model ]" :border="border" header-cell-class-name="table-header-cell" 
                tooltip-effect="light" ref="table">
            <el-table-column v-for='colume in columes' :key="colume.prop" :prop="colume.prop" :label="colume.label" 
                    :width="colume.inputColumtWidth ? colume.inputColumtWidth : colume.width">
                <template slot-scope="scope">
                    <el-date-picker v-if="colume.type == 'Date'" :style="'width: ' + colume.inputWidth + 'px;'" v-model="scope.row[colume.prop]" 
                        align="right" :type="colume.precision" :placeholder="colume.placeholder" :editable="false" :clearable="false" 
                        :validate-event="false" :picker-options="pickerAccountingDateOptions"></el-date-picker>
                    <!-- <el-input-number v-else-if="colume.type == 'Amount'" :style="'width: ' + colume.inputWidth + 'px;'" v-model="scope.row[colume.prop]" 
                        :controls="false" :precision="2" :step="10000" :min="0" :max="100000000" tabindex="2"></el-input-number> -->
                    <el-input-number v-else-if="colume.type == 'Amount'" :style="'width: ' + colume.inputWidth + 'px;'" v-model="scope.row[colume.prop]" 
                        :controls="false" :precision="2" :step="10000" tabindex="2"></el-input-number>
                    <el-popover v-else-if="colume.type == 'User'" placement="right" width="400" v-model="userSelectorShown">
                        <resource-selector resourceURL="/users" :filters="userFilters" :tableColumes="userSelectorColumes" 
                            @selected="onUserSelected"></resource-selector>
                        <el-input slot="reference" v-model="scope.row[colume.prop]" :validate-event="false" :readonly="true" :placeholder="colume.placeholder"/>
                    </el-popover>
                    <el-select v-else-if="colume.type == 'Enum'" v-model="scope.row[colume.prop]" :placeholder="colume.placeholder" 
                            :style="'width: ' + colume.inputWidth + 'px;'">
                        <el-option v-for="item in colume.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-input v-else v-model="scope.row[colume.prop]" :validate-event="false" :placeholder="colume.placeholder"></el-input>
                </template>
            </el-table-column>
        </el-table>
        <div class="upload-container">
            <el-upload action="https://jsonplaceholder.typicode.com/posts/" list-type="picture-card" 
                :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
                <i class="el-icon-plus"></i>
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
                <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>
        </div>
        <div class="btn-container">
            <el-button @click="onCancalClicked">取 消</el-button>
            <el-button type="primary" @click="onSaveClicked">保 存</el-button>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import ResourceSelector from '../ResourceSelector.vue';

export default {
    props: {
        columes: Array,
        border: Boolean,
        fixedType: Boolean
    },
    data () {
        return {
            model: {},
            pickerAccountingDateOptions: {
                disabledDate (time) {
                    return time.getTime() > Date.now();
                }
            },
            userSelectorColumes: [
                { prop: '_order', label: '序号', width: '50' },
                { prop: 'name', label: '姓名', width: '130', overflow: true },
                { prop: 'departmentName', label: '所属部门', overflow: true }
            ],
            userFilters: {},

            dialogImageUrl: '',
            dialogVisible: false,

            userSelectorShown: false
        };
    },
    components: {
        'resource-selector': ResourceSelector
    },
    methods: {
        setModel: function (model) {
            this.model = model;
        },
        handleRemove: function (file, fileList) {
            console.log(file, fileList);
        },
        handlePictureCardPreview: function(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },
        onUserSelected: function (data) {
            Vue.set(this.model, 'handlerName', data.name);
            Vue.set(this.model, 'handlerId', data.id);

            this.userSelectorShown = false;
        },
        onCancalClicked: function () {
            this.$emit('cancel');
        },
        onSaveClicked: function () {
            let model = this.model;
            if ((!this.fixedType && model.type == null) || model.amount == null || model.signDate == null || model.handlerName == null) {
                this.$message({
                    showClose: true,
                    message: "请选择 '日期' 和 '经手人'，并输入 '金额'",
                    type: 'error'
                });
            } else {
                this.$emit('save', model);
            }
        }
    }
}
</script>

<style scoped>
    .upload-container {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .btn-container {
        text-align: center;
        width: 100%;
        border-top: 1px solid rgb(231, 218, 218);
        padding-top: 10px;
    }
</style>

