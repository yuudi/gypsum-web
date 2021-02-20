import { createApp } from 'vue'
import ElementPlus from 'element-plus';
import App from './App.vue';
import axios from "axios";

axios.defaults.baseURL = "/api/v1";
axios.defaults.validateStatus = function (status) {
    return status < 500
}

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
