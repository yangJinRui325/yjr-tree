import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css' // v4+ 推荐 reset
import './styles/index.css'

createApp(App).use(Antd).mount('#app')
