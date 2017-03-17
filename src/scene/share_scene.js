/**
 * Created by jingyuan on 2017/1/16.
 * 大厅
 */

var ShareLayer = cc.Layer.extend({
    _className: 'MainLayer',
    xmxx: null,
    music_button: null, // 音乐图标
    one : null,
    two : null,
    three:null,
    four: null,
    ctor: function () {
        this._super();

        this.xmxx = new XmxxGame(this, res.Bg, undefined,cc.winSize.height - 136);
        this.addChild(this.xmxx);

        this.one = this.add_child("#1.png",180,910,0.9);
        this.two = this.add_child("#2.png",220,845,0.8);
        this.three=this.add_child("#3.png",420,790,0.8);
        var button = this.add_child("#4.png",530,900);
        button.event_1 = function () {
            if(download) download();
        };
        cc.eventManager.addListener(xxEvents.create_event(button, "event_1"), button);
        this.four = button;

        // 统计
        if(load_success) load_success();
        return true;
    },
    sub_init_data: function () {
    },
    after_remove: function () {
        this.xmxx.selectLabel.setString('');
    },
    deal_with_over: function (left_score, count, score) {
        if(cc.loader.getRes(res.Plevel) && xx_global_config.IsPlayMusic) {cc.audioEngine.playMusic(res.Plevel,false);}
        var self = this;
        this.runAction(cc.sequence(cc.delayTime(0.3),cc.callFunc(function () {
            self.xmxx.all_blink();
        })));
        self = this;

        this.runAction(cc.sequence(cc.delayTime(1.5),cc.callFunc(function () {
            self.two.runAction(cc.fadeOut(1));
            self.three.runAction(cc.fadeOut(1));
            self.four.runAction(cc.fadeOut(1));
            self.xmxx.awardLabel.runAction(cc.fadeOut(1));
            self.xmxx.leftLabel.runAction(cc.fadeOut(1));
        })));

        this.runAction(cc.sequence(cc.delayTime(2.7),cc.callFunc(function () {
            self.xmxx.scoreLabel.runAction(cc.sequence(cc.spawn(new cc.ScaleTo(1,1.2),cc.moveBy(0.5,0,-50))));
            var down = self.add_child("#5.png",320,400,0.01);
            down.runAction(cc.sequence(cc.spawn(new cc.ScaleTo(1,1.2),cc.fadeIn(1))));

            // 超过多少玩家
            var beyond = new cc.LabelTTF('超过'+(self.percent(score))+'%的玩家', "HKHBJT_FONT", 30);
            beyond.setPosition(cc.winSize.width/2,625);
            beyond.setScale(0.001);
            self.addChild(beyond);
            beyond.runAction(cc.sequence(cc.spawn(new cc.ScaleTo(1,1),cc.fadeIn(1))));

            down.event_1 = function () {if(download) download();};
            cc.eventManager.addListener(xxEvents.create_event(down, "event_1"), down);
        })));
    },
    add_child : function (url,x,y,size) {
        var spr = new cc.Sprite(url);
        spr.setPosition(x,y);
        if(size){
            spr.setScale(size);
        }
        this.addChild(spr);
        return spr;
    },
    percent : function (score) {
        var ret = null;
        if(score<1000){
            ret = score/101;
        }else if(score < 1200){
            ret = (score-1000)/20.2+10;
        }else if(score < 1500){
            ret = (score-1200)/30.3+20;
        }else if(score < 1700){
            ret = (score-1500)/20.1+30;
        }else if(score < 2000){
            ret = (score-1700)/30.1+40;
        }else if(score < 2750){
            ret = (score-2000)/75.2+50;
        }else if(score < 3500){
            ret = (score-2750)/75.1+60;
        }else if(score < 4000){
            ret = (score-3500)/80.1+70;
        }else if(score < 5000){
            ret = (score-4000)/100.3+80;
        }else if(score < 10000){
            ret = (score-5000)/1000.3+95;
        }else{
            ret = 99.99;
        }

        ret+=5;
        if(ret > 100){
            ret = 99.99
        }
        return ret.toFixed(2);
    }
});

var ShareScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new ShareLayer();
        this.addChild(layer);
    }
});