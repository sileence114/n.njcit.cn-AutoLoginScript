// ==UserScript==
// @name         校园网自动登录
// @namespace    http://tampermonkey.net/
// @version      3.0
// @icon         http://n.njcit.cn/Public/Images/favicon.ico
// @description  主要功能：在PCweb端添加手机端认证域；若网页打开没有登录则将自动登录。
// @author       C选项_沉默(GitHub：Preliterate)
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

// ==/UserScript==

'use strict';

console.log('n.njcit.cn\n校园网自动登录脚本已启用。\nGitHub:https://github.com/Preliterate/n.njcit.cn-AutoLoginScript')

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
				window.autoLogin.writeFormAndLogin();
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
	if(Boolean(window.autoLogin.autoLoginSwitch)){
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
	window.opener = null;
	window.open('', '_self');
	window.close();
	setTimeout("showResultBox($('#logoutResult'), true, ' ( ! ) 如果你看到了这条提示，则你的浏览器阻止了我关闭该标签页，请手动关闭。');",6000);
}


window.autoLogin.insertHTML();
window.autoLogin.showPassword();
window.autoLogin.updateLoginStatus();
