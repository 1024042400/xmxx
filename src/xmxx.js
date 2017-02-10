/**
 * Created by jingyuan on 2017/1/19.
 */
var XmxxGame = cc.Node.extend({
    _className : "XmxxGame",
    diy_parent : null,
    self   : null,
    body   : null, // body
    data : [],//[[5, 1, 1, 1, 4, 2, 5, 5, 2, 5], [2, 5, 4, 1, 1, 4, 4, 5, 2, 2], [4, 2, 3, 1, 5, 1, 1, 2, 1, 3], [1, 5, 1, 4, 1, 5, 5, 2, 3, 3], [2, 2, 5, 5, 4, 4, 2, 2, 5, 3], [4, 2, 2, 5, 4, 1, 1, 2, 1, 4], [3, 5, 2, 4, 5, 1, 2, 1, 3, 1], [4, 3, 1, 2, 2, 5, 4, 3, 4, 2], [4, 5, 4, 1, 1, 1, 1, 2, 2, 5], [3, 2, 3, 3, 4, 1, 3, 2, 1, 5]],cells
    cells :[],
    selected :[],
    visited : [],
    score : 0,
    add_score : 0,
    selectLabel: '',  // 8连消320分
    selectLabelStatus : 0,
    leftLabel : null, // 剩余0个星星
    awardLabel: null, // 奖励2000分
    game_is_over : false, // 游戏是否结束标志
    particle :null, // 粒子效果
    particleCount : 0, // 粒子效果个数,手机端每次最多6个,考虑性能
    particless:[],
    ctor:function (parent,res_bg,data) {
        this._super();
        this.diy_parent = parent;
        this.self = this;
        this.loadBackground(res_bg);
        this.init_data(data);
        this.createBody();
        return true;
    },
    loadBackground : function (res_bg) {
        if(res_bg == null || res_bg == undefined) return false;
        var bg = new cc.Sprite(res_bg);
        bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
        bg.setLocalZOrder(-100);
        this.diy_parent.addChild(bg);
    },
    init_data : function (data,clear_score) {
        if(data == undefined || data == null){
            data = new Array(10);
            for (var i = 0; i < 10; i++) {
                var d = new Array(10);
                for (var j = 0; j < 10; j++) {
                    d[j] = Math.ceil(Math.random() * 3);
                }
                data[i] = d;
            }
        }
        if(clear_score == undefined){clear_score = true;}
        this.data = data;
        this.visited = new Array(10);
        // 初始化 visited数组,data数组
        for(var i=0;i<10;i++){
            var arr = new Array(10);
            for(var j=0;j<10;j++){
                arr[j] = 0;
            }
            this.visited[i] = arr;
        }

        this.cells = [];
        this.selected = [];
        this.add_score = 0;
        if(clear_score) {this.score = 0;}
        this.game_is_over = false;
        this.particle = new cc.ParticleSystem(res.Particle);

        this.selectLabel = new cc.LabelTTF('',"Arial",38);
        this.selectLabel.setPosition(cc.winSize.width/2,680);
        this.diy_parent.addChild(this.selectLabel);
        this.selectLabelStatus = 0;

        this.particleCount = 0;
        this.diy_parent.sub_init_data();
    },
    createBody : function(){
        var size = cc.winSize;
        var body = new cc.Sprite();
        this.body = body;
        body.setTextureRect(cc.rect(0,0,0,0));
        this.diy_parent.addChild(body);
        // 创建SpriteBatchNode
        var batchNode = new cc.SpriteBatchNode(res.NewActsPng);
        body.addChild(batchNode);

        var click_event = this.getClickEvent();
        for(var i=0;i<10;i++) {
            var arr = new Array(10);
            for(var j=0;j<10;j++) {
                var node = new cc.Sprite("#xxxxx" + this.data[i][j] + ".png");
                cc.eventManager.addListener(click_event.clone(), node);
                node.value = this.data[i][j];
                node.setPosition(j * (size.width/10) + parseInt(0.5*node.width),size.width - (i * size.width / 10 + parseInt(node.height / 2)));
                node.setLocalZOrder(9);
                node.id = i * 10 + j + 1;
                node.pos = node.id;
                node.setTag(node.value);
                var sca = Math.random()-0.2;
                if(sca<0)  sca= Math.random();
                node.setScale(sca);
                node.runAction(new cc.ScaleTo(0.4+Math.random(), 1)); //0.4+Math.random()秒,从小变到大,1为100%

                batchNode.addChild(node);
                //body.addChild(node);
                arr[j] = node;
            }
            this.cells[i] = arr;
        }

    },
    // 寻找
    click : function(pos){
        // 重置访问标识
        this.reset_visited();
        // 深度遍历
        this.deep_search( parseInt((pos-1)/10) , (pos-1)%10 );
        // 如果只有1个元素,清空selected数组
        if(this.selected.length == 1)   {
            this.selected.splice(0,this.selected.length);
        } else {
            this.replace_sprites(); // 替换图片
            this.selectLabel.setString(this.selected.length+'连消'+5*this.selected.length*this.selected.length+'分');
            if(cc.loader.getRes(res.Select) && xx_global_config.IsPlayMusic) {cc.audioEngine.playMusic(res.Select,false);}

            this.selectLabelStatus = 0;
            this.selectLabel.runAction(cc.fadeIn(0.001));
        }
    },
    deep_search : function(x,y){
        this.visited[x][y] = 1;
        if(x-1>=0 && this.visited[x-1][y] == 0 && this.cells[x][y].value == this.cells[x-1][y].value) {this.deep_search(x-1,y);}
        if(x+1<=9 && this.visited[x+1][y] == 0 && this.cells[x][y].value == this.cells[x+1][y].value) {this.deep_search(x+1,y);}
        if(y-1>=0 && this.visited[x][y-1] == 0 && this.cells[x][y].value == this.cells[x][y-1].value) {this.deep_search(x,y-1);}
        if(y+1<=9 && this.visited[x][y+1] == 0 && this.cells[x][y].value == this.cells[x][y+1].value) {this.deep_search(x,y+1);}
        this.selected[this.selected.length] = x * 10 + y + 1;
    },
    // 将选中的星星变换图形
    replace_sprites : function(){
        if(this.selected.length == 0) return false;
        var i,j,k,node,frame_name;
        for(k = 0;k < this.selected.length;k++){
            i = parseInt((this.selected[k]-1) / 10);
            j = (this.selected[k]-1) % 10;
            node = this.cells[i][j];
            if(node.getTag() < 6) {frame_name = "xxxxxclc" + node.value + ".png";node.setTag(node.tag + 5);}
            else {frame_name = "xxxxx" + node.value + ".png";node.setTag(node.tag - 5);}
            node.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frame_name));
        }
    },
    getClickEvent  : function(){
        var listener = cc.EventListener.create({
            event  : cc.EventListener.TOUCH_ONE_BY_ONE,//MOUSE,
            swallowTouches: true,
            //target : this,
            onTouchBegan: function(touch, event){
                // 判断是否命中
                var target = event.getCurrentTarget();
                var size = target.getContentSize();
                var posInNode = target.convertToNodeSpace(touch.getLocation());
                var rect = cc.rect(0,0,size.width,size.height);
                if(!(cc.rectContainsPoint(rect,posInNode))){
                    return false;
                }

                var p = target.parent.parent.parent.xmxx;
                if(p.selected.length == 0){
                    p.click(target.pos);
                    p.jump();
                }else{
                    //判定
                    if(p.selected.indexOf(target.pos) != -1){
                        p.add_score = p.selected.length * p.selected.length * 5;

                         // 粒子效果
                        for(var i=0;i<p.selected.length;i++) {
                            var pos = p.selected[i];
                            var cell = p.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10];
                            cell.removeFromParent(true);
                            p.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10] = 0;

                            if(cc.sys.isMobile && p.particleCount > 6) {
                            }else{
                                p.particleCount ++;
                                var par = p.particle.clone();
                                par.setPosition(cc.p(32 + parseInt((pos - 1) % 10) * 64, 640 - 32 - parseInt((pos - 1) / 10) * 64));
                                p.diy_parent.addChild(par);
                                p.particless[p.particless.length] = par;
                            }
                        }

                        p.particleCount = 0;
                        p.drop_down();
                        p.move_left();
                        if(cc.loader.getRes(res.Pop) && xx_global_config.IsPlayMusic){ cc.audioEngine.playMusic(res.Pop,false);}

                        var selectLabel = new cc.LabelTTF(p.add_score,"HKHBJT_FONT",40);
                        selectLabel.setPosition(target.x,target.y+100);
                        p.diy_parent.addChild(selectLabel,1010);
                        selectLabel.runAction(cc.sequence(
                            cc.moveBy(0.2,0,50),cc.delayTime(0.3),cc.moveTo(0.4,cc.winSize.width/2,cc.winSize.height - 136),cc.delayTime(0.1),cc.spawn(new cc.ScaleTo(0.3,0.5),cc.fadeOut(0.5)),cc.delayTime(0.1),
                            cc.callFunc(function () {p.diy_parent.after_remove();selectLabel.removeFromParent();}.bind(p.diy_parent))));

                        p.selectLabelStatus = 1;
                        p.selectLabel.runAction(cc.sequence(cc.delayTime(4),cc.callFunc(function () {
                            if(p.selectLabelStatus == 1) {
                                //p.selectLabel.runAction(cc.fadeOut(1));
                            }
                        })));

                        p.score += p.add_score; // 注意顺序.
                        p.diy_parent.judge_pass_level();

                        if(p.selected.length >=6){ // 太棒了! 哦买噶!  等等
                            //var sprite_str = "";
                            if(cc.loader.getRes(res.Praise) && xx_global_config.IsPlayMusic) {cc.audioEngine.playMusic(res.Praise,false);}
                            if(p.selected.length < 20){
                                var sprite_str = "#praise_"+parseInt(1+Math.random()*3)+".png";
                            }else if(p.selected.length < 25){
                                var sprite_str = "#praise_4.png";
                            }else {
                                var sprite_str = "#praise_5.png";
                            }
                            var praise = new cc.Sprite(sprite_str);//""
                            praise.setPosition(cc.winSize.width / 2,cc.winSize.height / 2 + 120);
                            praise.setScale(3);
                            p.diy_parent.addChild(praise,10000);

                            var callFunc = cc.callFunc(function () {
                                praise.removeFromParent();
                            }.bind(p.diy_parent));
                            praise.runAction(cc.sequence(new cc.ScaleTo(0.3,2),cc.fadeOut(0.5),cc.fadeIn(0.5),cc.fadeOut(0.5),callFunc));
                        }

                        p.selected.splice(0,p.selected.length); // 清除数组
                        p.is_over();
                        //p.diy_parent.after_remove();
                    }else{
                        p.replace_sprites();
                        p.selected.splice(0,p.selected.length);
                        p.click(target.pos);
                        p.jump();
                    }

                }

                return true;// 必须
            }
        });
        return listener;
    },
    reset_visited : function () {
        for(var i=0;i<10;i++){
            for(var j=0;j<10;j++){
                this.visited[i][j] = 0;
            }
        }
    },
    jump : function(){
        if(this.selected.length == 0) {return false;}
        var jump = cc.jumpBy(0.3, cc.p(0, 0), 20, 1);// 原地跳20px,共跳一次.
        for(var i=0;i<this.selected.length;i++){
            var pos = this.selected[i];
            var cell = this.cells[parseInt((pos-1)/10)][(pos-1)%10];
            cell.setLocalZOrder(9999);
            cell.runAction(jump.clone());
            cell.setLocalZOrder(9);
        }
    },
    drop_down : function(){
        for(var j=0;j<10;j++){// 从第一列开始处理
            var i=9,sp=99;
            while(i>0){
                while(i>0 && this.cells[i][j] != 0){i--;}
                sp = i-1;
                while(sp>=0 && this.cells[sp][j] == 0){sp--;}
                if(i>0 && sp >=0){
                    var up = cc.moveBy(0.15, 0, 32 );
                    var down = cc.moveBy(0.15, 0, -this.cells[sp][j].getContentSize().height * (i-sp) -32 );
                    this.cells[sp][j].runAction(cc.sequence(up.clone(),down.clone()));
                    this.cells[i][j] = this.cells[sp][j];
                    this.cells[i][j].pos = i*10+j+1; // 更新位置
                    this.cells[sp][j] = 0;
                }
                i--;
            }
        }
    },
    move_left : function(){ // 向左移动
        var flag = 0,x=-1;
        if(this.cells[9][9]==0){flag = -1;}
        for(var j=0;j<10;j++){
            if(this.cells[9][j] == 0){
                if(flag != -1) flag = 1;
                x = j+1;
                while(x <10 && this.cells[9][x] == 0){
                    x++;
                }
                if(x < 10){
                    var left = cc.moveBy(0.15, cc.p(-this.cells[9][x].getContentSize().width * (x-j), 0) );
                    for(var i=0;i<10;i++){
                        if(this.cells[i][x] == 0) continue;
                        this.cells[i][x].runAction(left.clone());
                        this.cells[i][j] = this.cells[i][x];
                        this.cells[i][j].pos = i*10+j+1; // 更新位置
                        this.cells[i][x] = 0;
                    }

                }

            }
        }
        // 最后一列置0
        if(flag == 1){
            for(var i=0;i<10;i++){
                this.cells[i][9] = 0;
            }
        }
    },
    is_over : function(){ // 判断是否完成
        var flag = true;
        for(var i=0;i<10;i++){
            for(var j=0;j<10;j++){
                if(i-1>=0 && this.cells[i-1][j] != 0 && this.cells[i-1][j].value == this.cells[i][j].value){flag=false;i=10;j=10;break;}
                if(i+1>10 && this.cells[i+1][j] != 0 && this.cells[i+1][j].value == this.cells[i][j].value){flag=false;i=10;j=10;break;}
                if(j-1>=0 && this.cells[i][j-1] != 0 && this.cells[i][j-1].value == this.cells[i][j].value){flag=false;i=10;j=10;break;}
                if(j+1<10 && this.cells[i][j+1] != 0 && this.cells[i][j+1].value == this.cells[i][j].value){flag=false;i=10;j=10;break;}
            }
        }
        if(flag){this.deal_with_over();}
        return flag;
    },
    deal_with_over : function(){ // 处理结束
        this.game_is_over = true;

        var count = 0;
        for(var i=0;i<10;i++){
            for(var j=0;j<10;j++){
                if(this.cells[i][j] != 0){count++;}
            }
        }
        var left_score = 0;
        if(count < 10){
            left_score = 2000 - count*count*20;
            this.score += left_score;
            this.add_score += left_score;
        }

        var label1 = new cc.LabelTTF("奖励" + left_score, "Arial", 40);
        label1.x = cc.winSize.width / 2;
        label1.y = 480;
        this.awardLabel = label1;
        this.diy_parent.addChild(label1);

        var label2 = new cc.LabelTTF("剩余" + count + "个星星", "Arial", 40);
        label2.x = cc.winSize.width / 2;
        label2.y = 440;
        this.leftLabel = label2;
        this.diy_parent.addChild(label2);

        this.diy_parent.deal_with_over(left_score,count,this.score);

        //cc.audioEngine.playMusic(res.Passed,false);
    },
    print : function () { // 测试使用,打印星星阵列
        for(var i=0;i<10;i++){
            var str = '[';
            if(this.cells[i][0] != 0){str+=this.cells[i][0].value+',';if(this.cells[i][0].pos<10)str+='0'; str+=this.cells[i][0].pos+']'}
            else {str+='0,00]'}
            for(var j=1;j<10;j++){
                str+=',[';
                if(this.cells[i][j] != 0){str+=this.cells[i][j].value+',';if(this.cells[i][j].pos<10)str+='0';str+=this.cells[i][j].pos+']'}
                else{str+='0,00]';}
            }
            console.log(str);
        }
    },
    all_blink : function () { // 结束后闪烁动作
        var blink = cc.blink(1,10);
        var arr = [];
        for(var i=0;i<10;i++) {
            for (var j = 0; j < 10; j++) {
                if(this.cells[i][j] == 0) continue;

                arr[arr.length] =this.cells[i][j].pos;
                this.cells[i][j].runAction(blink.clone());
            }
        }

        var callFunc = cc.callFunc(function () {
            for(var i=0;i<10;i++) {
                for (var j = 0; j < 10; j++) {
                    if(this.cells[i][j] == 0) continue;
                    this.cells[i][j].removeFromParent(true);
                    this.cells[i][j] = 0;
                }
            }
            for(var x = 0;x<arr.length;x++){
                var par = this.particle.clone();
                var pos = arr[x];
                par.setPosition(cc.p(32 + parseInt((pos - 1) % 10) * 64, 640 - 32 - parseInt((pos - 1) / 10) * 64));
                this.diy_parent.addChild(par);
            }
            if(this.diy_parent.next_level) { // 下一关
                this.diy_parent.next_level();//this.diy_parent.runAction(cc.sequence(cc.delayTime(1),
            }
        }.bind(this));
        this.diy_parent.runAction(cc.sequence(cc.delayTime(1),callFunc));
        //this.diy_parent.runAction(cc.sequence(cc.delayTime(1),callFunc));
    }
});