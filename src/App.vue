<template>
    <div id="app">
        <el-container>
            <el-header height="60px">
                <h1>公司销售管理平台</h1>
                <el-menu v-once :default-active="navIndex" class="el-menu-header" @select="handleSelect" mode="horizontal" 
                    text-color="#fafafa" active-text-color="#ffe5a4" background-color="#203650">
                    <el-menu-item v-for="menuItem in navMenus" :key="menuItem.index" :index="menuItem.index">{{ menuItem.title }}</el-menu-item>
                </el-menu>
                <el-dropdown @command="handleCenterCommand" :show-timeout="100">
                    <a style="cursor:pointer"><img src="https://thumbs.dreamstime.com/b/%E5%A4%96%E5%BD%A2%E5%8C%BF%E5%90%8D%E9%9D%A2%E5%AD%94%E8%B1%A1-%E7%81%B0%E8%89%B2%E5%89%AA%E5%BD%B1%E4%BA%BA-%E7%94%B7%E6%80%A7%E7%BC%BA%E7%9C%81%E5%85%B7%E4%BD%93%E5%8C%96-%E7%85%A7%E7%89%87%E5%8D%A0%E4%BD%8D%E7%AC%A6-%E5%9C%A8%E7%99%BD%E8%89%B2-106473768.jpg" alt="个人中心"/></a>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="user-center">个人中心</el-dropdown-item>
                        <el-dropdown-item command="logout" divided>退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-header>
            <el-container>
                <el-aside :width="isCollapse ? '64px' : '240px'">
                    <el-menu :default-active="navMenus[navIndex].defaultActive" :collapse="isCollapse" class="el-menu-aside" @select="handleSecondLevelSelect" 
                        text-color="#878f91" active-text-color="#283a44" background-color="#ffffff">
                        <template v-for="menuItem in navMenus[navIndex].subMenus">
                            <el-submenu v-if="menuItem.subMenus" :key="menuItem.index" :index="menuItem.index">
                                <template slot="title">
                                    <i :class="menuItem.icon"></i>
                                    <span>{{ menuItem.title }}</span>
                                </template>
                                <el-menu-item v-for="item in menuItem.subMenus" :key="item.index" :index="item.index">
                                    <i :class="item.icon"></i>
                                    <span slot="title">{{ item.title }}</span>
                                </el-menu-item>
                            </el-submenu>
                            <el-menu-item v-else :key="menuItem.index" :index="menuItem.index">
                                <i :class="menuItem.icon"></i>
                                <span slot="title">{{ menuItem.title }}</span>
                            </el-menu-item>
                        </template>
                    </el-menu>
                    <el-tooltip :content="isCollapse ? '展开侧边栏' : '折叠侧边栏'" placement="top" effect="light">
                        <el-button :icon="isCollapse ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'" @click="isCollapse = !isCollapse"/>
                    </el-tooltip>
                </el-aside>
                <el-main>
                    <!-- <router-view></router-view> -->
                    <transition name="fade" mode="out-in">
                        <router-view></router-view>
                    </transition>
                </el-main>
            </el-container>
        </el-container>
        <el-dialog title="个人中心" :visible.sync="userCenterShown" :close-on-click-modal="false" :center="true" 
                width="700px" top="15vh" custom-class="popup-dialog">
            <user-center></user-center>
        </el-dialog>
        <transition name="el-fade-in-linear">
            <div class="login-div" v-if="needLogin">
                <el-card class="login-card" shadow="always">
                    <div slot="header" class="clearfix">
                        <span>用户登录</span>
                    </div>
                    <el-form ref="loginForm" :model="loginForm" label-width="80px">
                        <el-form-item label="用户名">
                            <el-input v-model="loginForm.username" :readonly="beLoggingIn" placeholder="请输入用户名"/>
                        </el-form-item>
                        <el-form-item label="密码">
                            <el-input v-model="loginForm.password" :readonly="beLoggingIn" placeholder="请输入密码" @keyup.enter.native="onLoginonSubmit" show-password/>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="onLoginReset" :disabled="beLoggingIn" :style="'margin-left: 38px;'">重 置</el-button>
                            <el-button type="primary" :loading="beLoggingIn" @click="onLoginonSubmit">
                                {{ beLoggingIn ? '正在登录' : '登 录' }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </div>
        </transition>
    </div>
</template>

<script>
import navMenus from './menus.js';
import Auths from './auths.js';
import UserCenter from './components/UserCenter.vue';

export default {
    data () {
        return {
            userCenterShown: false,
            isCollapse: false,
            navMenus: navMenus,
            navIndex: '0',
            needLogin: true,
            beLoggingIn: false,
            loginForm: {
                username: null,
                password: null
            }
        }
    },
    components: {
        'user-center': UserCenter
    },
    methods: {
        handleSelect (key) {
            this.navIndex = key;
        },
        handleSecondLevelSelect (key) {
            let paths = key.split('-');
            let menu = this.navMenus[this.navIndex];
            for (let i = 1; i < paths.length; i++) {
                menu = menu.subMenus[paths[i]];
            }
            this.$router.push(menu.route);
        },
        onLoginReset () {
            this.loginForm.username = null;
            this.loginForm.password = null;
        },
        onLoginonSubmit () {
            this.beLoggingIn = true;
            Auths.login(this.loginForm, (success, msg) => {
                if (success) {
                    this.beLoggingIn = false;
                    this.needLogin = false;
                    this.$router.push('/projectView');

                    setTimeout(() => {
                        this.$notify({
                            title: '登录成功',
                            message: msg + ' 欢迎登录',
                            type: 'success'
                        });
                    }, 500);
                } else {
                    this.beLoggingIn = false;
                    this.$notify.error({
                        title: '登录失败',
                        message: msg,
                    });
                }
            });
        },
        handleCenterCommand (command) {
            switch (command) {
                case 'user-center':
                    this.userCenterShown = true;
                    break;
                case 'logout':
                    this.needLogin = true;
                    Auths.logout();
                    break;
            }
        }
    }
}
</script>

<style scoped>
    #app {
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        background-color: #f4f6f7;
        color: #283a44;
    }

    .el-container {
        height: 100%;
    }

    .el-header {
        text-align: right;
        /* background-color: #283a44; */
        background-color: #203650;
    }

    .el-header h1 {
        position: absolute;
        top: -7px;
        /* color: rgb(181, 255, 138); */
        color: #ffe5a4;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
    }

    .el-menu-header {
        display: inline-block;
        margin-right: 50px;
        background-color: #283a44;
    }

    .el-dropdown {
        position: relative;
        top: -20px;
    }

    .el-header img {
        position: relative;
        top: 10px;
        width: 40px;
        height: 40px;
        border: 1px solid #fafafa;
        border-radius: 50%;
    }

    .el-aside {
        position: relative;
        line-height: 100%;
        padding-top: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.03);
        overflow-x: hidden;
    }

    .el-aside .el-button {
        position: absolute;
        bottom: 20px;
        right: 10px;
        border: none;
        padding-right: 10px;
    }

    .el-menu-aside:not(.el-menu--collapse) {
        height: 100%;
        border-style: none;
    }

    .el-main {
        text-align: center;
        line-height: 100%;
    }

    .fade-enter-active {
        transition: opacity .1s;
    }

    .fade-leave-active {
        transition: opacity .1s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .login-div {
        z-index: 100;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(102, 121, 146);
        background-image: url('assets/bg.jpg');
        background-size: cover; 
    }

    .login-card {
        margin: auto;
        margin-top: 25vh;
        padding-right: 20px;
        width: 420px;
        box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .clearfix:after {
        clear: both
    }
</style>