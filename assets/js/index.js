// import "../lib/jquery";

// 0、先检查用户是否登录，判断依据就是服务器返回的JSON的status值，若为0则已登录，若为1则是非法访问index.html
function getUserInfoPre() {
  $.ajax({
    type: "GET",
    url: "/my/userinfo",
    // headers将在$.ajaxPrefilter()里给出
    async: true,
    success: function(data, textStatus, jqXHR) {
      console.log(data);
      if(data["status"] === 0) {
        // 成功后，就可以将拿到的个人信息渲染进index.html了
        window.userInfo = {
          username: data["data"]["username"],
          nickname: data["data"]["nickname"],
          name: data["data"]["nickname"] || data["data"]["username"],
          email: data["data"]["email"],
          user_pic: data["data"]["user_pic"]
        };
        console.log("检查用户令牌资格完毕，将要初始化主页功能了");
        initializeIndex();
      }
      else {
        localStorage.removeItem("token");
        location.href = "./login.html";
      }
    },
    error: function(jqXHR, textStatus, exception) {
      console.log(textStatus);
      console.log(exception);
      localStorage.removeItem("token");
      location.href = "./login.html";
    }
  });
}
$(document).on("DOMContentLoaded", getUserInfoPre);


/**
 * 初始化主页功能
 */
function initializeIndex() {
  let layuiLayer = layui.layer;  // layui的弹出层组件

  // 0、解除body的封印
  // 前端是无法完全控制用户的行为的，因为CSS、JS、HTML完全可修改，真正要控制用户的行为还得是服务器端严格把关，像我下面这样改可见性完全就是糊弄小白，要么就不允许访问此路由，也不发index.html与dashboard，就能不让用户访问了
  $(document.body).css("visibility", "visible").css("height", "auto");


  // 1、头部个人中心下拉菜单
  let $userinfo = $("#userinfo");
  let $headerNavItemChildnav = $(".header-nav-item-childnav");
  $userinfo.on("mouseenter", function() {
    $headerNavItemChildnav.stop(true).slideDown(400);
  })
  .on("mouseleave", function() {
    $headerNavItemChildnav.stop(true).slideUp(400);
  });


  // 2、侧边栏文章管理、个人中心下拉菜单
  let $sideNavItemPanelList = $(".side-nav-item-panel");
  $sideNavItemPanelList.on("click", function() {
    let $this = $(this);
    $this.toggleClass("active");
    for(let i = 0; i < $sideNavItemPanelList.length; i++) {
      if($sideNavItemPanelList[i] !== $this[0]) {
        $($sideNavItemPanelList[i]).removeClass("active");
      }
    }
  });
  let $sideNavItemAnchorList = $(".side-nav-item a");
  $sideNavItemAnchorList.on("click", function() {
    let $this = $(this);
    $this.addClass("selected");
    for(let i = 0; i < $sideNavItemAnchorList.length; i++) {
      if($sideNavItemAnchorList[i] !== $this[0]) {
        $($sideNavItemAnchorList[i]).removeClass("selected");
      }
    }
  });


  // 3、获取当前登录用户的基本信息、渲染用户的头像或文字头像
  getUserInfo();


  // 4、退出链接的退出功能
  // 清除JWT令牌，跳转到登录页
  // layui提供的confirm()方法是异步的，不会阻塞页面运行
  $("#btnLogout").on("click", function(je) {
    je.preventDefault();

    layuiLayer.confirm('确定要退出系统吗？', {icon: 3, title:'提示'}, function(index){
      localStorage.removeItem("token");
      layuiLayer.close(index);  // index是弹出层的索引，开发者无需手动管理
      location.href = "./login.html";
    });
  });


  // 5、测试从子框架向父框架发送消息
  window.addEventListener("message", function(e) {
    console.log(e.data);
    console.log("消息来源： ", e.origin);
  });
};


/** 
 * 获取当前登录用户的基本信息
 */
function getUserInfo() {
  $.ajax({
    type: "GET",
    url: "/my/userinfo",
    // headers将在$.ajaxPrefilter()里给出
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log(data);
      if(data["status"] === 0) {
        // 成功后，就可以将拿到的个人信息渲染进index.html了
        window.userInfo = {
          username: data["data"]["username"],
          nickname: data["data"]["nickname"],
          name: data["data"]["nickname"] || data["data"]["username"],
          email: data["data"]["email"],
          user_pic: data["data"]["user_pic"]
        };
        console.log("获取当前登录用户的基本信息完毕");
      }
      else {
        localStorage.removeItem("token");
        location.href = "./login.html";
      }
    },
    error: function(jqXHR, textStatus, exception) {
      console.log(textStatus);
      console.log(exception);
      localStorage.removeItem("token");
      location.href = "./login.html";
    }
  });
  renderUserImgOrTextAvator();
}


/**
 * 渲染用户的头像或文字头像
 */
function renderUserImgOrTextAvator() {
  if(window.userInfo.user_pic) {
    $("img.header-nav-item-img").css("display", "inline-block");
    $("img.header-nav-item-img").attr("src", window.userInfo.user_pic);
    $("span.header-nav-item-img").css("display", "none");
  }
  else {
    // user_pic为undefined或者null，说明用户还没有设置头像，此时应该显示文字头像
    $("img.header-nav-item-img").css("display", "none");
    $("span.header-nav-item-img").html(window.userInfo.name[0].toUpperCase()).css("display", "inline-block");
  }
  $("#welcome").html(`欢迎您，${window.userInfo.name}`);  // 优先显示昵称，如果没有昵称则显示账号
}