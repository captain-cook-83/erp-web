<template>
    <el-form :model="model" :rules="rules" ref="form">
        <el-form-item label="公司名称" label-width="80px" prop="name">
            <el-input v-model="model.name" placeholder="请输入公司名称" :validate-event="false"
                maxlength="32" auto-complete="off" :clearable="true" :autofocus="true" tabindex="1"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    data () {
        return {
            model: {},
            rules: {
                name: [
                    { required: true, message: '请输入公司名称', trigger: 'blur' },
                    { min: 2, max: 32, message: '长度限制在 2 到 32 个汉字', trigger: 'blur' }
                ]
            }
        }
    },
    watch: {
        visible: function (v) {
            console.log(v);
        }
    },
    methods: {
        setModel: function (model) {
            this.model = model;
        },
        getModel: function () {
            return this.model;
        },
        validate: function (callback) {
            this.$refs.form.validate(callback);
        },
        clearValidate: function () {
            this.$refs.form.clearValidate();
        }
    }
}
</script>
