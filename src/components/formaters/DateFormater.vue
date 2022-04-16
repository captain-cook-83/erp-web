<template>
    <div>
        <i class="el-icon-time" v-once v-if="!hideIcon"></i>
        <!-- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString -->
        <el-tooltip v-if="Array.isArray(value)" :content="tips" placement="top" effect="light">
            <span>{{ new Date(value[1]).toLocaleString(locales || 'zh-CN', options) }}</span>
        </el-tooltip>
        <span v-else :style="'margin-left: ' + (hideIcon ? 0 : 5) + 'px'">{{ new Date(value).toLocaleString(locales || 'zh-CN', options) }}</span>
    </div>
</template>

<script>
export default {
    data () {
        return {}
    },
    computed: {
        tips () {
            if (Array.isArray(this.value)) {
                return new Date(this.value[0]).toLocaleDateString(this.locales || 'zh-CN', this.options) + ' - ' + new Date(this.value[1]).toLocaleDateString(this.locales || 'zh-CN', this.options);
            } else {
                return '';
            }
        },
        options () {
            switch (this.precision) {
                case 'year': return { timeZone: 'Asia/Shanghai', year: 'numeric' };
                case 'month': return { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit' };
                default: return { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' };
            }
        }
    },
    props: {
        value: [String, Date, Array], 
        hideIcon: Boolean,
        precision: String,
        locales: String
    }
}
</script>