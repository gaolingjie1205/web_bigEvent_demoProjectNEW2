// import "../../lib/jquery";

$(function() {
  let layuiForm = layui.form;
  let layuiLayer = layui.layer;  // layui的弹出层组件

  // 1、准备layui的表单验证规则并绑定到表单元素
  layuiForm.verify({
    nickname: function(value, item) {
      if(value.length > 6 || value.length < 1) {
        return "昵称长度必须在 1 到 6 个字符范围内";
      }
    }
  });

  // 2、获取用户信息，并使用layui提供的方法快速给表单元素赋值（刚刚打开首页拿到的用户信息，在这里不能拿到，因为是两个HTML页面，window对象不共用）
  function initializeUserInfo() {
    $.ajax({
      type: "GET",
      url: "/my/userinfo",
      // headers将在$.ajaxPrefilter()里给出
      async: true,
      success: function(data, textStatus, jqXHR) {
        console.log(data);
        if(data["status"] === 0) {
          /*
          // 提供表单元素的lay-filter属性值、服务器返回的JSON的用户信息对象，即可快速给表单元素赋值
          // 不知道为什么不工作，先不使用这个方法
          layuiForm.val("userinfoForm", data["data"]);
          */
          let $id = $("#id");
          let $username = $("#username");
          let $nickname = $("#nickname");
          let $email = $("#email");
          $id.val(data["data"]["id"]);
          $username.val(data["data"]["username"]);
          $nickname.val(data["data"]["nickname"]);
          $email.val(data["data"]["email"]);
        }
        else {
          layuiLayer.msg("获取用户基本资料失败，请重新点击本页面试试");
          // 不让用户直接/user/user_info.html访问本页
          if(!window.parent.getUserInfo) {
            localStorage.removeItem("token");
            location.href = "../login.html";
          }
        }
      },
      error: function(jqXHR, textStatus, exception) {
        console.log(textStatus);
        console.log(exception);
        layuiLayer.msg("获取用户基本资料失败，请重新点击本页面试试");
        // 不让用户直接/user/user_info.html访问本页
        if(!window.parent.getUserInfo) {
          localStorage.removeItem("token");
          location.href = "../login.html";
        }
      }
    });
  }
  initializeUserInfo();

  // 3、将修改后的基本资料发送给黑马服务器
  let $btnReset = $("#btnReset");
  let $userinfoForm = $("#userinfoForm");
  $userinfoForm.on("submit", function(je) {
    je.preventDefault();

    $.ajax({
      type: "POST",
      url: "/my/userinfo",
      data: $(this).serialize(),
      success: function(data, textStatus, jqXHR) {
        console.log(data);
        if(data["status"] === 0) {
          layuiLayer.msg("更新用户基本资料成功");
          window.setTimeout(function() {
            // 这样只能刷新user_info.html，无法刷新整个index.html
            // location.reload();
            // 如果想要更新index.html里面的个人信息，则需要想办法调用到index.js里面的getUserInfo()方法
            // 在index.js里面，getUserInfo()方法是全局方法，写出来就会绑定到index.html对应的那个window对象上，user_info作为一个子框架，只需要用自己的window来找它的父框架的window，然后去调用即可
            window.parent.getUserInfo();
          }, 1000);

          // 测试从子框架向父框架发送消息
          window.parent.postMessage("子页面user_info.html刚刚更新了用户基本资料", "http://127.0.0.1:5501/index.html");
        }
        else {
          layuiLayer.msg(`更新用户基本资料失败，错误信息：${data["message"]}`);
        }
      },
      error: function(jqXHR, textStatus, exception) {
        console.log(textStatus);
        console.log(exception);
        layuiLayer.msg("更新用户基本资料失败，可能是网络故障，请重试");
      }
    });
  });

  // 4、重置用户资料为未修改的状态
  $btnReset.on("click", function(je) {
    // 不能假设用户只在这里一处登录了，有可能有并发操作，因此需要实时更新用户数据
    je.preventDefault();
    initializeUserInfo();
  });
});