cc.Class({
    extends: cc.Component,
    //name: "RankingView",
    properties: {
        rankingScrollView: cc.Sprite,//显示排行榜
    },

    onLoad() {
    },

    start() {
        this.node.active = false;
        this.wxSubView = this.node.getChildByName("RankingView")
            .getComponent(cc.WXSubContextView);
        this.wxSubView.enabled = false;
    },

    showShareMenu () {
        if (CC_WECHATGAME) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
        }
    },

    active () {
        if (!this.node.active) {
            this.node.active = true;
            this.wxSubView.enabled = true;
        }
    },

    showRanking () {
        if (!this.node.active) {
            this.node.active = true;
            this.requestShowFriendsRanking();
        } else {
            this.requestShowFriendsRanking();
        }

        if (!this.wxSubView.enabled) {
            this.wxSubView.enabled = true;
        }
        cc.log("showing ranking...")
    },

    requestShowFriendsRanking () {
        if (CC_WECHATGAME) {
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x1"
            });
        }
    },

    requestShowGroupRanking () {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                success: (res) => {
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "x1",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        } else {
            cc.log("获取群排行榜数据。x1");
        }
    },

    requestShowhorizontalRanking () {
        if (CC_WECHATGAME) {
            window.wx.postMessage({// 发消息给子域
                messageType: 4,
                MAIN_MENU_NUM: "x1"
            });
        } else {
            cc.log("获取横向展示排行榜数据。x1");
        }
    },

    requestSubmitScore (score) {
        if (CC_WECHATGAME) {
            window.wx.postMessage({
                messageType: 3,
                MAIN_MENU_NUM: "x1",
                score: score,
            });
        } else {
            cc.log("提交得分: x1 : " + score);
        }
    },
});
