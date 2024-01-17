import {createApp} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js' ;

let productModal = null;
let delProductModal = null;

//productModal 必須是在全域環境宣告，假設直接從 mounted 內宣告，會導致該變數作用域只存在 mounted 範圍內（因為 mounted 也屬於函式），而無法在 openModal 函式中順利取得該變數，導致錯誤

createApp({
	data(){
		return{
            api :`https://vue3-course-api.hexschool.io/v2/`,
            api_path:`peggy123`,
            products:[],
            isNew : false, //isNew 用於表示當前 Modal 是新增或編輯 Modal，以便做後續串接 API 時的判斷
            tempProduct:{
                imagesUrl: []
            }, //tempProduct 則是預期開啟 Modal 時會代入的資料
            
		}
	},
	methods:{
		checkUser(){
            axios.post(`${this.api}api/user/check`)
            .then(res=>{
                alert('登入成功')
                this.getData()
            })
            .catch(error=>{
                console.log(error);
                alert('登入失敗，請重新登入')
                // window.location = `login.html`
            })
        },
        getData(){
            axios.get(`${this.api}api/${this.api_path}/admin/products/all`)
            .then(res=>{
                this.products = res.data.products;
            })
            .catch(error=>{
                alert(error.response.data.message);
            })
        },
        openModel(status,item){
            //若 status 為 ‘new’，表示點擊到新增按鈕，所以清空當前的 tempProduct 內容，並將 isNew 的值改為 true，最後再開啟 productModal
            if(status === 'new'){ 
                this.isNew = true;
                this.tempProduct = {imagesUrl: []},
                productModal.show()                
            }
            //若 status 為 ‘edit’，表示點擊到編輯按鈕，所以使用展開運算子 …item 將當前產品資料傳入 tempProduct，再將 isNew 的值改為 false，最後開啟 productModal
            else if(status === 'edit'){
                this.isNew = false;
                this.tempProduct = { ...item};
                productModal.show()                
            }
            //若 status 為 ‘delete’，表示點擊到刪除按鈕，同樣使用展開運算子將產品資料傳入 tempProduct，用意是後續串接刪除 API 時，需要取得該產品的 id，最後開啟 delProductModal
            else if(status === 'delete'){
                this.tempProduct = { ...item};
                delProductModal.show()
            }
            //最後再到 openModal 函式，對 productModal 使用 show() 語法就完成開啟 Modal 的操作囉，這部分也是 Bootstrap 提供的語法，開啟 Modal 使用 show()，關閉 Modal 使用 hide()
        },
        //在 updateProduct 函式中，我們先宣告 API 網址與串接方法兩個變數，並透過 if 判斷 isNew 的值，得知當前開啟的是新增還是編輯 Modal，再動態調整這兩個變數內容
        
        updateProduct(){
            let url = `${this.api}/api/${this.api_path}/admin/product/${this.tempProduct.id}`;
            let http = `put`;
            if(this.isNew){
                url = `${this.api}/api/${this.api_path}/admin/product`;
                http = `post`
            };
            axios[http](url,{data: this.tempProduct})
            .then(res=>{
                alert(res.data.message);
                this.getData();
                productModal.hide()
            })
            .catch(error=>{
                alert(error.response.data.message);
            })
        },
        delProduct(){
            const url = `${this.api}/api/${this.api_path}/admin/product/${this.tempProduct.id}`;
            const http = `delete`;
            axios[http](url)
            .then(res=>{
                alert(res.data.message);
                this.getData();
                delProductModal.hide()
            })
            .catch(error=>{
                alert(error.response.data.message);
            })
        },
        createImages() {
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
          },
	},
    mounted(){
        //取cookie資料
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,"$1");
         //token自動夾帶進去headers
         axios.defaults.headers.common['Authorization'] = token;
         this.checkUser();

        productModal = new bootstrap.Modal(document.getElementById('productModal'), 
            {
                //keyboard: false 意思是禁止使用者透過 Esc 按鍵來關閉 Modal 視窗，backdrop: 'static' 是禁止使用者點擊 Modal 以外的地方來關閉視窗，避免輸入到一半資料遺失等等
                keyboard: false,
                backdrop: 'static'
            }
         ),
         delProductModal = new bootstrap.Modal(
            document.getElementById("delProductModal"),
            {
              keyboard: false,
              backdrop: 'static'
            }
          );

    }
}).mount('#app')