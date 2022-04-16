<template>
    <span class="money-formater">{{ formatMoney(value) }}</span>
</template>

<script>
export default {
    data () {
        return {}
    },
    props: {
        value: [Number, String],
        package: Boolean
    },
    methods: {
        formatMoney (value) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
            if (!value) value = 0;
            value = value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });
            return this.package ? '( ' + value + ' )' : value;
        }
    }
}
</script>
