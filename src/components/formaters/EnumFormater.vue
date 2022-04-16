<template>
    <span>{{ format(value) }}</span>
</template>

<script>
export default {
    data () {
        return {}
    },
    props: { formater: Object, value: [Number, String] },
    methods: {
        format: function(value) {
            if (Array.isArray(value)) {
                return value.map(ele => this.formater[ele]).join(', ');
            } else if (typeof value === 'string' && value.indexOf(',') != -1) {
                let segments = value.split(',');
                return segments.map(ele => this.formater[ele.trim()]).join(', ');
            } else {
                return this.formater[value];
            }
        }
    }
}
</script>