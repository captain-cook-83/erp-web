import Axios from 'axios';
import { Base64 } from 'js-base64';

const CONFIG = {
    headers: {
        'Authorization': 'Basic ' + Base64.encode('erp:MIIB_/IjANBgkqhkiG9'),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

const session = {
    id: 0,
    departmentId: 0,
    roles: []
};

const pendingRequest = [];

export default {
    session: session,
    pending (request) {
        if (session.id) {
            request();
        } else {
            pendingRequest.push(request);
        }
    },
    login (data, callback) {
        let params = 'username=' + data.username + '&password=' + data.password + '&grant_type=password&scope=any';
        Axios.post('/oauth/token', params, CONFIG).then(response => {
            let data = response.data;
            Axios.defaults.headers.common['Authorization'] = data.token_type + ' ' + data.access_token;
            
            Axios.get('/user').then(response => {
                let data = response.data;
                session.roles = data.authorities;

                Axios.get('/users/username/' + data.user.username).then(response => {
                    let data = response.data;
                    session.id = data.id;
                    session.departmentId = data.departmentId;
                
                    if (typeof callback === 'function') callback(true, data.name);
                    pendingRequest.forEach(request => {
                        request();
                    });
                    pendingRequest.splice(0);
                }).catch(error => {
                    if (typeof callback === 'function') callback(false, '用户信息获取失败，请重新尝试');
                });
            }).catch(error => {
                if (typeof callback === 'function') callback(false, '授权信息获取失败，请重新尝试');
            });
        }).catch(error => {
            let data = error.response.data;
            if (typeof callback === 'function') callback(false, data.error_description || error.response.status);
        });
    },
    logout () {
        session.id = 0;
        session.departmentId = 0;
        session.roles = [];
    }
}