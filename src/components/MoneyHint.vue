<template>
    <span class="base">{{ hintMoney(value) }}</span>
</template>

<script>
export default {
    data () {
        return {}
    },
    props: ['value'],
    methods: {
        hintMoney: value => {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
            if (!value) value = 0;
            return value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
        }
    }
}
</script>

<style scoped>
    .base {
        margin: 0 20px 0 20px;
        color: green;
    }
</style>
