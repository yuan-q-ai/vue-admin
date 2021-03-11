import service from "@/utils/request.js";
// 获取验证码接口
export function GetSms(data) {
  return service.request({
    method: "post",
    url: "/getSms/",
    //data: data 左边的data是变量名(key)后台接收的。右边的data是接受的参数，如果两者都是同名的的情况下，可以写成单一个即可（Es6的写法）
    data
  });
}
// 获取用户角色接口

//登录接口
export function Login(data) {
  return service.request({
    method: "post",
    url: "/login/",
    data
  });
}
//注册接口
export function Register(data) {
  return service.request({
    method: "post",
    url: "/Register/",
    data
  });
}
