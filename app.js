// import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
  generateMessage: localize('zh_TW'),
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'brad5566';

// Object.keys(VeeValidateRules).forEach(rule => {
//   if (rule !== 'default') {
//     VeeValidate.defineRule(rule, VeeValidateRules[rule]);
//   }
// });

// // 讀取外部的資源 (多國語系)
// VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// // Activate the locale
// VeeValidate.configure({
//   generateMessage: VeeValidateI18n.localize('zh_TW'),
//   validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
// });

// 子元件，操作 modal
const productModal = {
  // 從根元件取得的 productId 帶入 id
  props: ['id', 'addToCart', 'openModal'],
  data() {
    return {
      modal: {},
      tempProduct: {},
      qty: 1,
    }
  },
  template: `#userProductModal`,
  // 監聽 id，當 id 變動時，取得遠端資料，並呈現 modal
  watch: {
    id() {
      // 為了避免 id 為空值時做的判斷
      if (this.id) {
        axios({
          method: 'get',
          url: `${apiUrl}/api/${apiPath}/product/${this.id}`
        }).then(res => {
          this.tempProduct = res.data.product
          this.modal.show()
        })
      }
    }
  },
  methods: {
    hideModal() {
      this.modal.hide()
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal)
    // 為了因應 watch 的功能，重複選取相同產品時，會無法觸發 watch
    // 監聽 DOM，當 Modal 關閉時，更改產品 id
    this.$refs.modal.addEventListener('hidden.bs.modal', (event) => {
      this.openModal('') // 更改產品 id
    })
  }
}

// 根元件，預設先載入產品列表
Vue.createApp({
  data() {
    return {
      products: [],
      productId: '',
      cart: {},
      loadingItem: '', // 存購物車 id
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
    }
  },
  methods: {
    getProducts() {
      axios({
        method: 'get',
        url: `${apiUrl}/api/${apiPath}/products/all`
      }).then(res => {
        this.products = res.data.products
      })
    },
    openModal(id) {
      this.productId = id
    },
    addToCart(product_id, qty = 1) {
      this.loadingItem = product_id
      if (this.loadingItem === product_id) {
        this.loadingEffect()
      }
      const data = {
        product_id,
        qty
      }
      axios({
        method: 'post',
        url: `${apiUrl}/api/${apiPath}/cart`,
        data: { data }
      }).then(res => {
        this.$refs.productModal.hideModal()
        // 新增產品至購物車時，要順便更新購物車列表
        this.getCarts()
      })
    },
    getCarts() {
      axios({
        method: 'get',
        url: `${apiUrl}/api/${apiPath}/cart`
      }).then(res => {
        this.cart = res.data.data
      })
    },
    updateCartItem(item) { // 分別要帶入購物車 id 與 產品 id
      const data = {
        product_id: item.product.id,
        qty: item.qty
      }
      // 點擊時，將購物車 id 先存起來
      this.loadingItem = item.id
      if (this.loadingItem === item.id) {
        this.loadingEffect()
      }
      axios({
        method: 'put',
        url: `${apiUrl}/api/${apiPath}/cart/${item.id}`,
        data: { data }
      }).then(res => {
        this.getCarts()
        // 為了避免短時間內多次觸發: 非同步尚未完成時 item.id的值與 loadingItem 相同，觸發 disabled。待非同步完成後，清空 loadingItem
        // this.loadingItem = ''
      })
    },
    deleteCartItem(item) {
      this.loadingItem = item.id
      if (this.loadingItem === item.id) {
        this.loadingEffect()
      }
      axios({
        method: 'delete',
        url: `${apiUrl}/api/${apiPath}/cart/${item.id}`,
      }).then(res => {
        this.getCarts()
      })
    },
    loadingEffect() {
      let loader = this.$loading.show()
      setTimeout(() => {
        loader.hide()
      }, 1000)
    },
    createOrder() {
      const order = this.form;
      // axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order }).then((response) => {
      //   alert(response.data.message);
      //   this.$refs.form.resetForm();
      //   this.getCarts();
      // })
      // // .catch((err) => {
      // //   alert(err.response.message);
      // // });

      axios({
        method: 'post',
        url: `${apiUrl}/api/${apiPath}/order`,
        data: { data: order }
      }).then((response) => {
        alert(response.data.message);
        this.$refs.form.resetForm();
        this.getCarts();
        this.form.message = ''
      })
      // .catch((err) => {
      //   alert(err.response.data.message);
      // });
    },
    deleteAllCarts(){
      this.loadingEffect()
      axios({
        method: 'delete',
        url: `${apiUrl}/api/${apiPath}/carts`,
      }).then(res => {
        this.getCarts()
      })
    }
  },
  components: {
    productModal,
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  mounted() {
    this.getProducts(),
      this.getCarts()
  }
})
  // const app = createApp()
  .use(VueLoading.LoadingPlugin)
  .mount('#app')

// app.component('VForm', VeeValidate.Form);
// app.component('VField', VeeValidate.Field);
// app.component('ErrorMessage', VeeValidate.ErrorMessage);


// app.component('loading', VueLoading.Component)

