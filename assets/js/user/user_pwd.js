// import "../../lib/jquery";

$(function() {
  let layuiForm = layui.form;
  let layuiLayer = layui.layer;  // layui的弹出层组件

  // 1、准备layui的表单验证规则并绑定到表单元素
  layuiForm.verify({
    pwd: [
      /^[\S]{6,12}$/,
      "密码长度必须在6到12位范围内，且不能有空格等空白符"
    ],
    newpwd: function(value) {
      let $oldpwd = $("#oldpwd");
      if(value === $oldpwd.val()) {
        return "新密码不能与原密码一模一样";
      }
    },
    confirmNewpwd: function(value, item) {
      let $newpwd = $("#newpwd");
      if(value !== $newpwd.val()) {
        return "两次输入的新密码不一致";
      }
    }
  });

  // 2、为userpwdForm绑定提交事件
  $("#userpwdForm").on("submit", function(je) {
    je.preventDefault();

    $.ajax({
      type: "POST",
      url: "/my/updatepwd",
      data: {
        oldPwd: $("#oldpwd").val(),
        newPwd: $("#newpwd").val()
      },
      success: function(data, textStatus, jqXHR) {
        console.log(data);
        if(data["status"] === 0) {
          layuiLayer.msg("修改密码成功");
          $("#userpwdForm")[0].reset();
        }
        else {
          layuiLayer.msg(`修改密码失败，错误信息：${data["message"]}`);
          // 不让用户直接/user/user_pwd.html访问本页
          if(!window.parent.getUserInfo) {
            localStorage.removeItem("token");
            location.href = "../login.html";
          }
        }
      },
      error: function(jqXHR, textStatus, exception) {
        console.log(textStatus);
        console.log(exception);
        layuiLayer.msg("修改密码失败，请重试");
        if(!window.parent.getUserInfo) {
          localStorage.removeItem("token");
          location.href = "../login.html";
        }
      }
    });
  });
});