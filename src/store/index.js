import {createStore} from 'vuex'
// import user from './modules/user'
// import activation from './modules/activation'
export default function makeStore(config) {
    var defaultConfig = {
        api: 'https://catalogue-terresolide.ipgp.fr/bcmt/frost',
    }

    var finalConfig = Object.assign(defaultConfig, config)

    return createStore({
        state: () => finalConfig,
        mutations: {
        },
        actions: {
        },
        modules: {
            // user,
            // activation
        }
    })
}
