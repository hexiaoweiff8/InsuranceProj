// 共通方法
import constObj from '/store/const.js';

let common = {
	// -------------------------网络请求----------------------------
	netUtils: {
		// 异步请求
		request(url, data, success, fail, type = "POST"){
			// TODO 获取ssk
			// 获取请求index
			uni.request({
				url: url,
				data: data,
				success: success,
				fail: fail,
				method: type
			});
		},
		
		// 同步请求
		async requestAsync(url, data, success, fail, type = "POST"){
			return await new Promise((resolve, reject) => {
				uni.request({
					url: url,
					data: data,
					success: success,
					fail: fail,
					method: type
				});
			});
		},
	},
	// -----------------------业务请求封装---------------------------
	businessUtils: {
		businessRequest(modelList, data, callback, fail){
			// 将model请求列表合并到data中
			data['modelList'] = modelList;
			// 请求
			this.netUtils.request(constObj.serverUrl + constObj.urlList.businessUrl, data, callback, fail);
		}
	},
	
	// -----------------------界面切换管理器----------------------------
	ViewManager = {
		// view栈
		ViewStack: [],
		// 界面定义
		ViewDic: {
			'../index/index': {type: 3}
			
		},
		// 初始化方法
		init(url){
			let data = this.ViewDic[url];
			this.ViewStack.push({url: url, data: data});
		},
		// 转换界面
		gotoVierw(url, needStack = true, type){
			let data = this.ViewDic[url];
			// 处理带参数url
			if(data == undefined){
				for(let key in this.ViewDic){
					if(url.indexOf(key) > 0){
						data = this.ViewDic[key];
					}
				}
			}
			
			if(data != undefined){
				if(type == undefined){
					type = data.type;
				}
				switch(type){
					case 3:
						uni.navigateTo({
							url: url
						});
					break;
					case 2:
						uni.redirectTo({
							url: url
						});
					break;
					case 1:
						uni.switchTab({
							url: url
						});
					break;
				}else{
					console.log('不存在url', url);
				}
				if(needStack){
					this.ViewStack.push({url:url, data: data});
				}
			}
		},
		// 返回上一界面
		backView(){
			if(this.ViewStack.length > 1){
				let newView = this.ViewStack.pop();
				let preView = this.ViewStack[this.ViewStack.length - 1];
				if(nowView.data.type == 3 && preView.data.type == 3
				|| (nowView.data.type == 3 && preView.data.type == 1)){
					uni.navigateBack();
				}else if(nowView.data.type == 1 && preView.data.type == 3){
					uni.switchTab({
						url: preView.url
					});
				}else if((nowView.data.type == 1 || nowView.data.type == 2 || nowView.data.type == 3)
				 && preView.data.type == 2){
					uni.redirectTo({
						url: url
					});
				}else{
					uni.navigateBack();
				}
			}else{
				uni.switchTab({
					url: '../index/index',
				});
				this.ViewStack = [{url: '../index/index', data: {type: 1}}];
			}
		},
		// 清空
		clear(){
			this.ViewStack = [];
		},
	},
	
	
	// --------------------------错误码管理器--------------------------
	ErrorCodeManager:{
		ErrorCode: {
			  1: { isOk: false, info: '用户不存在' },
			  2: { isOk: true, info: '用户名或密码为空' },
			  3: { isOk: false, info: '微信已注册' },
			  4: { isOk: true, info: '内容不存在' },
			  5: { isOk: true, info: '消息不存在' },
			  6: { isOk: true, info: '关注不存在' },
			  7: { isOk: true, info: '赞不存在' },
			  8: { isOk: true, info: '标签不存在' },
			  9: { isOk: false, info: '微信信息非法' },
			  10: { isOk: true, info: '已经赞过了' },
			  11: { isOk: false, info: '已被封号' },
			  12: { isOk: false, info: '不能关注自己' }, 
			  13: { isOk: false, info: '发布过于频繁' },
			
			  1001: { isOk: false, info: '消息不存在' },
			  1002: { isOk: false, info: '服务器开小差了' },
			  1003: { isOk: false, info: '额,服务器开小差了' },
			  1004: { isOk: false, info: '操作不被允许' },
			  1005: { isOk: false, info: '参数错误' },
			  1006: { isOk: false, info: '访问太快了, 稍等一下' },
			  1007: { isOk: false, info: '登录超时' },
			  1008: { isOk: false, info: '评论中含有敏感词' },
			  1009: { isOk: false, info: '标题中含有敏感词' },
			  1010: { isOk: false, info: '内容中含有敏感词' },
		},
		// 检查错误码是否ok
		checkErrorCode(code){
			if(code >= 0){
				let data = ErrorCode[code];
				if(data == undefined){
					return {isOk: true, info: '未知错误'};
				}
				let {isOk, info} = data;
				// TODO 隐式登录
				return {isOk, info};
			}
		},
	},
	
	// 检查更新
	checkUpdate(){
		#ifdef MP-WEIXIN
		// 如果是微信
		if ("undefined" != typeof (wx)) {
			const updateManager = wx.getUpdateManager();
			updateManager.onCheckForUpdate(function (res) {
			  // 请求完新版本信息的回调
			  console.log(res.hasUpdate)
			});
		
			updateManager.onUpdateReady(function () {
			  wx.showModal({
				title: '更新提示',
				content: '新版本已经准备好，是否重启应用？',
				success(res) {
				  if (res.confirm) {
					// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
					updateManager.applyUpdate();
				  }
				}
			  });
			});
		
			updateManager.onUpdateFailed(function () {
			  // 新版本下载失败
			});
		} else {
			console.log('非微信环境');
		}
		#endif
		
		#ifdef APP-PLUS
		// 检查版本号
		// 如果版本号小于服务器, 则去商城更新
		if(uni.getSystemInfoSync().platform === 'android'){
			// 如果是Android
		}else{
			// TODO 如果是IOS
		}
		#endif
	},
	
	// 第三方登录
	theThirdLogin(type, data){
		// 微信
		// 手机号
		// facebook
		// twitter
		// google
	},
	
	
};


export default common;