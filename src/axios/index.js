import axios from "axios";

const _axios = axios.create({
    timeout: 10000,
});

_axios.interceptors.request.use(
    function (config) {
        config.headers.Authorization = "Bearer " + sessionStorage.getItem("login_data");
        return config; 
    }, function (error) {
        return Promise.reject(error);
    });

_axios.interceptors.response.use(
    function (response) {
        return response;
    }, function (error) {
        return Promise.reject(error);
    });

export default _axios;