// ==UserScript==
// @name         南京信息职业技术学院校园网自动登录
// @namespace    http://tampermonkey.net/
// @version      3.3.0
// @icon         http://n.njcit.cn/Public/Images/favicon.ico
// @description  主要功能：在PCweb端添加手机端认证域；可以设置网页打开没有登录时的自动登录。
// @author       C选项_沉默(GitHub：Preliterate, QQ：157970490)


// @note         ================ 脚本维护人员招聘 ================ 脚本维护人员招聘  ================
// @note         
// @note         因本人毕业，校外无法访问n.njcit.cn，故在此寻找能有能力接任自动登录脚本维护工作的学弟学妹。
// @note         若您有这个能力，还请联系我的QQ：157970490（备注：校园网自动登录脚本维护）。
// @note         如果您周围有相关的大佬，还请帮忙介绍。
// @note         ================ 为什么要人来维护？ ================
// @note         因为这个脚本是依附在校园网的登陆页面上的，一旦学校改动登陆页面，那么这个脚本将无法正常运行。
// @note         ================ 脚本的产生与更新 ================
// @note         当时入学的时候，可以用电信的“宽”带，一个月得上百（舍友办了，网速也不咋样，LOL还经常掉线），
// @note         像我这样家境贫寒的穷学生是自然不敢奢望的，校园流量套餐热点+校园网的方案一直用到毕业。
// @note         （当然还有过宿舍AA电信“宽”带登陆在路由器上的、修改路由器MAC地址嫖免认证登陆的日子）
// @note         “电信‘宽’带”是一种电信公司割学生韭菜的产品；
// @note         “校园网”指的是直接通过学校网络中心上网的方式；
// @note         “校园流量套餐”指的是办一张校园套餐的手机卡，一个月几十G的那种。
// @note         不要将上述三种混为一谈。
// @note         校园网直接是通过学校网络管理中心认证，然后就给放行这台设备的Internet访问权限。
// @note         而认证，学生一般能通过三种方式：“stundent认证域”，“student-phone认证域”和MAC地址免认证。
// @note         在电脑端只能选择“stundent认证域”，0.4元一小时。
// @note         在手机端只能选择“student-phone”，6块钱一个月。
// @note         对于我这种电脑一直开机的，显然是用“student-phone”啊，在我入学的第一个月就发现能通过修改浏览器
// @note         “User-Agent”的方式来让手机登陆电脑端的，电脑登陆手机端的。
// @note         后来大二我学会了一些爬虫的皮毛，就发现手机登陆和电脑登陆都是同一个POST请求。那这个脚本直接在启动的时候，
// @note         发送这个POST请求就能实现自动登录了，而且POST里面的认证域也能改，这就是这个脚本的雏形。
// @note         因为认证页面打开的时候先得用个GET请求获取登陆状态，自动登录的也得GET获取一次。
// @note         所以就在2018.2.26-V2.0的版本改成了通过JQ操作表单的方式登陆的方案（页面打开的时请求的状态数据获取不到，必须要重新GET一次）
// @note         后来还有悄无声息的版本，无线网或者网线连接学校网络时，会弹出认证页面，自动登录后还能自己关闭。
// @note         ================ 关于我的碎碎念。。 ================
// @note         本人是2017年入学。某软件专业的关门弟子，刚刚填了毕业证邮寄的申请表，即将彻底和南信院说再见了。
// @note         今年转本虽说扩招，但压根不关计算机类专业什么事，还是滑档了，征求平行志愿最后一个也是几乎压线被录取。
// @note         也许，不该裸考的…… 哎，我太南了。
// @note         
// @note         ================ 脚本维护人员招聘 ================ 脚本维护人员招聘  ================

// @match        http://n.njcit.cn
// @match        http://222.192.254.22
// @match        http://n.njcit.cn/index.php
// @match        http://222.192.254.22/index.php
// @match        http://n.njcit.cn/index.php?*
// @match        http://222.192.254.22/index.php?*
// @match        http://n.njcit.cn/?*
// @match        http://222.192.254.22/?*
// @run-at       document-end
// @grant        none
// @note         2018.1.15-V0.1 完成网页一弹出即可完成认证。
// @note         2018.1.18-V1.0 完成自定义用户名、密码；添加手机端认证域。
// @note         2018.1.21-V1.0 放寒假了，咕咕咕~。
// @note         2018.2.26-V2.0 使用jQuery通过自动填写表单、点击登录按钮登录，取消了直接通过$.ajax()提交认证。
// @note         2018.2.28-V2.1 添加‘浏览器保存密码’选项，开启后不会用cookies保存密码；添加密码输入框‘悬浮显示密码功能’。
// @note         2019.3.01-v3.0 添加关闭页面选项，若浏览器不阻止，则会登录完成自动关闭，
// @note                        若知道最新版的chrome浏览器怎么用javascript关闭标签的话还请提交issue。
// @note         2019.3.02-v3.1 emmm……修改了一下窗口关闭的时机，如果未登录的话会帮你登录后关闭(还做了被浏览器阻止的弹窗提示)，
// @note                        如果已登录的话不会执行任何操作了，也不会把窗口关掉了。(还把设置页面的标题改为了初音绿，叉会腰~)
// @note         2019.9.13-v3.2 修改了自动关闭页面的时机，已登录不会自动关闭页面。
// @note         2019.9.23-v3.3 加入自动关闭冷却时间，已登陆和未登录都会出发自动关闭，但距离上次关闭时间小于60秒都不会真正关闭页面。
// @note                        去掉了未关闭的弹窗提示。未自动登录时能自动填充密码。
// @note         2020.7.03-v3.3 毕业了……在此处添加脚本维护人员……
// ==/UserScript==

'use strict';

console.log('n.njcit.cn\n校园网自动登录脚本已启用。\nGitHub:https://github.com/Preliterate/n.njcit.cn-AutoLoginScript');

// 新建一个Object用来存储所需要的信息
window.autoLogin = {
	userInfo: {
		username: undefined,
		domain: undefined,
		password: undefined
	},
	autoLoginSwitch: undefined,
	savePasswordInCookies: undefined,
	panel: undefined,
	loginStatus: {
		status: 0,
	}
};
//读取用户名
if($.cookie("sunriseUsername")===undefined){
	window.autoLogin.userInfo.username = '';
}
else{
	window.autoLogin.userInfo.username = $.cookie("sunriseUsername");
}
//读取认证域
if($.cookie("sunriseDomain")===undefined){
	window.autoLogin.userInfo.domain = '';
}
else{
	window.autoLogin.userInfo.domain = $.cookie("sunriseDomain");
}
//读取密码
if($.cookie("autoLoginPassword")===undefined){
	window.autoLogin.userInfo.password = '';
}
else{
	window.autoLogin.userInfo.password = $.cookie("autoLoginPassword");
}
//读取开关状态
if($.cookie("autoLoginSwitch")===undefined){
	window.autoLogin.autoLoginSwitch = 0;
}
else{
	window.autoLogin.autoLoginSwitch = parseInt($.cookie("autoLoginSwitch"));
}
//读取存储位置
if($.cookie("autoLoginsavePasswordInCookies")===undefined){
	window.autoLogin.savePasswordInCookies = 1;
}
else{
	window.autoLogin.savePasswordInCookies = parseInt($.cookie("autoLoginsavePasswordInCookies"));
}

//刷新当前登录状态
window.autoLogin.updateLoginStatus = function() {
	$.ajax({
		type: 'GET',
		url: initUrl,
		contentType: "application/x-www-form-urlencoded",
		dataType: 'json',
		cache: false,
		data: {},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			showResultBox($('#loginResult'), false, '请确保通信正常后刷新页面', 5000);
		},
		success: function(json) {
			if (autoLogin.loginStatus.status !== json.status) {
				window.autoLogin.loginStatus = json;
			}
			if(json.status===0){
                console.log('登录状态：未登录');
				window.autoLogin.writeFormAndLogin();
			}
            else if(json.status===1 && json.info==="用户已登录"){
                console.log('登录状态：已登录');
                window.autoLogin.close();
            }
		}
	});
}

//向DOM中加入认证域与设置页面
window.autoLogin.insertHTML = function() {
	//添加认证域
	$("option").remove();
	$("#domain").append(
`<option value="studentphone" data-realm-type="0">student-phone</option>
<option value="phone" data-realm-type="0">phone</option>
<option value="internet" data-realm-type="0">internet</option>
<option value="baoyue50" data-realm-type="0">baoyue</option>
<option value="qgzx" data-realm-type="0">qgzxyh</option>
<option value="qgzxby" data-realm-type="0">qgzxby</option>`
	);
	//添加设置按钮
	$('div.nav-bar ul').append(`<li><a href='javascript:window.autoLogin.switchSettingPanel()'>自动登录设置</a></li>`)
	//添加设置页面
	$('div.mLeft').append(
`<form id="loginFormForAutoLogin" style="display: none;">
	<div class="panel panel-default panel-transparent">
		<div class="panel-heading" style='background-color: #39c5bb;'>
			<h3 class="panel-title" style='color:white;'>自动登录脚本-自动登录设置</h3>
		</div>
		<div class="panel-body">
			<div class="input-group row-space">
				<span class="input-group-addon">
					<span class="glyphicon glyphicon-user"></span>
				</span>
				<input type="text" id="usernameForAutoLogin" name="username" tabindex="1" class="form-control" placeholder="用户名">
			</div>
			<div class="input-group row-space">
				<span class="input-group-addon">@</span>
				<select id="domainForAutoLogin" name="domain" class="form-control">
					<option value="studentphone" data-realm-type="0">student-phone</option>
					<option value="student" data-realm-type="0">student</option>
					<option value="phone" data-realm-type="0">phone</option>
					<option value="internet" data-realm-type="0">internet</option>
					<option value="baoyue50" data-realm-type="0">baoyue</option>
					<option value="qgzx" data-realm-type="0">qgzxyh</option>
					<option value="qgzxby" data-realm-type="0">qgzxby</option>
				</select>
			</div>
			<div class="input-group">
				<span class="input-group-addon">
					<span class="glyphicon glyphicon-lock"></span>
				</span>
				<input type="password" id="passwordForAutoLogin" name="password" tabindex="2" class="form-control" placeholder="密 码">
			</div>
			<div class="info row-space">
				<div class="info-left">
					<span id='switchForAutoLoginOn'>
						<a href="javascript:$('.info-left #switchForAutoLoginOn').hide();$('.info-left #switchForAutoLoginOff').show();window.autoLogin.autoLoginSwitch = 0;" title='单击关闭' style='color:green'>
							<b>启用开关：(开)</b>
						</a>
					</span>
					<span id='switchForAutoLoginOff'>
						<a href="javascript:$('.info-left #switchForAutoLoginOff').hide();$('.info-left #switchForAutoLoginOn').show();window.autoLogin.autoLoginSwitch = 1;" title='单击启用' style='color:red'>
							<b>启用开关：(关)</b>
						</a>
					</span>
				</div>
				<div class="info-right">
					<span id='savePasswordInCoookies'>
						<a href="javascript:$('.info-right #savePasswordInCoookies').hide();$('.info-right #savePasswordInBrowser').show();window.autoLogin.savePasswordInCookies = 0;" title="请务必注意cookies安全，单击切换为浏览器保存密码。（需要浏览器支持）"><b>cookies保存密码</b></a>
					</span>
					<span id='savePasswordInBrowser'>
						<a href="javascript:$('.info-right #savePasswordInBrowser').hide();$('.info-right #savePasswordInCoookies').show();window.autoLogin.savePasswordInCookies = 1;" title="单击切换为cookies保存密码"><b>浏览器保存密码</b></a>
					</span>
				</div>
			</div>
			<a type="submit" onclick='window.autoLogin.saveButton();window.autoLogin.switchSettingPanel();' class="btn btn-blue btn-sm btn-block">保 存</a>
		</div>
	</div>
</form>`
	)

}

//显示or关闭设置面板
window.autoLogin.switchSettingPanel = function() {
	var panels = $('form');
	if(panels[4].style.display==='none'){
		for(var i=0;i<panels.length;i++){
			if(panels[i].style.display!=='none'){
				window.autoLogin.panel=panels[i].id;
				break;
			};
		}
		$('form#'+window.autoLogin.panel).hide();
		$('form#loginFormForAutoLogin').show();
		window.autoLogin.updateForm();
	}
	else{
		$('form#loginFormForAutoLogin').hide();
		$('form#'+window.autoLogin.panel).show();
	}
}

//刷新设置表单
window.autoLogin.updateForm = function(){
	$('#loginFormForAutoLogin #usernameForAutoLogin').val(window.autoLogin.userInfo.username);
	$('#loginFormForAutoLogin #domainForAutoLogin').find("option[value='" + window.autoLogin.userInfo.domain + "']").attr("selected", true);
	$('#loginFormForAutoLogin #passwordForAutoLogin').val(base64decode(window.autoLogin.userInfo.password));
	if(Boolean(window.autoLogin.savePasswordInCookies)){
		$('.info-right #savePasswordInBrowser').hide();
		$('.info-right #savePasswordInCoookies').show();
	}
	else{
		$('.info-right #savePasswordInCoookies').hide();
		$('.info-right #savePasswordInBrowser').show();
	}
	if(Boolean(window.autoLogin.autoLoginSwitch)){
		$('.info-left #switchForAutoLoginOff').hide();
		$('.info-left #switchForAutoLoginOn').show();
	}
	else{
		$('.info-left #switchForAutoLoginOn').hide();
		$('.info-left #switchForAutoLoginOff').show();
	}
}

//填写登录表单并登录
window.autoLogin.writeFormAndLogin = function(){
    $('#loginForm #username').val(window.autoLogin.userInfo.username);
    $('#loginForm #domain').find("option[value='" + window.autoLogin.userInfo.domain + "']").attr("selected", true);
    if(Boolean(window.autoLogin.savePasswordInCookies)){
        $('#loginForm #password').val(base64decode(window.autoLogin.userInfo.password));
    }
    else if(!Boolean($('#loginForm #password').val())){
        showResultBox($('#loginResult'), false, '您的浏览器好像没有自动帮你输入密码，若您的浏览器不支持自动表单填写，请移步“自动登录设置”，开启cookies保存密码！');
        console.log('登录失败');
        return 0;
    }
    if(Boolean(window.autoLogin.autoLoginSwitch)){
		$("button#login").click();
		console.log('已自动登录。');
        window.autoLogin.close();
	}
}

//保存按钮
window.autoLogin.saveButton = function() {
	window.autoLogin.userInfo.username = $.trim($('#loginFormForAutoLogin #usernameForAutoLogin').val());
	$.cookie("sunriseUsername", window.autoLogin.userInfo.username, {expires: 365});
	window.autoLogin.userInfo.domain = $('#loginForm #domain').val();
	$.cookie("sunriseDomain", window.autoLogin.userInfo.domain, {expires: 365});
	$.cookie("autoLoginSwitch", window.autoLogin.autoLoginSwitch, {expires: 365});
	$.cookie("autoLoginsavePasswordInCookies", window.autoLogin.savePasswordInCookies, {expires: 365});
	if(Boolean(window.autoLogin.savePasswordInCookies)){
		window.autoLogin.userInfo.password = base64encode($('#loginFormForAutoLogin #passwordForAutoLogin').val());
		$.cookie("autoLoginPassword", window.autoLogin.userInfo.password, {expires: 365});
	}
}

//密码悬浮显示
window.autoLogin.showPassword = function(){
	$("input[type=password]").mouseover(function(){
		this.type = 'text';
	});
	$("input[type=password]").mouseout(function(){
		this.type = 'password';
	});
}

//登录成功能则关闭页面
window.autoLogin.close = function(){
    window.autoLogin.closeTime = new Date().getTime();
    window.autoLogin.timecount = window.autoLogin.closeTime - parseInt($.cookie('autoLoginCloseTime'));
    showResultBox($('#logoutResult'), true, '自动关闭剩余冷却时间：' + parseInt(60-window.autoLogin.timecount/1000).toString() + ' / 60 秒。',5000)
    if(window.autoLogin.timecount>60000 || window.autoLogin.timecount<10){
        $.cookie('autoLoginCloseTime', window.autoLogin.closeTime,{expires: 365});
        window.close();
        window.open('http://n.njcit.cn/', '_self');
    }
    if($.cookie('autoLoginCloseTime')===undefined){
        $.cookie('autoLoginCloseTime', window.autoLogin.closeTime,{expires: 365});
    }
}

window.autoLogin.insertHTML();
window.autoLogin.showPassword();
window.autoLogin.updateLoginStatus();

