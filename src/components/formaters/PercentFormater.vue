<template>
    <span>{{ formatPercent(value) }}</span>
</template>

<script>
export default {
    data () {
        return {}
    },
    props: ['value'],
    methods: {
        formatPercent: value => {
            if (isNaN(value)) {
                return '-';
            } else {
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
                return value.toLocaleString('zh-CN', { style: 'percent', minimumFractionDigits: 2 });
            }
        }
    }
}
</script>