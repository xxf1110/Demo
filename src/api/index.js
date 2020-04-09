let url = {}
// let host = 'http://192.168.81.40:9000'
let host = 'http://192.168.0.202:9090'  // 线上服务器地址


Object.defineProperties(url, {
    getWordsList: {
        value: '/nlp/participle/list'
    },
    addWords: {
        value: '/nlp/participle/add'
    },
    editWords: {
        value: '/nlp/participle/edit'
    },
    delWords: {
        value: '/nlp/participle/delete'
    },
    login: {
        value: '/nlp/participle/login'
    },
    exportData: {
        value: host + '/nlp/participle/export'
    }

})

export default url;
