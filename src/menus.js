export default [
    {
        index: '0',
        title: 'Project Transaction',
        defaultActive: '0-0',
        subMenus: [
            // {
            //     index: '0-0',
            //     title: 'Dashboard', 
            //     icon: 'el-icon-menu', 
            //     route: '/dashboard'
            // },
            {
                index: '0-0',
                title: '项目视图', 
                icon: 'el-icon-menu', 
                route: '/projectView'
            },
            {
                index: '0-1',
                title: '月度核算', 
                icon: 'el-icon-date', 
                subMenus: [
                    {
                        index: '0-1-0',
                        title: '数据填报', 
                        icon: 'el-icon-edit-outline', 
                        route: '/accountingReport'
                    },
                    {
                        index: '0-1-1',
                        title: '数据审计', 
                        icon: 'el-icon-view', 
                        route: '/accountingAudit'
                    }
                ]
            },
            {
                index: '0-2',
                title: '合同管理', 
                icon: 'el-icon-document', 
                route: '/contractAdmin'
            },
            {
                index: '0-3',
                title: '资源管理', 
                icon: 'el-icon-edit', 
                subMenus: [
                    {
                        index: '0-3-0',
                        title: '项目管理', 
                        icon: 'el-icon-location', 
                        route: '/projectAdmin'
                    },
                    {
                        index: '0-3-1',
                        title: '客户管理', 
                        icon: 'el-icon-phone', 
                        route: '/customerAdmin'
                    },
                    {
                        index: '0-3-2',
                        title: '公司管理', 
                        icon: 'el-icon-goods', 
                        route: '/companyAdmin'
                    }
                ]
            },
            {
                index: '0-4',
                title: '机构管理', 
                icon: 'el-icon-star-off', 
                subMenus: [
                    {
                        index: '0-4-0',
                        title: '部门管理', 
                        icon: 'el-icon-news', 
                        route: '/departmentAdmin'
                    },
                    {
                        index: '0-4-1',
                        title: '人员及权限', 
                        icon: 'el-icon-mobile-phone', 
                        route: '/userAdmin'
                    }
                ]
            }
        ]
    }
]