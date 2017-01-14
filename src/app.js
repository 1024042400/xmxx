/*
 *
 */
var MainLayer = cc.Layer.extend({
    data  : [[5, 1, 1, 1, 4, 2, 5, 5, 2, 5], [2, 5, 4, 1, 1, 4, 4, 5, 2, 2], [4, 2, 3, 1, 5, 1, 1, 2, 1, 3], [1, 5, 1, 4, 1, 5, 5, 2, 3, 3], [2, 2, 5, 5, 4, 4, 2, 2, 5, 3], [4, 2, 2, 5, 4, 1, 1, 2, 1, 4], [3, 5, 2, 4, 5, 1, 2, 1, 3, 1], [4, 3, 1, 2, 2, 5, 4, 3, 4, 2], [4, 5, 4, 1, 1, 1, 1, 2, 2, 5], [3, 2, 3, 3, 4, 1, 3, 2, 1, 5]],
    cells : [],
    selected:[],// 选中的元素
    visited : [],
    score : 0,
    scoreLabel  : new cc.LabelTTF('',"Arial",38),
    selectLabel : new cc.LabelTTF('',"Arial",38),
    //particle    : new cc.ParticleSystem(res.Particle), // 粒子效果
    ctor:function () {
        this._super();
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

        alert(navigator.platform);
        if(system.win || system.mac){
            //alert('ok');
        }else{

        }
        //1.加载背景
        this.loadBackground();
        //2.初始化数据
        this.init_data();
        this.createBody();
        return true;
    },
    // 加载背景
    loadBackground : function(){
        var bg = new cc.Sprite(res.Bg);
        this.addChild(bg);
        bg.setPosition(cc.winSize.width / 2,cc.winSize.height / 2);
    },
    createBody : function(){
        var size = cc.winSize;

        var body = new cc.Sprite();
        // 红色背景,用于测试
        /*    body.setColor(cc.color(255,0,0));
         var tex = new cc.Texture2D();
         var buffer = new Uint8Array(4);
         for (var i=0;i<4;i++) {
         buffer[i] = 255;
         }
         tex.initWithData(buffer, cc.Texture2D.PIXEL_FORMAT_RGBA8888, 1, 1, size);
         body.texture = tex;*/

        body.setTextureRect(cc.rect(0,0,size.width,size.width));
        body.setPosition(size.width /2, size.width /2);
        // body.setAnchorPoint.call(this,0.5,0.5)
        this.addChild(body);
        // 1.将纹理加载到内存
        cc.spriteFrameCache.addSpriteFrames(res.NewActsPlist,cc.textureCache.addImage(res.NewActsPng));
        // 2.创建SpriteBatchNode
        var batchNode = new cc.SpriteBatchNode(res.NewActsPng);
        body.addChild(batchNode);

        for(var i=0;i<10;i++) {
            var arr = new Array(10);
            for(var j=0;j<10;j++) {
                var node = new cc.Sprite("#xxxxx" + this.data[i][j] + ".png");
                cc.eventManager.addListener(this.getClickEvent(), node);
                // 没用
                var newtexture = cc.textureCache.addImage("#xxxxxclc5.png")
                //node.setTexture("#xxxxxclc5.png");// loadTexture 不好使

                //node.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame("xxxxxclc" + this.data[i][j] + ".png"));
                node.value = this.data[i][j];
                node.setPosition(j * (size.width/10) + parseInt(0.5*node.width),size.width - (i * size.width / 10 + parseInt(node.height / 2)));
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

        this.scoreLabel.x = size.width/2;
        this.scoreLabel.y = size.height - size.height/10;
        this.addChild(this.scoreLabel);
        this.selectLabel.x = size.width/2;
        this.selectLabel.y = 680;
        this.addChild(this.selectLabel);
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
            cc.audioEngine.playMusic(res.Select);
        }
        //console.log('selected:'+this.selected);
    },
    deep_search : function(x,y){
        this.visited[x][y] = 1;
        if(x-1>=0 && this.visited[x-1][y] == 0 && this.cells[x][y].value == this.cells[x-1][y].value) {this.deep_search(x-1,y);}
        if(x+1<=9 && this.visited[x+1][y] == 0 && this.cells[x][y].value == this.cells[x+1][y].value) {this.deep_search(x+1,y);}
        if(y-1>=0 && this.visited[x][y-1] == 0 && this.cells[x][y].value == this.cells[x][y-1].value) {this.deep_search(x,y-1);}
        if(y+1<=9 && this.visited[x][y+1] == 0 && this.cells[x][y].value == this.cells[x][y+1].value) {this.deep_search(x,y+1);}
        this.selected[this.selected.length] = x * 10 + y + 1;
    },
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
    // 点击事件
    getClickEvent : function(){
        var listener = cc.EventListener.create({
            event  : cc.EventListener.TOUCH_ONE_BY_ONE,//MOUSE,
            swallowTouches: true,
            target : this,
            onTouchBegan: function(touch, event){
                // 判断是否命中
                var target = event.getCurrentTarget();
                var size = target.getContentSize();
                var posInNode = target.convertToNodeSpace(touch.getLocation());
                var rect = cc.rect(0,0,size.width,size.height);
                if(!(cc.rectContainsPoint(rect,posInNode))){
                    return false;
                }
                var p = target.parent.parent.parent;
                if(p.selected.length == 0){
                    p.click(target.pos);
                    p.jump();
                }else{
                    //判定
                    if(p.selected.includes(target.pos)){
                        p.score += p.selected.length * p.selected.length * 5;
                        p.scoreLabel.setString('当前得分'+p.score);
                        for(var i=0;i<p.selected.length;i++) {
                            var pos = p.selected[i];
                            var cell = p.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10];
                            cell.removeFromParent(true);
                            p.cells[parseInt((pos - 1) / 10)][(pos - 1) % 10] = 0;

                            var particle = new cc.ParticleSystem(res.Particle); // 粒子效果
                            //var particle = p.particle.clone();
                            particle.setPosition(cc.p(32 + parseInt((pos - 1) % 10)*64,640-32 - parseInt((pos - 1)/10)*64));
                            p.addChild(particle);

                        }
                        p.drop_down();
                        p.move_left();
                        cc.audioEngine.playMusic(res.Pop);


                        p.is_over();
                        //console.log(p.cells)
                        //p.print();
                        p.selected.splice(0,p.selected.length);
                    }else{
                        p.replace_sprites();
                        p.selected.splice(0,p.selected.length);
                        p.click(target.pos);
                        p.jump();
                    }

                }
                // TODO
                //var newtexture = cc.textureCache.addImage("#xxxxxclc5.png");
                //target.initWithFile("#xxxxxclc5.png");

                return true;
            }
        });
        return listener;
    },
    init_data : function(){
        // 初始化 visited数组
        for(var i=0;i<10;i++){
            var arr = new Array(10);
            for(var j=0;j<10;j++){
                arr[j] = 0;
            }
            this.visited[i] = arr;
        }
        this.cells = [];
        this.selected = [];
        this.score = 0;
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
                //console.log('j:'+j+",i:"+i+',sp:'+sp);
                if(i>0 && sp >=0){
                    var up = cc.moveBy(0.15, cc.p(0, 32) );
                    var down = cc.moveBy(0.15, cc.p(0, -this.cells[sp][j].getContentSize().height * (i-sp) -32) );
                    this.cells[sp][j].runAction(cc.sequence(up.clone(),down.clone()));
                    this.cells[i][j] = this.cells[sp][j];
                    this.cells[i][j].pos = i*10+j+1; // 更新位置
                    this.cells[sp][j] = 0;
                }
                i--;
            }
        }
    },
    move_left : function(){
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
            this.scoreLabel.setString('得分'+this.score);
        }

        var label1 = new cc.LabelTTF("奖励"+left_score,"Arial",40);
        label1.x = cc.winSize.width/2;
        label1.y = 480;
        this.addChild(label1);
        var label2 = new cc.LabelTTF("剩余"+count+"个星星","Arial",40);
        label2.x = cc.winSize.width/2;
        label2.y = 440;
        this.addChild(label2);
        cc.audioEngine.playMusic(res.Passed);
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
    }
});

var MainScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainLayer();
        this.addChild(layer);
    }
});