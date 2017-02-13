/**
 * Created by jingyuan on 2017/2/8.
 */
var OverLayer = cc.Layer.extend({
    ctor:function (players,pid) {
        this._super();
        // 1.背景
        var bg = new cc.Sprite(res.PkBg);
        bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
        this.addChild(bg,-100);

        var over_bg = new cc.Sprite(res.OverBg);
        over_bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2+50);
        this.addChild(over_bg,-50);

        // 比赛结果
        for(var i=0;i<players.length;i++){ //
            this.create_over_labels(over_bg,JSON.parse(players[i]),i,pid);
        }

        // 再来一局
        var button_blue = new cc.Sprite("#button_blue.png");
        button_blue.setPosition(cc.winSize.width / 2-150,cc.winSize.height / 6 - 30);
        this.addChild(button_blue,10);

        var blueLabel = new cc.LabelTTF("再来一局","Arial",30);
        blueLabel.setPosition(button_blue.x,button_blue.y);
        this.addChild(blueLabel,20);

        button_blue.event_1 = function(){cc.director.runScene(new cc.TransitionMoveInB(1,new PkScene()));}
        cc.eventManager.addListener(xxEvents.create_event(button_blue, "event_1"), button_blue);

        // 返回大厅
        var button_green = new cc.Sprite("#button_green.png");
        button_green.setPosition(cc.winSize.width / 2+150,cc.winSize.height / 6 - 30);
        this.addChild(button_green,10);

        var greenLabel = new cc.LabelTTF("返回大厅","Arial",30);
        greenLabel.setPosition(button_green.x,button_green.y);
        this.addChild(greenLabel,20);

        button_green.event_1 = function(){cc.director.runScene(new cc.TransitionFade(1,new HallScene()));}
        cc.eventManager.addListener(xxEvents.create_event(button_green, "event_1"), button_green);
        return true;
    },
    create_over_labels : function (bg,player,i,pid) {

        var color = null;
        if(parseInt(pid) == parseInt(player.pid)){
            color = cc.color(234,0,0);
        }else{
            color = cc.color(0xE0,0xE5,0xE0,60);
        }

        var pos_y = 420-i*70;
        var rankLabel = new cc.LabelTTF(player.rank,"Arial",30);//
        rankLabel.setPosition(60,pos_y);
        rankLabel.setFontFillColor(color);
        bg.addChild(rankLabel);

        var idLabel = new cc.LabelTTF(player.pid,"Arial",30);//
        idLabel.setPosition(180,420-i*70);
        idLabel.setFontFillColor(color);
        bg.addChild(idLabel);

        var scoreLabel = new cc.LabelTTF(player.score + "分","Arial",30);//
        scoreLabel.setPosition(350,pos_y);
        scoreLabel.setFontFillColor(color);
        bg.addChild(scoreLabel);

        var goinLabel = new cc.LabelTTF(player.dami + "金币","Arial",30);//
        goinLabel.setPosition(500,pos_y);
        goinLabel.setFontFillColor(color);
        bg.addChild(goinLabel);
    }
});

var OverScene = cc.Scene.extend({
    overLayer : null,
    ctor:function (players,pid) {
        this._super();
        this.overLayer = new OverLayer(players,pid);
        return true;
    },
    onEnter:function () {
        this._super(); //这里很要初始化父类
        this.addChild(this.overLayer);
    }
});