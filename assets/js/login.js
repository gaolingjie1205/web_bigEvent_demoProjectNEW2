// import "jQuery"

$(function() {


  // 1、登录/注册tab栏切换
  let $linkRegister = $("#link-register");
  let $linkLogin = $("#link-login");
  $linkRegister.on("click", function(je) {
    je.preventDefault();
    $(".login").css("display", "none");
    $(".register").css("display", "block");
  });
  $linkLogin.on("click", function(je) {
    je.preventDefault();
    $(".register").css("display", "none");
    $(".login").css("display", "block");
  });


  // 2、登录/注册表单验证，将使用layui组件来快速验证
  // 先从layui中获取form属性，然后调用其verify()方法添加自定义表单验证规则
  // verify()的参数可以是一个对象，其中键是自定义表单验证规则名字，值可以是函数也可以是数组，这里我选择数组方式，第一个元素表示验证规则，是正则，第二个元素表示验证失败时的提示信息
  let layuiForm = layui.form;
  let layuiLayer = layui.layer;  // layui的弹出层组件，将会在这里给用户展示登录/注册结果消息
  layuiForm.verify({
    pwd: [
      /^[\S]{6,12}$/,
      "密码必须是6到12位的，且不能出现空格"
    ],
    repwd: function(value, item) {
      // value就是表单元素的值，item就是表单元素DOM对象
      let $upwd2 = $("#upwd2");
      if(value !== $upwd2.val()) {
        return "两次输入的密码不一致";
      }
    }
  });


  // 3-1、监听注册表单的提交事件，在提交时向黑马服务器发送注册的POST请求
  let $registerForm = $("#registerForm");
  $registerForm.on("submit", function(je) {
    // 不要让<form>元素的默认行为跳转页面，而是让ajax来发送数据，随后直接渲染当前页面
    je.preventDefault();

    let resultCode = null;
    $.ajax({
      url: "/api/reguser",
      type: "POST",
      data: {
        // $registerForm.serialize() 会将确认密码部分的表单值也序列化，因此这里手工决定什么要发送给服务器
        username: $("#uname2").val(),
        password: $("#upwd2").val()
      },
      success: function(data, textStatus) {
        console.log(data);
        console.log(textStatus);
        resultCode = data['status'];
        if(data['status'] === 0) {
          layuiLayer.msg(`用户 ${$("#uname2").val()} 已经注册成功！`);
          // 1秒后自动跳转到登录tab栏
          window.setTimeout(function() {
            $linkLogin.trigger("click");
          }, 1000);
        }
        else if(data['status'] === 1) {
          layuiLayer.msg(`用户 ${$("#uname2").val()} 注册失败！错误信息： ${data['message']}`);
        }
      },
      error: function(jqXHR, textStatus, exception) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(exception);
        layuiLayer.msg("发送注册请求时出错了，请打开控制台查看。");
      },
      complete: function() {
        console.log("正在执行注册POST请求的complete回调函数");
        if(resultCode !== 0) {
          // je.preventDefault(); 与该语句等价，但是不能依赖这里的false，如果不在submit事件处理函数的开始就阻止表单的默认行为，则根本无法执行到随后的这些代码！
          return false;
        }
      }
    });
  });
  

  // 3-2、注册表单的提交事件发生时，应该暂时禁用提交按钮，节流
  // 但是亲测发现这样会导致layui的弹出层组件失效，因此不得不放弃以下代码
  /*
  let $registerBtn = $("#registerForm button[type='submit']");
  $registerBtn.on("click", function(je) {
    // je.preventDefault();
    $registerBtn.attr("disabled", "disabled");
    window.setTimeout(function() {
      $registerBtn.removeAttr("disabled");
    }, 5000);
  });
  */


  // 4、监听登录表单的提交事件，在提交时向黑马服务器发送登录的POST请求
  // 需要获取本用户的token令牌
  let $loginForm = $("#loginForm");
  $loginForm.on("submit", function(je) {
    // 不要让<form>元素的默认行为跳转页面，而是让ajax来发送数据，只有登录成功了才跳转到首页
    je.preventDefault();
    $.ajax({
      url: "/api/login",
      type: "POST",
      data: $(this).serialize(),  // this: HTMLElement
      success: function(data, textStatus) {
        console.log(data);
        console.log(textStatus);
        if(data['status'] === 0) {
          layuiLayer.msg(`用户 ${$("#uname").val()} 已经登录成功！`);
          // 登陆成功，妥善保管好用户令牌，放进localStorage里
          localStorage.setItem("token", data['token']);
          // 1秒后自动跳转到个人首页
          window.setTimeout(function() {
            location.href = "./index.html";
          }, 1000);
        }
        else {
          layuiLayer.msg(`用户 ${$("#uname").val()} 登录失败！错误信息： ${data['message']}`);
        }
      },
      error: function(jqXHR, textStatus, exception) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(exception);
        alert("发送登录请求时出错了，请打开控制台查看。");
      }
    });
  });
});