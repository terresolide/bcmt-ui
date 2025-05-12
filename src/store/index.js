import {createStore} from 'vuex'
import basket from './basket.js'
// import user from './modules/user'
// import activation from './modules/activation'
export default function makeStore(config) {
    var defaultConfig = {
        api: 'http://localhost',
        logo: 'formaterre'
    }

    var finalConfig = Object.assign(defaultConfig, config)

    return createStore({
        state: () => finalConfig,
        mutations: {
        },
        actions: {
        },
        modules: {
            basket
        }
    })
}
