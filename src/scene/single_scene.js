/**
 * Created by jingyuan on 2017/1/20.
 */
/*
 *
 */
var MainLayer = cc.Layer.extend({
    _className: 'MainLayer',
    scoreLabel: null, // 分数标签
    xmxx: null,
    music_button: null, // 音乐图标
    level : null,
    levelLabel : null,
    levelScore : null,
    targetLabel: null,
    passSprite : null,
    ctor: function () {
        this._super();

        // 返回图标
        var return_button = new cc.Sprite("#button_back.png");
        return_button.x = parseInt(640 / 6) - 40;
        return_button.y = 960 - 40;
        cc.eventManager.addListener(xxEvents.create_event(this, "return_event"), return_button);
        this.addChild(return_button);

        // 音乐图标
        var m_button;
        if (xx_global_config.IsPlayMusic == true) {
            m_button = new cc.Sprite("#sound_on.png");
        } else {
            m_button = new cc.Sprite("#sound_off.png");
        }
        m_button.x = parseInt(640 / 6) - 40;
        m_button.y = 960 - 110;
        cc.eventManager.addListener(xxEvents.create_event(this, "music_event"), m_button);
        this.music_button = m_button;
        this.addChild(m_button);

        var size = cc.winSize;
        this.level = 1;
        this.levelLabel = new cc.LabelTTF('关卡:  '+this.level, "HKHBJT_FONT", 26);
        this.levelLabel.setColor(cc.color(147, 193, 210));
        this.levelLabel.x = size.width / 2;
        this.levelLabel.y = size.height - size.height / 10 + 65;
        this.addChild(this.levelLabel);
        this.xmxx = new XmxxGame(this, res.Bg, undefined,cc.winSize.height - 136);
        //this.addChild(this.xmxx);


        var bg = new cc.Sprite(res.Bg);
        bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
        bg.setLocalZOrder(-100);
        this.addChild(bg);

        return true;
    },
    sub_init_data: function () {
        var size = cc.winSize;
        if(this.passSprite != null){// 通关消息消失
            this.passSprite.removeFromParent();
            this.passSprite = null;
        }
        if(this.scoreLabel == null){
            this.scoreLabel = new cc.LabelTTF('0', "HKHBJT_FONT", 46);
            this.scoreLabel.setColor(cc.color(255,255,0));
            this.scoreLabel.x = size.width / 2;
            this.scoreLabel.y = size.height - size.height / 10 - 40;
            this.addChild(this.scoreLabel);
        }
        if(this.targetLabel == null) {
            this.targetLabel = new cc.LabelTTF('目标:  ' + this.get_target_score(), "HKHBJT_FONT", 26);
            this.targetLabel.setColor(cc.color(147, 193, 210));
            this.targetLabel.setPosition(cc.winSize.width / 2, cc.winSize.height - 80);
            this.addChild(this.targetLabel);
        }else{
            this.targetLabel.setString('目标:  ' + this.get_target_score());
            this.targetLabel.runAction(cc.blink(1,3));
        }
    },
    judge_pass_level : function () {
        if(this.xmxx.score >= this.levelScore && this.passSprite == null){
            // 播放音效
            if(cc.loader.getRes(res.Passed) && xx_global_config.IsPlayMusic) {cc.audioEngine.playMusic(res.Passed,false);}
            //
            var passed = new cc.Sprite("#passed.png");
            this.addChild(passed);
            passed.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
            passed.setScale(2);
            passed.runAction(cc.sequence(cc.fadeIn(0.1),cc.blink(0.5,2),cc.delayTime(0.2),cc.spawn(new cc.ScaleTo(0.1, 1),cc.moveTo(0.5,100,750))));
            this.passSprite = passed;
        }
    },
    after_remove: function () {
        this.scoreLabel.setString(this.xmxx.score);//'当前得分' +
        this.judge_pass_level();
    },
    deal_with_over: function (left_score, count, score) {
        this.scoreLabel.setString(score);
        if(cc.loader.getRes(res.Plevel) && xx_global_config.IsPlayMusic) {cc.audioEngine.playMusic(res.Plevel,false);}
        this.xmxx.all_blink();
    },
    next_level :function () { // 开始下一关
        if(this.xmxx.score < this.levelScore){
            alert("游戏结束了.");
            cc.director.runScene(new cc.TransitionMoveInR(0.8, new HallScene()));
        }else {
            this.level += 1;
            this.levelLabel.setString('关卡:  ' + this.level);
            //this.scoreLabel.setString('当前得分' + 0);
            this.xmxx.selectLabel.setString('');
            this.xmxx.leftLabel.removeFromParent(true);
            this.xmxx.awardLabel.removeFromParent(true);
            this.xmxx.body.removeFromParent(true);
            var callFunc = cc.callFunc(function () {
                this.xmxx.init_data(undefined, false);
                this.xmxx.createBody();
            }.bind(this));
            this.runAction(cc.sequence(cc.delayTime(0.2), callFunc));
        }

        //清除粒子效果
        for(var xxx =0;xxx<this.xmxx.particless.length;xxx++){
            try {
                if (this.xmxx.particless[xxx] != null && this.xmxx.particless[xxx] != undefined) {
                    this.xmxx.particless[xxx].removeFromParent();
                    this.xmxx.particless[xxx] = null;
                }
            }catch(e){
                cc.log("有异常1:",this.xmxx.particless);
                cc.log("有异常2:",xxx);
            }

        }
        this.xmxx.particless = [];
    },
    return_event: function () { // 返回大厅
        cc.director.runScene(new cc.TransitionMoveInR(0.8, new HallScene()));
    },
    music_event: function () {  // 开关音乐
        if (xx_global_config.IsPlayMusic == true) {
            xx_global_config.IsPlayMusic = false;
            this.music_button.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame("sound_off.png"));
        } else {
            xx_global_config.IsPlayMusic = true;
            this.music_button.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame("sound_on.png"));
        }
    },
    get_target_score : function () {
        if(this.level == 1){
            this.levelScore = 1000;
        }else if(this.level <= 5){
            this.levelScore = 1000 + (this.level-1)*1500;
        }else if(this.level <= 10){
            this.levelScore = 7000 + (this.level-5)*1800;
        }else if(this.level <= 15){
            this.levelScore = 16000 + (this.level-10)*2000;
        }else if(this.level <= 20){
            this.levelScore = 26000 + (this.level-15)*2500;
        }else if(this.level <= 25){
            this.levelScore = 38500 + (this.level-20)*3000;
        }else if(this.level <= 30){
            this.levelScore = 53500 + (this.level-25)*3500;
        }else if(this.level <= 35){
            this.levelScore = 71500 + (this.level-30)*4000;
        }else if(this.level <= 40){
            this.levelScore = 91500 + (this.level-35)*4500;
        }else if(this.level <= 50){
            this.levelScore = 114000 + (this.level-40)*6000;
        }else if(this.level <= 60){
            this.levelScore = 174000 + (this.level-50)*8000;
        }else {
            this.levelScore = 254000 + (this.level-60)*12000;
        }
        return this.levelScore;
    }
});

var MainScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new MainLayer();
        this.addChild(layer);
    }
});
/*
 function conf.getScoreByLevel( level )
 local score = 0
 if level == 1 then
 score = 1000
 elseif level >=2 and level <=5 then
 score = 1000 + (level-1) * 1500
 elseif level >= 6 and level <= 10 then
 score = 7000 + (level-5) * 1800
 elseif level >= 11 and level <= 15 then
 score = 16000 + (level - 10) * 2000
 elseif level >= 16 and level <= 20 then
 score = 26000 + (level - 15) * 2500
 elseif level >= 21 and level <= 25 then
 score = 38500 + (level - 20) * 3000
 elseif level >= 26 and level <= 30 then
 score = 53500 + (level - 25) * 3500
 elseif level >= 31 and level <= 35 then
 score = 71500 + (level - 30) * 4000
 elseif level >= 36 and level <= 40 then
 score = 91500 + (level - 35) * 4500
 elseif level >= 41 and level <= 50 then
 score = 114000 + (level - 40) * 6000
 elseif level >= 51 and level <= 60 then
 score = 174000 + (level - 50) * 8000
 elseif level > 60 then
 score = 254000 + (level - 60) * 12000
 end
 return score
 end
 */
/*
 data: [],//[[5, 1, 1, 1, 4, 2, 5, 5, 2, 5], [2, 5, 4, 1, 1, 4, 4, 5, 2, 2], [4, 2, 3, 1, 5, 1, 1, 2, 1, 3], [1, 5, 1, 4, 1, 5, 5, 2, 3, 3], [2, 2, 5, 5, 4, 4, 2, 2, 5, 3], [4, 2, 2, 5, 4, 1, 1, 2, 1, 4], [3, 5, 2, 4, 5, 1, 2, 1, 3, 1], [4, 3, 1, 2, 2, 5, 4, 3, 4, 2], [4, 5, 4, 1, 1, 1, 1, 2, 2, 5], [3, 2, 3, 3, 4, 1, 3, 2, 1, 5]],
 cells: [],
 selected: [],// 选中的元素
 visited: [],
 score: 0,
 // 加载背景
 loadBackground: function () {
 var bg = new cc.Sprite(res.Bg);
 this.addChild(bg);
 bg.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
 },

 init_data: function () {
 this.data = new Array(10);
 this.visited = new Array(10);
 // 初始化 visited数组,data数组
 for (var i = 0; i < 10; i++) {
 var arr = new Array(10);
 var d = new Array(10);
 for (var j = 0; j < 10; j++) {
 arr[j] = 0;
 d[j] = Math.ceil(Math.random() * 4) + 1;
 }
 this.visited[i] = arr;
 this.data[i] = d;
 }

 this.cells = [];
 this.selected = [];
 this.score = 0;

 this.scoreLabel = new cc.LabelTTF('', "Arial", 38);
 this.selectLabel = new cc.LabelTTF('', "Arial", 38);
 var size = cc.winSize;
 this.scoreLabel.x = size.width / 2;
 this.scoreLabel.y = size.height - size.height / 10;
 this.addChild(this.scoreLabel);
 this.selectLabel.x = size.width / 2;
 this.selectLabel.y = 680;
 this.addChild(this.selectLabel);
 },
 createBody: function () {
 var size = cc.winSize;
 var body = new cc.Sprite();
 body.setTextureRect(cc.rect(0, 0, 0, 0));
 this.addChild(body);
 // 创建SpriteBatchNode
 var batchNode = new cc.SpriteBatchNode(res.NewActsPng);
 body.addChild(batchNode);

 var click_event = this.getClickEvent();
 for (var i = 0; i < 10; i++) {
 var arr = new Array(10);
 for (var j = 0; j < 10; j++) {
 var node = new cc.Sprite("#xxxxx" + this.data[i][j] + ".png");
 cc.eventManager.addListener(click_event.clone(), node);
 node.value = this.data[i][j];
 node.setPosition(j * (size.width / 10) + parseInt(0.5 * node.width), size.width - (i * size.width / 10 + parseInt(node.height / 2)));
 node.setLocalZOrder(9);
 node.id = i * 10 + j + 1;
 node.pos = node.id;
 node.setTag(node.value);

 batchNode.addChild(node);
 //body.addChild(node);
 arr[j] = node;
 }
 this.cells[i] = arr;
 }


 },
 // 寻找
 click: function (pos) {
 // 重置访问标识
 this.reset_visited();
 // 深度遍历
 this.deep_search(parseInt((pos - 1) / 10), (pos - 1) % 10);
 // 如果只有1个元素,清空selected数组
 if (this.selected.length == 1) {
 this.selected.splice(0, this.selected.length);
 } else {
 this.replace_sprites(); // 替换图片
 this.selectLabel.setString(this.selected.length + '连消' + 5 * this.selected.length * this.selected.length + '分');
 if (cc.loader.getRes(res.Select)) {
 cc.audioEngine.playMusic(res.Select, false);
 }
 }
 //console.log('selected:'+this.selected);
 },
 deep_search: function (x, y) {
 this.visited[x][y] = 1;
 if (x - 1 >= 0 && this.visited[x - 1][y] == 0 && this.cells[x][y].value == this.cells[x - 1][y].value) {
 this.deep_search(x - 1, y);
 }
 if (x + 1 <= 9 && this.visited[x + 1][y] == 0 && this.cells[x][y].value == this.cells[x + 1][y].value) {
 this.deep_search(x + 1, y);
 }
 if (y - 1 >= 0 && this.visited[x][y - 1] == 0 && this.cells[x][y].value == this.cells[x][y - 1].value) {
 this.deep_search(x, y - 1);
 }
 if (y + 1 <= 9 && this.visited[x][y + 1] == 0 && this.cells[x][y].value == this.cells[x][y + 1].value) {
 this.deep_search(x, y + 1);
 }
 this.selected[this.selected.length] = x * 10 + y + 1;
 },
 // 将选中的星星变换图形
 replace_sprites: function () {
 if (this.selected.length == 0) return false;
 var i, j, k, node, frame_name;
 for (k = 0; k < this.selected.length; k++) {
 i = parseInt((this.selected[k] - 1) / 10);
 j = (this.selected[k] - 1) % 10;
 node = this.cells[i][j];
 if (node.getTag() < 6) {
 frame_name = "xxxxxclc" + node.value + ".png";
 node.setTag(node.tag + 5);
 }
 else {
 frame_name = "xxxxx" + node.value + ".png";
 node.setTag(node.tag - 5);
 }
 node.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frame_name));
 }
 },
 // 点击事件
 getClickEvent: function () {
 var listener = cc.EventListener.create({
 event: cc.EventListener.TOUCH_ONE_BY_ONE,//MOUSE,
 swallowTouches: true,
 target: this,
 onTouchBegan: function (touch, event) {
 // 判断是否命中
 var target = event.getCurrentTarget();
 var size = target.getContentSize();
 var posInNode = target.convertToNodeSpace(touch.getLocation());
 var rect = cc.rect(0, 0, size.width, size.height);
 if (!(cc.rectContainsPoint(rect, posInNode))) {
 return false;
 }

 var p = target.parent.parent.parent;
 if (p.selected.length == 0) {
 p.click(target.pos);
 p.jump();
 } else {
 //判定
 if (p.selected.indexOf(target.pos) != -1) {
 p.score += p.selected.length * p.selected.length * 5;
 p.scoreLabel.setString('当前得分' + p.score);
 for (var i = 0; i < p.selected.length; i++) {
 var pos = p.selected[i];
 var cell = p.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10];
 cell.removeFromParent(true);
 p.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10] = 0;

 if (!cc.sys.isMobile) {
 var particle = new cc.ParticleSystem(res.Particle); // 粒子效果
 //var particle = p.particle.clone();
 particle.setPosition(cc.p(32 + parseInt((pos - 1) % 10) * 64, 640 - 32 - parseInt((pos - 1) / 10) * 64));
 p.addChild(particle);
 }
 }
 p.drop_down();
 p.move_left();
 cc.audioEngine.playMusic(res.Pop, false);
 p.selected.splice(0, p.selected.length);
 p.is_over();
 } else {
 p.replace_sprites();
 p.selected.splice(0, p.selected.length);
 p.click(target.pos);
 p.jump();
 }

 }
 // TODO
 //var newtexture = cc.textureCache.addImage("#xxxxxclc5.png");
 //target.initWithFile("#xxxxxclc5.png");

 return true;// 必须
 }
 });
 return listener;
 },
 reset_visited: function () {
 for (var i = 0; i < 10; i++) {
 for (var j = 0; j < 10; j++) {
 this.visited[i][j] = 0;
 }
 }
 },
 jump: function () {
 if (this.selected.length == 0) {
 return false;
 }
 var jump = cc.jumpBy(0.3, cc.p(0, 0), 20, 1);// 原地跳20px,共跳一次.
 for (var i = 0; i < this.selected.length; i++) {
 var pos = this.selected[i];
 var cell = this.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10];
 cell.setLocalZOrder(9999);
 cell.runAction(jump.clone());
 cell.setLocalZOrder(9);
 }
 },
 drop_down: function () {
 for (var j = 0; j < 10; j++) {// 从第一列开始处理
 var i = 9, sp = 99;
 while (i > 0) {
 while (i > 0 && this.cells[i][j] != 0) {
 i--;
 }
 sp = i - 1;
 while (sp >= 0 && this.cells[sp][j] == 0) {
 sp--;
 }
 if (i > 0 && sp >= 0) {
 var up = cc.moveBy(0.15, 0, 32);
 var down = cc.moveBy(0.15, 0, -this.cells[sp][j].getContentSize().height * (i - sp) - 32);
 this.cells[sp][j].runAction(cc.sequence(up.clone(), down.clone()));
 this.cells[i][j] = this.cells[sp][j];
 this.cells[i][j].pos = i * 10 + j + 1; // 更新位置
 this.cells[sp][j] = 0;
 }
 i--;
 }
 }
 },
 move_left: function () {
 var flag = 0, x = -1;
 if (this.cells[9][9] == 0) {
 flag = -1;
 }
 for (var j = 0; j < 10; j++) {
 if (this.cells[9][j] == 0) {
 if (flag != -1) flag = 1;
 x = j + 1;
 while (x < 10 && this.cells[9][x] == 0) {
 x++;
 }
 if (x < 10) {
 var left = cc.moveBy(0.15, cc.p(-this.cells[9][x].getContentSize().width * (x - j), 0));
 for (var i = 0; i < 10; i++) {
 if (this.cells[i][x] == 0) continue;
 this.cells[i][x].runAction(left.clone());
 this.cells[i][j] = this.cells[i][x];
 this.cells[i][j].pos = i * 10 + j + 1; // 更新位置
 this.cells[i][x] = 0;
 }

 }

 }
 }
 // 最后一列置0
 if (flag == 1) {
 for (var i = 0; i < 10; i++) {
 this.cells[i][9] = 0;
 }
 }
 },
 is_over: function () { // 判断是否完成
 var flag = true;
 for (var i = 0; i < 10; i++) {
 for (var j = 0; j < 10; j++) {
 if (i - 1 >= 0 && this.cells[i - 1][j] != 0 && this.cells[i - 1][j].value == this.cells[i][j].value) {
 flag = false;
 i = 10;
 j = 10;
 break;
 }
 if (i + 1 > 10 && this.cells[i + 1][j] != 0 && this.cells[i + 1][j].value == this.cells[i][j].value) {
 flag = false;
 i = 10;
 j = 10;
 break;
 }
 if (j - 1 >= 0 && this.cells[i][j - 1] != 0 && this.cells[i][j - 1].value == this.cells[i][j].value) {
 flag = false;
 i = 10;
 j = 10;
 break;
 }
 if (j + 1 < 10 && this.cells[i][j + 1] != 0 && this.cells[i][j + 1].value == this.cells[i][j].value) {
 flag = false;
 i = 10;
 j = 10;
 break;
 }
 }
 }
 if (flag) {
 this.deal_with_over();
 }
 return flag;
 },
 deal_with_over: function () { // 处理结束
 var count = 0;
 for (var i = 0; i < 10; i++) {
 for (var j = 0; j < 10; j++) {
 if (this.cells[i][j] != 0) {
 count++;
 }
 }
 }
 var left_score = 0;
 if (count < 10) {
 left_score = 2000 - count * count * 20;
 this.score += left_score;
 this.scoreLabel.setString('得分' + this.score);
 }

 var label1 = new cc.LabelTTF("奖励" + left_score, "Arial", 40);
 label1.x = cc.winSize.width / 2;
 label1.y = 480;
 this.addChild(label1);
 var label2 = new cc.LabelTTF("剩余" + count + "个星星", "Arial", 40);
 label2.x = cc.winSize.width / 2;
 label2.y = 440;
 this.addChild(label2);
 //cc.audioEngine.playMusic(res.Passed,false);
 },
 print: function () { // 测试使用,打印星星阵列
 for (var i = 0; i < 10; i++) {
 var str = '[';
 if (this.cells[i][0] != 0) {
 str += this.cells[i][0].value + ',';
 if (this.cells[i][0].pos < 10) str += '0';
 str += this.cells[i][0].pos + ']'
 }
 else {
 str += '0,00]'
 }
 for (var j = 1; j < 10; j++) {
 str += ',[';
 if (this.cells[i][j] != 0) {
 str += this.cells[i][j].value + ',';
 if (this.cells[i][j].pos < 10) str += '0';
 str += this.cells[i][j].pos + ']'
 }
 else {
 str += '0,00]';
 }
 }
 console.log(str);
 }
 }*/

/*

 /*
 var system = {
 win: false,
 mac: false,
 xll: false,
 ipad:false
 };
 //检测平台
 var p = navigator.platform;
 system.win = p.indexOf("Win") == 0;
 system.mac = p.indexOf("Mac") == 0;
 system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
 system.ipad = (navigator.userAgent.match(/iPad/i) != null)?true:false;

 //alert(navigator.platform);
 if(system.win || system.mac){
 //alert('ok');
 }else{

 }
 -----
 // 红色背景,用于测试
 body.setColor(cc.color(255,0,0));
 var tex = new cc.Texture2D();
 var buffer = new Uint8Array(4);
 for (var i=0;i<4;i++) {
 buffer[i] = 255;
 }
 tex.initWithData(buffer, cc.Texture2D.PIXEL_FORMAT_RGBA8888, 1, 1, size);
 body.texture = tex;

 //body.setTextureRect(cc.rect(0,0,size.width,size.width));
 //body.setPosition(size.width /2, size.width /2);
 //body.setLocalZOrder(1);
 // body.setAnchorPoint.call(this,0.5,0.5)
 // 1.将纹理加载到内存
 //cc.spriteFrameCache.addSpriteFrames(res.NewActsPlist,cc.textureCache.addImage(res.NewActsPng));
 */