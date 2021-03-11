<template>
  <!-- 必须有一层父元素 -->
  <div id="login">
    <!-- 这才是真正的内容区 -->
    <div class="login-wrap">
      <ul class="menu-tab">
        <!-- :key绑定属性 id唯一的 -->
        <li
          v-for="item in menuTab"
          :key="item.id"
          :class="{ current: item.current }"
          @click="toggleMenu(item)"
        >
          {{ item.txt }}
        </li>
      </ul>
      <!-- 表单 star -->
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="username" class="item-form">
          <label for="username">邮箱</label>
          <el-input
            type="text"
            id="username"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password" class="item-form">
          <label for="password">密码</label>
          <el-input
            type="password"
            id="password"
            v-model="ruleForm.password"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item
          prop="passwords"
          class="item-form"
          v-show="model === 'register'"
        >
          <label for="passwords">重复密码</label>
          <el-input
            type="password"
            id="passwords"
            v-model="ruleForm.passwords"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="code" class="item-form">
          <label for="code">验证码</label>
          <el-row :gutter="10">
            <el-col :span="15"
              ><el-input
                id="code"
                v-model="ruleForm.code"
                minlength="6"
                maxlength="6"
              ></el-input
            ></el-col>
            <el-col :span="9"
              ><el-button
                type="success"
                class="block"
                @click="getSms()"
                :disabled="codeButtonStatus.status"
                >{{ codeButtonStatus.text }}</el-button
              ></el-col
            >
          </el-row>
        </el-form-item>

        <el-form-item>
          <el-button
            type="danger"
            @click="submitForm('loginForm')"
            class="login-btn block"
            :disabled="loginButtonStatus"
            >{{ model === "login" ? "登录" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import sha1 from "js-sha1";
import { GetSms, Register, Login } from "@/api/login";
import { reactive, ref, onMounted } from "@vue/composition-api";
import {
  stripscript,
  validateEmail,
  validatePass,
  validateVCode
} from "@/utils/validate.js";
export default {
  name: "login",
  setup(props, { refs, root }) {
    // setup(props, { refs }) {
    // setup(props, { refs }) {
    //验证邮箱为用户名
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else if (validateEmail(value)) {
        callback(new Error("用户名格式有误"));
      } else {
        callback(); //true
      }
    };
    //验证密码
    let validatePassword = (rule, value, callback) => {
      //过滤后的数据
      ruleForm.password = stripscript(value);
      value = ruleForm.password;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6至20位数字+字母"));
      } else {
        callback();
      }
    };
    //验证重复密码
    let validatePasswords = (rule, value, callback) => {
      //如果模块值为login，直接通过
      if (model.value === "login") {
        callback();
      }
      //过滤后的数据
      ruleForm.passwords = stripscript(value);
      value = ruleForm.passwords;
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value != ruleForm.password) {
        callback(new Error("重复密码不正确"));
      } else {
        callback();
      }
    };
    //验证验证码
    let validateCode = (rule, value, callback) => {
      //过滤后的数据
      // this.ruleForm.code = stripscript(value);
      // value = this.ruleForm.code;
      if (value === "") {
        return callback(new Error("请输入验证码"));
      } else if (validateVCode(value)) {
        return callback(new Error("验证码格式有误"));
      } else {
        callback();
      }
    };
    //声明数据
    //这里面放置data数据、生命周期、自定义的函数
    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);

    //模块值
    const model = ref("login");
    //登录按钮禁用状态
    //const loginButtonStatus = ref(true);
    const loginButtonStatus = ref(false);
    //验证码按钮状态
    const codeButtonStatus = reactive({
      status: false,
      text: "获取验证码"
    });
    //倒计时
    const timer = ref(null);
    //表单绑定数据
    const ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: ""
    });
    //表单的验证
    const rules = reactive({
      username: [{ validator: validateUsername, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }]
    });
    //1.不建议再一个方法里面做多件不同的事件（尽可能只做自己本身的事，不要做其他人的事情）
    //2.尽量把相同的事情封装到一个方法里面去，通过调用函数进行执行
    //声明函数
    //切换模块
    const toggleMenu = data => {
      menuTab.forEach(elem => {
        elem.current = false;
      });
      //高光
      data.current = true;
      //修改模块值
      model.value = data.type;
      resetFromData();
      clearCountDown();
    };
    //清除表单数据
    const resetFromData = () => {
      //重置表单
      //this.$refs[formName].resetFields();//2.0写法
      refs.loginForm.resetFields(); //3.0写法
      //refs["loginForm"].resetFields();//3.0另一种写法
    };
    //更新按钮状态
    const updataButtonStatus = params => {
      codeButtonStatus.status = params.status;
      codeButtonStatus.text = params.text;
    };
    //获取验证码
    const getSms = () => {
      //进行提示
      //前端要写一个判断邮箱不能为空
      if (ruleForm.username == "") {
        root.$message({
          showClose: true,
          message: "邮箱不能为空!",
          type: "error"
        });
        return false;
      }
      if (validateEmail(ruleForm.username)) {
        root.$message({
          showClose: true,
          message: "邮箱格式有误，请重新输入!",
          type: "error"
        });
        return false;
      }
      //获取验证码
      let requestData = {
        username: ruleForm.username,
        module: model.value
      };
      //修改获取验证按钮状态
      updataButtonStatus({
        status: true,
        text: "发送中"
      });
      setTimeout(() => {
        //延时多长时间
        //请求的接口
        // let data = {
        //   username: ruleForm.username
        // };
        // GetSms(data);
        //一个参数可以这样写
        GetSms(requestData)
          .then(response => {
            let data = response.data;
            root.$message({
              message: data.message,
              type: "success"
            });
            //启用登录或注册按钮
            loginButtonStatus.value = false;
            //调定时器，倒计时
            countDown(60);
          })
          .catch(error => {
            console.log(error);
          });
      });
    };
    //提交表单
    const submitForm = formName => {
      refs[formName].validate(valid => {
        //表单验证通过
        if (valid) {
          // if (model.value === "login") {
          //   login();
          // } else {
          //   register();
          // }
          //上面代码优化三元运算
          model.value === "login" ? login() : register();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    //登录
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        //登录密码加密
        password: sha1(ruleForm.password),
        code: ruleForm.code
      };
      Login(requestData)
        .then(response => {
          console.log("登录成功");
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    };
    //注册
    const register = () => {
      let requestData = {
        username: ruleForm.username,
        //注册密码加密
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        module: "register" //可写可不写
      };
      //注册接口
      Register(requestData)
        .then(response => {
          let data = response.data;
          root.$message({
            message: data.message,
            type: "success"
          });
          //模拟注册成功
          toggleMenu(menuTab[0]);
          clearCountDown();
        })
        .catch(error => {
          //失败时执行的代码
          console.log(error);
        });
    };
    //倒计时
    const countDown = number => {
      //判断定时器是否存在，存在则清除
      // if (timer.value) {
      //   clearInterval(timer.value);
      // }
      //setTimeout:clearTimeout(变量) 只执行一次
      //setInterval:clearInterval(变量) 不断的执行，需要条件才会停止
      let time = number;
      timer.value = setInterval(() => {
        time--;
        console.log(time);
        if (time === 0) {
          clearInterval(timer.value);
          updataButtonStatus({
            status: false,
            text: "再次获取"
          });
        } else {
          codeButtonStatus.text = `倒计时${time}秒`; //"倒计时" + time + "秒"
        }
      }, 1000);
    };
    //清除倒计时
    const clearCountDown = () => {
      //还原验证码按钮默认状态
      updataButtonStatus({
        status: false,
        text: "获取验证码"
      });
      //清除倒计时
      clearInterval(timer.value);
    };
    // 生命周期
    //挂载完成后
    onMounted(() => {});
    return {
      menuTab,
      model,
      loginButtonStatus,
      codeButtonStatus,
      ruleForm,
      rules,
      timer,
      toggleMenu,
      submitForm,
      getSms
    };
  }
};
</script>
<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
  .item-form {
    margin-bottom: 13px;
  }
  .block {
    display: block;
    width: 100%;
  }
  .login-btn {
    margin-top: 19px;
  }
}
</style>
