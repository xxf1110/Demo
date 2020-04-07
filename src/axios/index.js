import axios from "axios";

const _axios = axios.create({  
    timeout: 10000,  
});

_axios.interceptors.request.use(function (config) { 
    return config;
}, function (error) { 
    return Promise.reject(error);
});
 
_axios.interceptors.response.use(function (response) { 
    return response;
}, function (error) { 
    return Promise.reject(error);
});

export default _axios;