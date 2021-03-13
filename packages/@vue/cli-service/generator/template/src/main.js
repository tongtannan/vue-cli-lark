<%_ if (rootOptions.vueVersion === '3') { _%>
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
<%_ } else { _%>
import Vue from 'vue'
import App from './App.vue'

import '@/components/componentRegister'
import '@/assets/css/index.less'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

window.$apiUrl =
  process.env.NODE_ENV === 'development' ? '/api' : window.interfaceUrl

Vue.config.productionTip = false

new Vue({
  <%_ if (doesCompile) { _%>
  render: h => h(App),
  <%_ } else { _%>
  render: function (h) { return h(App) },
  <%_ } _%>
}).$mount('#app')
<%_ } _%>
