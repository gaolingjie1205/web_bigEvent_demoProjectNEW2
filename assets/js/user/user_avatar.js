// import "../../lib/jquery";

$(function() {
  let layuiLayer = layui.layer;

  // 0、不允许凭空访问此页面
  if(!window.parent.getUserInfo) {
    location.href = "../login.html";
  }


  // 1、配置cropper来快速实现图片裁剪功能
  // 1-1、获取图片裁剪区域的img标签
  let $image = $("#image");
  // 1-2、配置cropper选项
  let option = {
    aspectRatio: 1,  // 纵横比缩放$image处的图片
    preview: ".preview-img"  // 指定图片缩略图预览区域
  }
  // 1-3、将cropper选项应用到$image
  $image.cropper(option);


  // 2、"选择本地图片"的点击功能，实际上它是个跳板
  let $btnUserAvatar = $("#btnUserAvatar");
  let $userAvatar = $("#userAvatar");
  $btnUserAvatar.on("click", function() {
    $userAvatar[0].click();
  });


  // 3、"选择本地图片"选择的图片需要通过格式验证，然后渲染到图片裁剪区域、图片预览区域
  $userAvatar.on("change", function(je) {
    // 文件是个二进制数据，不能直接给img元素
    // $image.attr("src", $userAvatar.val());
    // console.log(je);

    // 3-1、要求只能选择一张照片
    if(je.target.files.length === 0) {
      layuiLayer.msg("请选择一张照片后再上传头像！");
    }
    if(je.target.files.length >= 2) {
      layuiLayer.msg("只能选择一张照片");
    }
    if(/^image\/(jpg)|(jpeg)|(png)$/.test(je.target.files[0].type) === false) {
      layuiLayer.msg("选择的文件类型不是jpg、jpeg、png照片，请重新选择");
    }

    // 3-2、通过格式验证，先生成文件的在当前域名有效的URL
    let file = je.target.files[0];
    let fileURL = URL.createObjectURL(file);  // 类似于这样的字符串 "blob:http://127.0.0.1:5501/e15daaae-a72c-49a8-b73b-d3ac5d0a7423"
    console.log("已经生成了图片的URL，内容如下：");
    console.log(fileURL);

    // 3-3、然后把URL赋值给$image，注意要先卸载它上面的cropper画布层，销毁旧的图片裁剪区域，然后重新设置图片src，最后配置新的图片裁剪区域
    $image.cropper("destroy");
    $image.attr("src", fileURL);
    $image.cropper(option);
  });


  // 4、点击"确定"按钮，将上传新的头像到黑马服务器
  $("#btnUserAvatarUpload").on("click", function(je) {
    // 4-1、利用cropper，拿到裁剪后的头像
    // 首先创建一个canvas画布，然后把画布内容转换为base64图片字符串
    let dataURL = $image.cropper("getCroppedCanvas", {
      width: 100,
      height: 100
    }).toDataURL("image/png");

    // 4-2、发送裁剪的头像
    $.ajax({
      type: "POST",
      url: "/my/update/avatar",
      data: {
        avatar: dataURL
      },
      success: function(data, textStatus, jqXHR) {
        if(data["status"] === 0) {
          layuiLayer.msg(`${data["message"]}`);
          window.parent.getUserInfo();
        }
        else {
          layuiLayer.msg(`${data["message"]}`);
        }
      },
      error: function(jqXHR, textStatus, exception) {
        console.log(textStatus);
        console.log(exception);
      }
    })
  });
});