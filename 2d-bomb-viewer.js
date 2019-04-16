
function BombViewer() {
    // valid sizes
    // this is not used in the script but useful for you to read
    var validSizes=[
        "centurion",
        "bomb defusing 101",
        "small ring",
        "large ring",
        "triangle <number of rows or 'special'>",
        "rectangle <width>x<height>"
    ];
    var casingShapeFormats={
        // # = module
        // . = 1 slot space before
        // , = 1.5 slot space before
        // ~ = 0.5 slot space before
        // / = end of row
        triangle:{
            special:`
            .....#...../...,##,.../....###..../..,####,../...#####.../.,######,./
            ..#.....#../,##....##,/.###.#.###./~####..####~/#####.#####`,
            regular:{
                2:`~#~/##`,
                3:`.#./~##~/###`,
                4:`,#,/.##./~###~/####`,
                5:`..#../,##,/.###./~####~/#####`,
                6:`.,#,./..##../,###,/.####./~#####~/######`,
                7:`...#.../.,##,./..###../,####,/.#####./~######~/#######`,
                8:`..,#,../...##.../.,###,./..####../,#####,/.######./~#######~/########`,
                9:`....#..../..,##,../...###.../.,####,./..#####../,######,/.#######./~########~/#########`,
                10:`...,#,.../....##..../..,###,../...####.../.,#####,./..######../,#######,/.########./~#########~/##########`
            }
        },
        centurion:`,####,/.#####./~######~/#######/#######/#######/~######~/.#####./,####,`,
        bombDefusing101:`..#####../.#######./#########/#########/#########/.#######./..#####..`,
        rectangle:`@`,
        ring:{
            small:`..####../.######./###..###/##....##/##....##/###..###/.######./..####..`,
            large:`...###.../.#######./.##...##./##.....##/##..#..##/##.....##/.##...##./.#######./...###...`
        }
    }
    // empty slots on the bomb can be sent as an empty object >> {}
    // the icon is omitted as it is set in the options
    // the timer is sent as an object with tag property set to KTANEBombTimer >> {tag:"KTANEBombTimer"}
    // the name for the timer is always "Timer" so the name property can be omitted
    // the icon can also be omitted as it is set in the options
    this._o={
        serial:null,
        size:null,
        frontfaceOnly:null,
        modules:{
            front:null,
            back:null
        },
        icons:{
            empty:"icons/empty.png",
            timer:"icons/timer.png"
        },
        iconSize:128,
        scale:1,
        click:()=>{}
    }
    this.setSerial=t=>this._o.serial=t;
    this.setSize=t=>this._o.size=t;
    this.setFrontfaceOnly=t=>this._o.frontfaceOnly=t;
    this.setFrontfaceModules=t=>this._o.modules.front=t;
    this.setBackfaceModules=t=>this._o.modules.back=t;
    this.setIconEmpty=t=>this._o.icons.empty=t;
    this.setIconTimer=t=>this._o.icons.timer=t;
    this.setScale=t=>this._o.scale=t;
    this.setClickEvent=t=>this._o.click=t;
    var b2dr=this;
    function timerObjectCount() {
        var count=0;
        for(var i=0;i<b2dr._o.modules.front.length;i++) {
            if(b2dr._o.modules.front[i].tag=="KTANEBombTimer") {
                count++;
            }
        }
        for(var i=0;i<b2dr._o.modules.back.length;i++) {
            if(b2dr._o.modules.back[i].tag=="KTANEBombTimer") {
                count++;
            }
        }
        return count;
    }
    function addModules(_a,inner,moduleA,layoutFormat,sideName) {
        if(!moduleA) moduleA=[];
        if(layoutFormat.match(/@([0-9])/g)) {
            var n=parseInt(layoutFormat.split('@')[1]);
            layoutFormat="";
            for(var i=0;i<_a.length;i++) {
                if(i%n==1)layoutFormat+="#/";
                else layoutFormat+="#";
            }
        }
        var moduleId=0;
        for(var i=0;i<layoutFormat.length;i++) {
            if(layoutFormat[i]=="#") {
                var n=moduleId++;
                if(_a[n].name!==undefined&&_a[n].tag!==undefined&&_a[n].icon!==undefined&&_a[n].solved!==undefined) {
                    moduleA.push($(`<div class="bomb-module" bomb-side="${sideName}" bomb-position="${n}" module-name="${_a[n].name}" module-tag="${_a[n].tag}" module-solved="${_a[n].solved}"><img src="${_a[n].icon}"></div>`).appendTo(inner));
                } else {
                    if(_a[n].tag=="KTANEBombTimer") {
                        moduleA.push($(`<div class="bomb-module bomb-timer-slot" bomb-side="${sideName}" bomb-position="${n}" module-name="Bomb Timer" module-tag=""><img src="${b2dr._o.icons.timer}"></div>`).appendTo(inner));
                    } else {
                        moduleA.push($(`<div class="bomb-module bomb-empty-slot" bomb-side="${sideName}" bomb-position="${n}" module-name="" module-tag=""><img src="${b2dr._o.icons.empty}"></div>`).appendTo(inner));
                    }
                }
            } else if(layoutFormat[i]==".") {
                $(`<div class="bomb-spacer" style="width:${4+b2dr._o.iconSize};height:${4+b2dr._o.iconSize};"></div>`).appendTo(inner);
            } else if(layoutFormat[i]==",") {
                $(`<div class="bomb-spacer" style="width:${(4+b2dr._o.iconSize)*1.5};height:${4+b2dr._o.iconSize};"></div>`).appendTo(inner);
            } else if(layoutFormat[i]=="~") {
                $(`<div class="bomb-spacer" style="width:${(4+b2dr._o.iconSize)*0.5};height:${4+b2dr._o.iconSize};"></div>`).appendTo(inner);
            } else if(layoutFormat[i]=="/") {
                $(`<br>`).appendTo(inner);
            }
        }
        return moduleA;
    }
    this.generateHTML=()=>{
        if(this._o.serial===null) return;
        if(this._o.size===null) return;
        if(this._o.frontfaceOnly===null) return;
        if(this._o.modules.front===null) return;
        if(this._o.modules.back===null) return;
        if(this._o.icons.empty===null) return;
        if(this._o.icons.timer===null) return;
        if(this._o.iconSize===null) return;
        if(this._o.scale===null) return;
        var main=$(`<div class="bomb-embed"></div>`);
        var base=$(`<div class="bomb-viewport" bomb-size="${this._o.size}" bomb-serial="${this._o.serial}" bomb-frontface-only="${this._o.frontfaceOnly}" style="overflow:hidden;"></div>`).appendTo(main);
        var scaleLayer=$(`<div class="bomb-scaling-layer" style="transform:scale(${this._o.scale});transform-origin:top left;"></div>`).appendTo(base);
        var bomb=$(`<div class="bomb-object" style="transform-origin:center;"></div>`).appendTo(scaleLayer);
        var ff=$(`<div class="bomb-front"></div>`).appendTo(bomb);
        var bf=$(`<div class="bomb-back"></div>`).appendTo(bomb);
        var btn=$(`<div class="bomb-flipping bomb-module" style="transform:scale(${this._o.scale});"><img src="icons/flip.png"></div>`).appendTo(main);
        var moduleArray=[];
        var _s=this._o.size;
        var _m=0;
        if(this._o.frontfaceOnly) {
            _m=this._o.modules.front.length*2;
        } else if(this._o.modules.front.length==this._o.modules.back.length){
            _m=this._o.modules.front.length+this._o.modules.back.length;
        }
        var _t=timerObjectCount();
        if(_t<1) {
            console.error(`[Bomb 2D Representation] You are drunk because ${_t} is not enough bomb timers`);
            return;
        } else if(_t>1) {
            console.error(`[Bomb 2D Representation] You are high as ${_t} is too many bomb timers`);
            return;
        }

        var _b=new CasingInfo().getByCasingTag(_s);
        base.css("width",_b.width*(4+this._o.iconSize)*this._o.scale);
        base.css("height",_b.height*(4+this._o.iconSize)*this._o.scale);
        bomb.css("width",_b.width*(4+this._o.iconSize));
        bomb.css("height",_b.height*(4+this._o.iconSize));
        if(_b.error) {
            console.error(`[Bomb 2D Representation] There was an error loading this casing tag is it incorrect? ${_s}`);
            return;
        }
        if(_m>_b.modules) {
            console.error(`[Bomb 2D Representation] ${_m} is way to many modules this case only supports ${_b.modules} modules.`);
            return;
        } else if(_m<_b.modules) {
            console.error(`[Bomb 2D Representation] ${_m} is not enough modules this case only supports ${_b.modules} modules.`);
            return;
        }

        btn.click(()=>{
            if(!bomb.hasClass("bomb-flipped")&&!bomb.hasClass("bomb-animate")) {
                bomb.addClass("bomb-animate").addClass("bomb-flipping");
                setTimeout(()=>{
                    bomb.removeClass("bomb-animate");
                    setTimeout(()=>{
                        bomb.removeClass("bomb-flipping").addClass("bomb-flipped");
                    },0);
                },2000)
            } else if(bomb.hasClass("bomb-flipped")&&!bomb.hasClass("bomb-animate")) {
                bomb.removeClass("bomb-flipped").addClass("bomb-flipping");
                setTimeout(()=>{
                    bomb.addClass("bomb-animate").removeClass("bomb-flipping");
                    setTimeout(()=>{
                        bomb.removeClass("bomb-animate");
                    },2000);
                },0);
            }
        });

        if(_b.case=="centurion") {
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.centurion,"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.centurion,"back");
        } else if(_b.case=="bomb defusing 101") {
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.bombDefusing101,"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.bombDefusing101,"back");
        } else if(_b.case=="small ring") {
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.ring.small,"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.ring.small,"back");
        } else if(_b.case=="large ring") {
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.ring.large,"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.ring.large,"back");
        } else if(_b.case=="triangle special") {
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.triangle.special,"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.triangle.special,"back");
        } else if(_b.case.match(/^triangle regular ([0-9])+/g)) {
            var n=parseInt(_b.case.split("triangle regular ")[1]);
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.triangle.regular[n],"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.triangle.regular[n],"back");
        } else if(_b.case.match(/^rectangle regular ([0-9])+/g)) {
            moduleArray=addModules(this._o.modules.front,ff,[],casingShapeFormats.rectangle+_b.case.replace('rectangle regular ',''),"front");
            moduleArray=addModules(this._o.modules.back,bf,moduleArray,casingShapeFormats.rectangle+_b.case.replace('rectangle regular ',''),"back");
        }

        $(`.bomb-hover-popup`).remove();

        var hoverEl=$(`<div class="bomb-hover-popup"></div>`).appendTo('body').fadeOut(0);

        moduleArray.forEach(e=>{
            e.click(()=>{
                b2dr._o.click(b2dr._o.serial,e.attr('module-name'),e.attr('module-tag'));
            });
            e.hover(()=>{
                if(bomb.hasClass("bomb-flipped")&&e.attr('bomb-side')=="back") {
                    if(hoverEl.length==0) hoverEl=$(`<div class="bomb-hover-popup"></div>`).appendTo('body').fadeOut(0);
                    hoverEl.fadeIn(0).html(e.hasClass("bomb-empty-slot")?"OMG you found a wild empty slot":e.attr('module-name'));
                    hoverEl.animate({top:e.offset().top+e.height()/2+12,left:e.offset().left+e.width()/4},0);
                } else if(!bomb.hasClass("bomb-flipped")&&e.attr('bomb-side')=="front") {
                    if(hoverEl.length==0) hoverEl=$(`<div class="bomb-hover-popup"></div>`).appendTo('body').fadeOut(0);
                    hoverEl.fadeIn(0).html(e.attr('module-name'));
                    hoverEl.animate({top:e.offset().top+e.height()/2+12,left:e.offset().left+e.width()/4},0);
                }
            },()=>{
                hoverEl.fadeOut(0);
            })
        })

        return main;
    }
}

function CasingInfo(m,w,h,c) {
    this.modules=m;
    this.width=w;
    this.height=h;
    this.case=c;
    this.error=false;
    this.getByCasingTag=_s=>{
        if(_s.match(/centurion/g)) {
            return new CasingInfo(102,7,9,"centurion");
        } else if(_s.match(/bomb defusing 101/g)) {
            return new CasingInfo(102,9,7,"bomb defusing 101");
        } else if(_s.match(/small ring/g)) {
            return new CasingInfo(80,8,8,"small ring");
        } else if(_s.match(/large ring/g)) {
            return new CasingInfo(82,9,9,"large ring");
        } else if(_s.match(/triangle special/g)) {
            return new CasingInfo(104,11,11,"triangle special");
        } else if(_s.match(/triangle ([0-9]+)/g)) {
            var n=parseInt(/(triangle) ([0-9]+)/g.exec(_s)[2]);
            return new CasingInfo((n*(n+1)),n,n,"triangle regular "+n);
        } else if(_s.match(/(rectangle) ([0-9]+)x([0-9]+)/g)) {
            var n=/(rectangle) ([0-9]+)(x)([0-9]+)/g.exec(_s);
            var w=parseInt(n[2]);
            var h=parseInt(n[4]);
            return new CasingInfo(w*h*2,w,h,"rectangle regular "+w);
        }
        return new CasingInfoError();
    }
}
function CasingInfoError() {
    this.error=true;
}
