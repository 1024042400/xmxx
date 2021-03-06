/**
 * Created by jingyuan on 2017/1/17.
 */
var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;
var PkLayer = cc.Layer.extend({
    _className : 'PkLayer',
    socket : null,
    headerImages : null,
    idLabels : null,
    scoreLabels : null,
    _scoreLabel: null, // 本人分数标签
    status : null,
    players : null,
    rank : 6,
    rankLabel : null,
    pid : null,
    waitingBg : null,
    xmxx : null,
    countDownTimeControl : null,
    gamingTimeControl : null,
    gamingTime : null,
    gamingTimeLabel : null,
    process : null,
    pr_count : 0,
    ctor:function () {
        this._super();
        this.pid = xxPids[parseInt(Math.random()*xxPids.length)];
        this.loadBg();
        this.init_data();
        this.loadHeader();
        this.loadWebSocket();
    },
    sub_init_data : function () {},
    send_upscore : function () {
        var data = {"cscore":this.xmxx.score - this.xmxx.add_score,"ascore":this.xmxx.add_score,"is_over" : this.xmxx.game_is_over};
        //cc.log('data:',data);
        data = xxtea.encode(JSON.stringify(data));
        this.socket.send(this.send_diy_data(data,"upscore"));
    },
    after_remove : function () {
        this._scoreLabel.setString(this.xmxx.score);
    },
    deal_with_over : function () {this.xmxx.selectLabel.setString('');this.xmxx.all_blink();},
    loadWebSocket : function () {
        var socket = new WebSocket("ws://game.appseye.com/ws/1/"+this.pid);//"ws://echo.websocket.org");
        var self = this;
        this.socket = socket;
        socket.binaryType = "arraybuffer";
        socket.onopen = function (event) {
            console.log("连接成功,开始发送数据");
        };
        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            if(data.type == "welcome"){
                self.status = 10;
                var strData = "{\"command\":\"subscribe\", \"identifier\":\"{\\\"channel\\\":\\\"PkaChannel\\\"}\"}";
                socket.send(strData);
                cc.log("welcome发送完成")
            }else if(data.type == "confirm_subscription"){
                self.status = 20;
                var strData = self.send_diy_data("","jroom");
                socket.send(strData);
                cc.log("confirm_subscription发送完成");
            }else if(data.type != "ping"){
                var d = JSON.parse(event.data);
                var message = JSON.parse(d.message);
                var type = message.type;

                //cc.log("收到响应数据1:",message.type);
                //cc.log("收到响应数据2:",JSON.parse(d.message));
                //cc.log("收到响应数据3:",event.data);

                if(type == "room_joined"){
                    self.status = 30;
                    self.update_players(message.players);
                    if(self.waitingBg == null){
                        self.load_waiting_bg(message.crt_ts,message.ts,message.wait_sec);
                    }
                }else if(type == "room_prestart"){
                    self.status = 40;
                    self.waitingBg.removeFromParent();
                    self.xmxx = new XmxxGame(self,null,message.xxs,cc.winSize.height - 210);
                    self.run_prestart(message.game_sec,message.players.length);
                }else if (type == "room_start"){
                    self.status = 50;
                } else if(type == "room_quit"){
                    self.update_players(message.players);
                } else if(type == "room_upsocre"){
                    self.update_score(message.players);
                    self.update_rank(message.players);
                } else if(type == "room_cancel"){
                    cc.director.runScene(new cc.TransitionFade(1,new HallScene("无人迎战")));
                } else if(type == "room_over"){
                    cc.director.runScene(new cc.TransitionFade(1,new OverScene(message.players,self.pid)));
                }

            }

        };
        socket.onerror = function () {
            cc.log("发生错误!");
        };
        socket.onclose = function () {
            cc.log("关闭连接");
            this.socket = null;
        };
    },
    init_data : function () {
        this.status = 0;
        this.rank = 6;
        this.headerImages = new Array(6);
        this.idLabels = new Array(6);
        this.scoreLabels = new Array(6);
        this.players = new Array(6);
    },
    loadBg : function () {
        var bg = new cc.Sprite(res.PkBg);
        bg.setLocalZOrder(-2);
        bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
        this.addChild(bg);
    },
    loadHeader : function () { // 初始化头像
        for(var i=0;i<6;i++){
            var headerImage = new cc.Sprite("#icon_man_0.png");
            headerImage.x = 53 + 107*i;
            headerImage.y = 960-20-29;
            headerImage.png = 0;
            this.headerImages[i] = headerImage;
            this.addChild(headerImage);

            var idLabel = new cc.LabelTTF('等待加入',"Arial",22);
            idLabel.x = headerImage.x;
            idLabel.y = headerImage.y-45;
            this.idLabels[i] = idLabel;
            this.addChild(idLabel);

            var scoreLabel = new cc.LabelTTF('',"Arial",22);
            scoreLabel.score = 0;
            scoreLabel.x = idLabel.x;
            scoreLabel.y = idLabel.y -30;
            this.scoreLabels[i] = scoreLabel;
            this.addChild(scoreLabel);
        }
    },
    update_players : function(_players) { //更新人物头像、id、分数
        if(_players != undefined){
            var i=0;
            for(;i<_players.length;i++){
                this.players[i] = JSON.parse(_players[i]);
            }
            for(;i<6;i++){
                this.players[i] = undefined;
            }
        }
        for(var i=0;i<6;i++){
            if(this.players[i] == undefined){
                if(this.headerImages[i].png != 0) {
                    this.headerImages[i].initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame("icon_man_0.png"));
                    this.scoreLabels[i].setString('');
                }
                this.idLabels[i].setString('等待加入');
                this.idLabels[i].setFontFillColor(cc.color(255,255,255));
                continue;
            }
            if(this.players[i].pid == this.pid){
                this.headerImages[i].initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame("icon_man_102.png"));
                this.headerImages[i].png = 2;
            }else{
                this.headerImages[i].initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame("icon_man_101.png"));
                this.headerImages[i].png = 1;
            }

            this.idLabels[i].setString(this.players[i].pid);
            if(this.players[i].pid == this.pid){
                this.idLabels[i].setFontFillColor(cc.color(234,0,0));
                this.scoreLabels[i].setFontFillColor(cc.color(255,255,0));
            }
            this.scoreLabels[i].setString(this.players[i].score);
        }
    },
    update_rank : function (players) {
        for(var i=0;i<players.length;i++){
            var player = JSON.parse(players[i]);
            if(player.pid == this.pid){
                this.rankLabel.setString("排名"+player.rank+"/"+players.length);
                break;
            }
        }
    },
    load_waiting_bg : function (crt_ts,ts,wait_sec) { // 等待时的图片、倒计时、以及文字描述.
        this.waitingBg = new cc.Sprite("#waiting_bg.png");
        var wb = this.waitingBg;
        wb.x = cc.winSize.width/2;
        wb.y = cc.winSize.height/2;

        var timeLabel = new cc.LabelTTF(Math.ceil(wait_sec-Math.ceil(ts-crt_ts)) + 's',"HKHBJT_FONT",48);
        timeLabel.setFontFillColor(cc.color(234,0,0));
        timeLabel.x = wb.getContentSize().width/2;
        timeLabel.y = 35;
        this.countDownTimeControl = new CountDownTimeControl(1,Math.ceil(wait_sec-Math.ceil(ts-crt_ts)),function (all_time) {
            timeLabel.setString(parseInt(all_time) + 's');
        },function(){this.cleanUp();});
        this.countDownTimeControl.startCountDownTime();

        var ttfLabel1 = new cc.LabelTTF('即将开始,请稍后',"HKHBJT_FONT",36);
        ttfLabel1.x = wb.getContentSize().width/2;
        ttfLabel1.y = -40;

        var ttfLabel2 = new cc.LabelTTF('60s内得分越高,奖励越丰厚',"HKHBJT_FONT",36);
        ttfLabel2.x = ttfLabel1.x;
        ttfLabel2.y = ttfLabel1.y - 60;

        wb.timeLabel = timeLabel;
        wb.ttfLabel1 = ttfLabel1;
        wb.ttfLabel2 = ttfLabel2;

        wb.addChild(timeLabel);
        wb.addChild(ttfLabel1);
        wb.addChild(ttfLabel2);
        this.addChild(wb);
    },
    update_score : function (_players) {
        for(var i=0;i<_players.length;i++){
            var player = JSON.parse(_players[i]);
            this.scoreLabels[i].setString(player.score);
        }
    },
    run_prestart : function (game_sec,people_count) { // 3,2,1,go!
        this.set_process();
        //设置本人分数标签
        this._scoreLabel = new cc.LabelTTF('0', "HKHBJT_FONT", 46);
        this._scoreLabel.setColor(cc.color(255,255,0));
        this._scoreLabel.setPosition(cc.winSize.width / 2,cc.winSize.height - 210);
        this.addChild(this._scoreLabel);

        this.rankLabel = new cc.LabelTTF("排名"+people_count+"/"+people_count, "HKHBJT_FONT", 36);
        this.rankLabel.setPosition(cc.winSize.width / 2 + 200,cc.winSize.height - 210);
        this.addChild(this.rankLabel);

        this.gamingTime = game_sec;
        this.gamingTimeLabel = new cc.LabelTTF(this.gamingTime + 's',"HKHBJT_FONT",30);
        this.gamingTimeLabel.setFontFillColor(cc.color(147, 193, 210));
        this.gamingTimeLabel.x = 605;
        this.gamingTimeLabel.y = 800;
        this.addChild(this.gamingTimeLabel);
        var self = this;

        // 60秒倒计时
        this.gamingTimeControl = new CountDownTimeControl(1,game_sec,function () {
            self.gamingTime -=1;
            self.gamingTimeLabel.setString(self.gamingTime + 's');

            if(self.gamingTime>=0){
                self.process.mvd.runAction(cc.moveBy(1,-8.25,0));
            }

            if(self.gamingTime <= 10){
                self.gamingTimeLabel.setFontFillColor(cc.color(234,0,0));
            }
        },function(){this.cleanUp();});

        var pr3 = new cc.Sprite("#prestart_3.png");
        pr3.x = cc.winSize.width/2;
        pr3.y = cc.winSize.height/2;
        var pr2 = new cc.Sprite("#prestart_2.png");
        pr2.x = cc.winSize.width/2;
        pr2.y = cc.winSize.height/2;
        var pr1 = new cc.Sprite("#prestart_1.png");
        pr1.x = cc.winSize.width/2;
        pr1.y = cc.winSize.height/2;
        var pr_go = new cc.Sprite("#prestart_go.png",1001);
        pr_go.x = cc.winSize.width/2;
        pr_go.y = cc.winSize.height/2;

        pr_go.event_1 = function () {};
        cc.eventManager.addListener(xxEvents.create_event(pr_go, "event_1"), pr_go);
        pr3.setScale(0.01);
        pr2.setScale(0.01);
        pr1.setScale(0.01);
        pr_go.setScale(0.01);

        var dialogLayer = new cc.LayerColor(cc.color(0,0,0,0));
        this.addChild(dialogLayer,1001);
        dialogLayer.event_1 = function () {};
        cc.eventManager.addListener(xxEvents.create_event(dialogLayer, "event_1"), dialogLayer);


        var callFunc = cc.callFunc(function () {
            pr3.removeFromParent();
            pr2.removeFromParent();
            pr1.removeFromParent();
            pr_go.removeFromParent();
            dialogLayer.removeFromParent();
        }.bind(this));
        self.addChild(pr3);
        self.addChild(pr2);
        self.addChild(pr1);
        self.addChild(pr_go);

        // self.addChild(pr2);self.addChild(pr1);
        pr3.runAction(cc.sequence(cc.delayTime(1),cc.spawn(new cc.ScaleTo(0.1, 1),cc.fadeIn(0.1)),cc.fadeOut(0.9)));
        pr2.runAction(cc.sequence(cc.delayTime(2),cc.spawn(new cc.ScaleTo(0.1, 1),cc.fadeIn(0.1)),cc.fadeOut(0.9)));
        pr1.runAction(cc.sequence(cc.delayTime(3),cc.spawn(new cc.ScaleTo(0.1, 1),cc.fadeIn(0.1)),cc.fadeOut(0.9)));
        pr_go.runAction(cc.sequence(cc.delayTime(4),cc.spawn(new cc.ScaleTo(0.1, 1.5),cc.fadeIn(0.1)),cc.fadeOut(0.9),callFunc));


        var t_control = new CountDownTimeControl(0.1,60,function () {
            self.pr_count ++;
            //cc.log("pr_count",self.pr_count);

            var dist = Math.ceil(self.pr_count*51/60);
            var rect = self.process.top.getTextureRect();
            self.process.top.setTextureRect(cc.rect(rect.x,rect.y,510-dist,30));
        },function(){this.cleanUp();});

        this.runAction(cc.sequence(cc.delayTime(4),cc.callFunc(function () {
            self.gamingTimeControl.startCountDownTime();
            t_control.startCountDownTime();
        }.bind(self))));
    },
    set_process : function () {
        this.process = new cc.Sprite();

        var bot  = new cc.Sprite("#progress_bot.png");
        bot.setPosition(cc.winSize.width/2,800);
        this.addChild(bot,10000);

        var top  = new cc.Sprite("#progress_top.png");
        top.setPosition(64,785);
        top.setAnchorPoint(0,0);
        this.addChild(top,10001);
        var rect = top.getTextureRect();
        //top.setTextureRect(cc.rect(rect.x,rect.y,493,30));


        var mvd = new cc.Sprite("#progress_icon.png");
        mvd.setPosition(640-75,800);
        this.addChild(mvd,10002);
        //cc.log(mvd.getContentSize());
        this.process.bot = bot;
        this.process.top = top;
        this.process.mvd = mvd;
    },
    send_diy_data : function (data,action) {
        return "{\"command\":\"message\",\"identifier\":\"{\\\"channel\\\":\\\"PkaChannel\\\"}\",\"data\":\"{\\\"data\\\":\\\""+data+"\\\",\\\"action\\\":\\\""+action+"\\\"}\"}";
    }
});
var PkScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new PkLayer();
        this.addChild(layer);
    }
});