import Auths from './auths.js';
import Utils from './utils.js';

import Dashboard from './templates/Dashboard.vue'
import ProjectView from './templates/ProjectView.vue'
import ResourceAdmin from './templates/ResourceAdmin.vue'
import ContractForm from './components/forms/ContractForm.vue'
import CustomerForm from './components/forms/CustomerForm.vue'
import CompanyForm from './components/forms/CompanyForm.vue'
import ProjectForm from './components/forms/ProjectForm.vue'
import AccountingFormSourceForm from './components/forms/AccountingFormSourceForm.vue'
import AccountingForm from './components/forms/AccountingForm.vue'
import AccountingAudit from './components/forms/AccountingAudit.vue'
import ContractAudit from './components/forms/ContractAudit.vue'
import UserForm from './components/forms/UserForm.vue'
import DepartmentForm from './components/forms/DepartmentForm.vue'

/*
    上下文操作定义
*/

const refreshCmd = {
    type: 'primary',
    key: 'refresh',
    icon: 'el-icon-refresh',
    label: '刷新',
    multi: true
}

const createCmd = {
    type: 'primary',
    key: 'create',
    icon: 'el-icon-plus',
    label: '新建',
    multi: true
}

const editCmd = {
    type: 'primary',
    key: 'edit',
    icon: 'el-icon-edit',
    label: '修改'
}

const commitCmd = {
    type: 'primary',
    key: 'commit',
    icon: 'el-icon-upload2',
    label: '提交'
}

const revertCmd = {
    type: 'primary',
    key: 'revert',
    icon: 'el-icon-download',
    label: '撤销'
}

const auditCmd = {
    type: 'primary',
    key: 'audit', 
    icon: 'el-icon-view',
    label: '审核'
}

const reAutitCmd = {
    type: 'primary',
    key: 'audit', 
    icon: 'el-icon-view',
    label: '复核'
}

const deleteCmd = {
    type: 'danger',
    key: 'delete',
    icon: 'el-icon-delete',
    label: '删除',
    multi: true
}

const bannerDynamic = (route, models, field) => {
    let status = [];
    let roles = Auths.session.roles;
    models.forEach(element => {
        if (element.hidden) {
            status.push([]);
        } else {
            let elementStatus = [];
            let fieldValue;
            if (typeof route.redirect === 'function') {
                fieldValue = route.redirect(element, field);
            } else {
                fieldValue = element[field];
            }

            if (element.operatorId == Auths.session.id) {
                let s = route[fieldValue];
                if (s && Array.isArray(s.bannerCmds)) {
                    elementStatus.push(s.bannerCmds);
                }
            }

            for (let i = 0; i < roles.length; i++) {
                let path = fieldValue + '-' + roles[i];
                let s = route[path];
                if (s && Array.isArray(s.bannerCmds)) {
                    elementStatus.push(s.bannerCmds);
                }
            }

            status.push(Utils.union(elementStatus, 'key'));
        }
    });

    status = Utils.intersect(status, 'key');
    // status = Utils.union([ staticDynamic(route), status ], 'key');
    status = Utils.union([ status, staticDynamic(route, models) ], 'key');
    return status;
}

const staticDynamic = (route, models) => {
    let status = [];
    let roles = Auths.session.roles;
    for (let i = 0; i < roles.length; i++) {
        let s = route[roles[i]];
        if (s && Array.isArray(s.bannerCmds)) {
            status.push(s.bannerCmds);
        }
    }

    status = Utils.union(status, 'key');
    if (models.length) {
        return status;
    } else {
        return status.filter(s => s.multi);
    }
}

const dynamic = (route, model, value) => {
    let ownerId = model.operatorId;
    if (ownerId == Auths.session.id) return route[value];

    let roles = Auths.session.roles;
    for (let i = 0; i < roles.length; i++) {
        let path = value + '-' + roles[i];
        if (route[path]) return route[path];
    }

    return null;
}

/*
    过滤器条件定义
*/

const customerId = { 
    prop: 'customerId', label: '客户名称', type: 'Resource', placeholder: '按客户筛选', resourceURL: '/customers', 
    displayProp: 'customerName', displaySource: 'name',
    filters: {}, 
    selectorColumes: [
        { prop: '_order', label: '序号', width: '50' },
        { prop: 'name', label: '客户名称', overflow: true }
    ]
}

const projectId = {
    prop: 'projectId', label: '项目名称', type: 'Resource', placeholder: '按项目筛选', resourceURL: '/projects', 
    displayProp: 'projectName', displaySource: 'name',
    filters: {}, 
    searchable: true,
    selectorWidth: '550',
    selectorColumes: [
        { prop: '_order', label: '序号', width: '50' },
        { prop: 'name', label: '项目名称', width: '300', overflow: true },
        { prop: 'customerName', label: '客户名称', overflow: true }
    ]
}

const contractId = { 
    prop: 'contractId', label: '所属合同', type: 'Resource', placeholder: '按合同筛选', resourceURL: '/contracts', 
    displayProp: 'contractTitle', displaySource: 'title',
    filters: {}, 
    searchable: true,
    selectorWidth: '550',
    selectorColumes: [
        { prop: '_order', label: '序号', width: '50' },
        { prop: 'title', label: '合同标题', width: '300', overflow: true },
        { prop: 'projectName', label: '项目名称', overflow: true }
    ]
}

const operatorId = { 
    prop: 'operatorId', label: '录入者', type: 'Resource', placeholder: '按录入者筛选', resourceURL: '/users', 
    displayProp: 'operatorName', displaySource: 'name',
    filters: {}, 
    selectorColumes: [
        { prop: '_order', label: '序号', width: '50' },
        { prop: 'name', label: '姓名', width: '130', overflow: true },
        { prop: 'departmentName', label: '所属部门', overflow: true }
    ]
}

const departmentId = {
    prop: 'departmentId', label: '部门', type: 'Resource', placeholder: '按部门筛选', resourceURL: '/departments', 
    displayProp: 'departmentName', displaySource: 'name',
    filters: {}, 
    selectorColumes: [
        { prop: '_order', label: '序号', width: '50' },
        { prop: 'name', label: '部门名称', width: '150', overflow: true },
        { prop: 'managerName', label: '负责人', overflow: true }
    ]
}

const companyId = {
    prop: 'companyId', label: '记账公司', type: 'Resource', placeholder: '按记账公司筛选', resourceURL: '/companies', 
    displayProp: 'companyName', displaySource: 'name',
    filters: {}, 
    selectorColumes: [
        { prop: '_order', label: '序号', width: '50' },
        { prop: 'name', label: '公司名称', width: '150', overflow: true }
    ]
}

const createTime = { prop: 'createTime', label: '填表日期', type: 'Date', placeholder: '按填表日期筛选'}

const signDate = { prop: 'signDate', label: '签署日期', type: 'Date', placeholder: '按签署日期筛选'}

const accountingDate = { prop: 'accountingDate', label: '核算月份', type: 'Date', range: 'monthrange', placeholder: '按核算月份筛选'}

const status = { 
    prop: 'status', label: '状态', type: 'Enum', placeholder: '按状态筛选',
    options: [
        { label: '编辑中', value: 0 },
        { label: '待审核', value: 1 },
        { label: '被驳回', value: 2 },
        { label: '正常', value: 3 },
        { label: '已归档', value: 4 }
    ]
}

const sourceType = { 
    prop: 'type', label: '阶段', type: 'Enum', placeholder: '按阶段筛选',
    options: [
        { label: '发生', value: 1 },
        { label: '开票', value: 2 },
        { label: '回款', value: 3 },
    ]
}

/*
    组件属性配置
*/

const accountingReportProps = {
    resourceURL: '/contractItemSources',
    title: '月度数据填报',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '800px',
    dialogTop: '5vh',
    tableColumes: [
        { prop: 'createTime', label: '填表日期', width: '110', type: 'Date', hideIcon: true },
        { prop: 'contractTitle', label: '合同标题', overflow: true },
        { prop: 'accountingDate', label: '核算月份', width: '110', type: 'Date', precision: 'month', hideIcon: true },
        { prop: 'periodDates', label: '截止日期', width: '110', type: 'Date', hideIcon: true },
        { prop: 'type', label: '填报阶段', width: '80', type: 'Enum', formater: {
            '1': '发生',
            '2': '开票',
            '3': '回款'
        } },
        { prop: 'amount', label: '金额', width: '135', type: 'Amount' },
        { prop: 'operatorName', label: '录入者', width: '80', overflow: true },
        { prop: 'remarks', label: '备注', width: '200', overflow: true },
        { prop: 'status', label: '状态', width: '60', type: 'Status' }
    ],
    statusCtlFiled: 'status',
    statusRoute: {
        '0': {
            tips: '正在编辑',
            icon: 'el-icon-edit',
            msg: '您可以继续修改数据，或提交审计',
            bannerCmds: [ editCmd, commitCmd, deleteCmd ],
            cmds: [
                {
                    key: 'commit',
                    icon: 'el-icon-upload2',
                    label: '提交'
                },
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                }
            ]
        },
        '1': {
            tips: '等待审核',
            icon: 'el-icon-loading',
            msg: '正在等待审核，您可以撤销审计后重新修改数据',
            bannerCmds: [ revertCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'revert',
                    icon: 'el-icon-download',
                    label: '撤销'
                }
            ]
        },
        '2': {
            tips: '被驳回',
            icon: 'el-icon-error',
            msg: '数据被驳回，请重新修改后再提交',
            bannerCmds: [ editCmd, deleteCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                }
            ]
        },
        '3': {
            icon: 'el-icon-success',
            tips: '正常'
        },
        '4': {
            icon: 'el-icon-upload',
            tips: '已归档'
        },
        'REPORTER': {
            bannerCmds: [ refreshCmd, createCmd ]
        },
        'AUDITER': {
            bannerCmds: [ refreshCmd ]
        },
        'MANAGER': {
            bannerCmds: [ refreshCmd ]
        },
        bannerDynamic,
        dynamic
    },
    dialogTitle: '月度数据填报',
    filterConditions: [
        contractId, operatorId, createTime, accountingDate, status, sourceType
    ],
    formComponent: AccountingFormSourceForm
}

const accountingAuditProps = {
    resourceURL: '/contractItems',
    title: '月度数据审计',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '800px',
    dialogTop: '5vh',
    tableColumes: [
        { prop: 'createTime', label: '填表日期', width: '110', type: 'Date', hideIcon: true },
        { prop: 'contractTitle', label: '合同标题', overflow: true },
        { prop: 'accountingDate', label: '核算月份', width: '110', type: 'Date', precision: 'month', hideIcon: true },
        { prop: 'periodDates', label: '截止日期', width: '110', type: 'Date', hideIcon: true },
        { prop: 'occurAmount', label: '当期发生', width: '135', type: 'Amount' },
        { prop: 'invoiceAmount', label: '当期开票', width: '135', type: 'Amount' },
        { prop: 'cashAmount', label: '当期回款', width: '135', type: 'Amount' },
        // { prop: 'projectName', label: '项目名称', width: '160', overflow: true },
        { prop: 'operatorName', label: '录入者', width: '80', overflow: true },
        { prop: 'status', label: '状态', width: '60', type: 'Status' }
    ],
    statusCtlFiled: 'status',
    statusRoute: {
        '-1': {
            tips: '分阶段填报',
            icon: 'el-icon-time',
            bannerCmds: [ deleteCmd ]
        },
        '0': {
            tips: '正在编辑',
            icon: 'el-icon-edit',
            msg: '您可以继续修改数据，或提交审计',
            bannerCmds: [ editCmd, commitCmd, deleteCmd ],
            cmds: [
                {
                    key: 'commit',
                    icon: 'el-icon-upload2',
                    label: '提交'
                },
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                }
            ]
        },
        '1': {
            tips: '等待审核',
            icon: 'el-icon-loading',
            msg: '正在等待审核，您可以撤销审计后重新修改数据',
            bannerCmds: [ revertCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'revert',
                    icon: 'el-icon-download',
                    label: '撤销'
                }
            ]
        },
        '2': {
            tips: '被驳回',
            icon: 'el-icon-error',
            msg: '数据被驳回，请重新修改后再提交',
            bannerCmds: [ editCmd, deleteCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                }
            ]
        },
        '3': {
            icon: 'el-icon-success',
            tips: '正常'
        },
        '4': {
            icon: 'el-icon-upload',
            tips: '已归档'
        },
        '1-AUDITER': {
            tips: '等待审核',
            icon: 'el-icon-loading',
            msg: '请认真审核核算数据，确认无误后予以确认',
            bannerCmds: [ auditCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'audit', 
                    icon: 'el-icon-view',
                    label: '审核'
                }
            ]
        },
        '3-MANAGER': {
            tips: '审核通过',
            icon: 'el-icon-success',
            msg: '可以对数据进行复核，并驳回审核',
            bannerCmds: [ reAutitCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'audit', 
                    icon: 'el-icon-view',
                    label: '复核'
                }
            ]
        },
        'REPORTER': {
            bannerCmds: [ refreshCmd, createCmd ]
        },
        'AUDITER': {
            bannerCmds: [ refreshCmd ]
        },
        'MANAGER': {
            bannerCmds: [ refreshCmd ]
        },
        bannerDynamic,
        dynamic,
        redirect: function (model, field) {
            if (model.derived && [0 , 2].indexOf(model[field]) != -1) {
                return -1;
            } else {
                return model[field];
            }
        }
    },
    dialogTitle: '月度数据审计',
    filterConditions: [
        projectId, contractId, operatorId, createTime, accountingDate, status
    ],
    formComponent: AccountingForm,
    auditComponent: AccountingAudit
}

const contractAdminProps = {
    resourceURL: '/contracts',
    title: '合同信息管理',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '550px',
    dialogTop: '15vh',
    tableColumes: [
        { prop: 'signDate', label: '签署日期', width: '130', type: 'Date' },
        { prop: 'title', label: '标题', overflow: true },
        { prop: 'amount', label: '金额', width: '135', type: 'Amount' },
        { prop: 'serialNumber', label: '合同编号', width: '160', overflow: true },
        { prop: 'projectName', label: '项目名称', width: '200', overflow: true },
        { prop: 'departmentName', label: '所属部门', width: '110' },
        { prop: 'companyName', label: '记账公司', width: '110' },
        { prop: 'operatorName', label: '录入者', width: '80', overflow: true },
        { prop: 'status', label: '状态', width: '60', type: 'Status' }
    ],
    statusCtlFiled: 'status',
    fefreshAfterEdit: true,
    statusRoute: {
        '0': {
            tips: '正在编辑',
            icon: 'el-icon-edit',
            msg: '您可以继续修改数据，或提交审计',
            bannerCmds: [ editCmd, commitCmd, deleteCmd ],
            cmds: [
                {
                    key: 'commit',
                    icon: 'el-icon-upload2',
                    label: '提交'
                },
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                }
            ]
        },
        '1': {
            tips: '等待审核',
            icon: 'el-icon-loading',
            msg: '正在等待审核，您可以撤销审计后重新修改数据',
            bannerCmds: [ revertCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'revert',
                    icon: 'el-icon-download',
                    label: '撤销'
                }
            ]
        },
        '2': {
            tips: '被驳回',
            icon: 'el-icon-error',
            msg: '数据被驳回，请重新修改后再提交',
            bannerCmds: [ editCmd, deleteCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                }
            ]
        },
        '3': {
            icon: 'el-icon-success',
            tips: '正常'
        },
        '4': {
            icon: 'el-icon-upload',
            tips: '已归档'
        },
        '1-AUDITER': {
            tips: '等待审核',
            icon: 'el-icon-loading',
            msg: '请认真审核核算数据，确认无误后予以确认',
            bannerCmds: [ editCmd, auditCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'edit',
                    icon: 'el-icon-edit',
                    label: '修改'
                },
                {
                    primary: true,
                    key: 'audit', 
                    icon: 'el-icon-view',
                    label: '审核'
                }
            ]
        },
        '3-MANAGER': {
            tips: '审核通过',
            icon: 'el-icon-success',
            msg: '可以对数据进行复核，并驳回审核',
            bannerCmds: [ reAutitCmd ],
            cmds: [
                {
                    primary: true,
                    key: 'audit', 
                    icon: 'el-icon-view',
                    label: '复核'
                }
            ]
        },
        'REPORTER': {
            bannerCmds: [ refreshCmd, createCmd ]
        },
        'AUDITER': {
            bannerCmds: [ refreshCmd ]
        },
        'MANAGER': {
            bannerCmds: [ refreshCmd ]
        },
        bannerDynamic,
        dynamic
    },
    dialogTitle: '合同信息',
    filterConditions: [
        projectId, departmentId, companyId, operatorId, signDate, status
    ],
    formComponent: ContractForm,
    auditComponent: ContractAudit
}

const projectAdminProps = {
    resourceURL: '/projects',
    title: '项目信息管理',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '500px',
    dialogTop: '15vh',
    tableColumes: [
        { prop: '_order', label: '序号', width: '100' },
        { prop: 'name', label: '项目名称' },
        { prop: 'customerName', label: '客户名称' },
        { prop: 'hidden', label: '状态', width: '100', type: 'Hidden' }
    ],
    dialogTitle: '项目信息',
    filterConditions: [
        customerId
    ],
    formComponent: ProjectForm,
    auditComponent: null,
    statusCtlFiled: 'id',
    statusRoute: {
        'MANAGER': {
            tips: '修改',
            icon: 'el-icon-success',
            msg: '修改数据',
            bannerCmds: [ refreshCmd, createCmd, editCmd, deleteCmd ]
        },
        bannerDynamic: staticDynamic
    }
};

const customerAdminProps = {
    resourceURL: '/customers',
    title: '客户信息管理',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '500px',
    dialogTop: '15vh',
    tableColumes: [
        { prop: '_order', label: '序号', width: '100' },
        { prop: 'name', label: '客户名称' }
    ],
    dialogTitle: '客户信息',
    filterConditions: null,
    formComponent: CustomerForm,
    auditComponent: null,
    statusCtlFiled: 'id',
    statusRoute: {
        'MANAGER': {
            tips: '修改',
            icon: 'el-icon-success',
            msg: '修改数据',
            bannerCmds: [ refreshCmd, createCmd, editCmd, deleteCmd ]
        },
        bannerDynamic: staticDynamic
    }
};

const companyAdminProps = {
    resourceURL: '/companies',
    title: '账目公司管理',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '500px',
    dialogTop: '15vh',
    tableColumes: [
        { prop: '_order', label: '序号', width: '100' },
        { prop: 'name', label: '公司名称' }
    ],
    dialogTitle: '公司信息',
    filterConditions: null,
    formComponent: CompanyForm,
    auditComponent: null,
    statusCtlFiled: 'id',
    statusRoute: {
        'MANAGER': {
            tips: '修改',
            icon: 'el-icon-success',
            msg: '修改数据',
            bannerCmds: [ refreshCmd, createCmd, editCmd, deleteCmd ]
        },
        bannerDynamic: staticDynamic
    }
};

const userAdminProps = {
    resourceURL: '/users',
    title: '用户信息管理',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '500px',
    dialogTop: '15vh',
    tableColumes: [
        { prop: '_order', label: '序号', width: '100' },
        { prop: 'name', label: '用户名称' },
        { prop: 'username', label: '登录名' },
        { prop: 'departmentName', label: '所属部门' },
        { prop: 'roles', label: '权限角色', type: 'Enum', formater: {
            'MANAGER': '管理者',
            'AUDITER': '审核人员',
            'REPORTER': '录入人员'
        }}
    ],
    dialogTitle: '用户信息',
    filterConditions: [
        departmentId
    ],
    formComponent: UserForm,
    auditComponent: null,
    statusCtlFiled: 'id',
    statusRoute: {
        'MANAGER': {
            tips: '修改',
            icon: 'el-icon-success',
            msg: '修改信息',
            bannerCmds: [ refreshCmd, createCmd, editCmd, deleteCmd ]
        },
        bannerDynamic: staticDynamic
    }
};

const departmentAdminProps = {
    resourceURL: '/departments',
    title: '部门信息管理',
    underTitle: '<span style="color: #717a7f">从最不满意的客户身上学得最多！</span>',
    dialogWidth: '500px',
    dialogTop: '15vh',
    tableColumes: [
        { prop: '_order', label: '序号', width: '100' },
        { prop: 'name', label: '部门名称' },
        { prop: 'managerName', label: '负责人' }
    ],
    dialogTitle: '部门信息',
    filterConditions: null,
    formComponent: DepartmentForm,
    auditComponent: null,
    statusCtlFiled: 'id',
    statusRoute: {
        'MANAGER': {
            tips: '修改',
            icon: 'el-icon-success',
            msg: '修改信息',
            bannerCmds: [ refreshCmd, createCmd, editCmd, deleteCmd ]
        },
        bannerDynamic: staticDynamic
    }
}

export default [
    { path: '/dashboard', component: Dashboard, props: { message: '0' } },
    { path: '/projectView', component: ProjectView, props: { message: '1' } },
    { path: '/accountingReport', component: ResourceAdmin, props: accountingReportProps },
    { path: '/accountingAudit', component: ResourceAdmin, props: accountingAuditProps },
    { path: '/contractAdmin', component: ResourceAdmin, props: contractAdminProps },
    { path: '/projectAdmin', component: ResourceAdmin, props: projectAdminProps },
    { path: '/customerAdmin', component: ResourceAdmin, props: customerAdminProps },
    { path: '/companyAdmin', component: ResourceAdmin, props: companyAdminProps },
    { path: '/userAdmin', component: ResourceAdmin, props: userAdminProps },
    { path: '/departmentAdmin', component: ResourceAdmin, props: departmentAdminProps },
]