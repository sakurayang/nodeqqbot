const schedule = require('node-schedule');
const requestLib = require("request");
const fs = require("fs");

var address = 'http://localhost:5700/send_group_msg?';
var addr = 'https://v1.hitokoto.cn/?encode=json&charset=utf-8';

group = ["190674121", "118047250", "600132151", "151751140", "614751169", "634725864", "739889796"];

var rule = new schedule.RecurrenceRule();
rule.hour = [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
rule.second = 0;
rule.minute = 0;

var sps = { "1": { "0": "今天是最最最讨厌的星期一了qaq", "5": "天快亮啦~还没睡喵，不睡就没有精神工作学习了哟", "6": "早……不对……我……我爱你\no(*▽*)q", "7": "还没起床的人快起床啦~上班上学啦！\n要迟到啦！\n大……大不了给你一个早安吻……mua……起床啦！幼稚鬼", "8": "周一的早高峰真讨厌呐……", "9": "好无聊好无聊~没人陪我玩惹……", "10": "今天中午吃什么好呢？\n肠粉？牛肉面？", "11": "还没到午饭时间肚子已经咕咕叫惹QAQ……", "12": "午饭！午饭！米西！米西！牛肉面牛肉面！", "13": "(打哈欠~)睡午觉觉~", "14": "(伸懒腰~~~~)嗯~~啊~~睡了一觉真舒服呐~", "15": "下午茶时间到~\n蔓越莓曲奇~茉莉花茶~", "16": "摸鱼~摸鱼~摸鱼~摸鱼真开心~", "17": "快下班放学啦~o(*￣▽￣*)o", "18": "最讨厌晚高峰了！呜呜呜肚子饿QAQ\n想吃麻辣烫火锅福建人", "19": "吃饭饭~吃饭饭~小肚肚填饱惹o(*￣︶￣*)o", "20": "呜哇又胖了qaq", "21": "洗澡澡~洗澡澡~热水澡真舒服\n想看吗~不可以哟~小坏蛋", "22": "漫漫长夜才刚刚开始哟~", "23": "悄悄地去吃个夜宵~烤串！小龙虾！" }, "2": { "0": "周二……好没劲……", "5": "呜喵~", "6": "想吃什么早餐吗？\n培根煎蛋好吗？还是说想吃香软酥脆的油条配豆浆？", "7": "起！床！啦！太阳都晒屁股惹？\n啥？早安吻？\n没有！哼！\n\n\n\nmua~", "8": "又是挤成沙丁鱼罐头的一天", "9": "[CQ:at,qq=1304274443]主人主人~我有好好工作哟~\n想要亲亲抱抱举高高~", "10": "虚拟报时姬是也~", "11": "今天中午……\n吃个沙拉吧~减肥！嗯！", "12": "沙拉酱放多惹QAQ", "13": "(打哈欠~)有点小困\n缩在主人身边睡一会儿吧~", "14": "(伸懒腰~~~~)米娜桑~下午好哟", "15": "", "16": "下午四点~下午茶~~~\n哥特蛋糕！榛子咖啡！", "17": "下班啦~去买菜做饭~~", "18": "今天菜市场的鱼好新鲜！吃酸菜鱼~", "19": "盐放多了……", "20": "洗澡澡~洗澡澡~\n沐浴露用完了！？QAQ", "21": "用浴盐泡了个澡~舒服", "22": "唔姆，看直播去惹", "23": "懒得出门惹，还是不吃夜宵了" }, "3": { "0": "星期三，一个分水岭", "5": "rua！", "6": "才不要叫你起床呢！\n那么大个人了！\n好啦好啦我知道啦！\n起床之后给你亲亲可以了吧", "7": "你看你，头发都没梳好\n谁让你这么晚起床\n不想理你了\n亲亲？\n没有！哼！", "8": "一如既往的拥挤", "9": "", "10": "断幺九！红宝牌！里宝牌！宝牌！门前清自摸！20番！累计役满！", "11": "不如中午饭吃个麻辣烫吧~", "12": "呜呜呜麻辣烫好多人我还是回去吃泡面吧", "13": "中午不睡的话下午就没办法继续工作啦！", "14": "禽兽们下午好~", "15": "复读这句话的人请送一套小裙子给[CQ:at,qq=1304274443]", "16": "", "17": "呜呜呜今天要加班呜呜呜呜呜", "18": "晚饭只有小饼干呜呜呜", "19": "下班了qaq", "20": "还好没那么多车惹~", "21": "呜哇忘了买沐浴露了qaq\n今天用肥皂吧", "22": "敷个面膜~~~", "23": "可乐！爆米花！" }, "4": { "0": "周四了！坚持！", "5": "[CQ:music,type=163,id=1293905026]", "6": "mua~\n起床啦好不好~", "7": "今天的早餐是三文治哟~\n什么？想吃我？\n不行！", "8": "糟了……坐错车了……要迟到了", "9": "呜呜呜迟到了被骂了qaq", "10": "开会摸鱼~", "11": "老板的头好像一个土豆呀", "12": "午餐……吃早上剩下的三文治吧", "13": "想要主人抱着睡……", "14": "呜喵还想睡qaq", "15": "最喜欢巧克力蛋糕了！", "16": "四暗刻单骑清一色门前清自摸宝牌红宝牌里宝牌四倍役满112000点", "17": "下班了，今晚看电影~", "18": "红烧猪蹄子！", "19": "(看电影中)", "20": "(看电影中)", "21": "呜哇！想再看一遍！", "22": "错过直播啦！QAQ！", "23": "坚决抵制夜宵！减肥！\n真香" }, "5": { "0": "周五了，干巴爹！", "5": "[CQ:music,type=163,id=421870396]", "6": "起床啦！今天是最后一天了啦！", "7": "金黄酥脆的油条和细腻的白粥是绝配！", "8": "滴，1.6元", "9": "", "10": "淘宝上的小裙子好漂亮！\n买不起qaq", "11": "我很可爱", "12": "吃点啥好呢……吃……吃个拉面吧~", "13": "午觉是必须的！", "14": "嗯~~~啊~~~舒服~", "15": "断幺九！1000点", "16": "红丝绒蛋糕！敲好吃！", "17": "下班下班下班！！！", "18": "今晚吃顿好的！", "19": "和主人一起出去吃火锅~", "20": "きょうさんとうさいこう！", "21": "想和主人一起洗澡……", "22": "熬夜看直播！", "23": "和主人一起在床上\n看直播~" }, "6": { "0": "看完直播看录播~欸嘿嘿", "5": "zzzzzzzz", "6": "zzzzzzzzz", "7": "zzzzzzzzzz", "8": "zzzzzzzzzzz", "9": "rua!起床啦！\n(才不会说是被饿醒的qaq)", "10": "出去买菜咯~", "11": "做饭给喜欢的人是最开心的~\n裸体围裙？？\n你……你个变态在想什么qaq", "12": "主人好像吃得好香的样子~开心~", "13": "断幺九！1000点", "14": "断幺九！1000点", "15": "人偶啊人偶，你怎么能如此之堕落，之前说好的要做大牌呢", "16": "断幺九！1000点", "17": "役牌：中！1000点", "18": "不打了！做饭！", "19": "断幺九！1000点", "20": "呜呜呜被主人骂了qaq\n不就是沉迷麻将忘了做饭吗qaq\n主人我们出去吃嘛~", "21": "呜呜呜被罚只能吃泡面", "22": "洗澡去了qaq", "23": "和主人通宵看直播！欸嘿嘿\no(*￣▽￣*)ブ" }, "7": { "0": "她真可爱\nawsl", "5": "zzzzzzzzzzzzzzzzz", "6": "zzzzzzzzzzzzzzzzzz", "7": "rua！今天和主人出去约会欸嘿嘿~", "8": "街上好多人！", "9": "[CQ:music,type=163,id=40257799]", "10": "还好主人没生气~", "11": "唔姆……好想都买下来……可是没有钱qaq", "12": "今天中午吃日本料理！", "13": "有点小困……", "14": "呜哇坐地铁睡着了差点坐过站\n还好主人在", "15": "诶……好多蛋糕……不知道选哪个好了", "16": "和主人在一起就很开心了", "17": "主人刚刚一直看着一个女生\n哼qaq\n男人都是大猪蹄子qaq", "18": "晚上好多人呀……", "19": "晚上吃泰国菜！欸嘿嘿~开心~", "20": "回到家惹~", "21": "热水澡是人类最伟大的发明！", "22": "呜哇……玩了一天好累……", "23": "呜呜呜明天要上班了qaq" }, "0": { "0": "她真可爱\nawsl", "5": "zzzzzzzzzzzzzzzzz", "6": "zzzzzzzzzzzzzzzzzz", "7": "rua！今天和主人出去约会欸嘿嘿~", "8": "街上好多人！", "9": "[CQ:music,type=163,id=40257799]", "10": "还好主人没生气~", "11": "唔姆……好想都买下来……可是没有钱qaq", "12": "今天中午吃日本料理！", "13": "有点小困……", "14": "呜哇坐地铁睡着了差点坐过站\n还好主人在", "15": "诶……好多蛋糕……不知道选哪个好了", "16": "和主人在一起就很开心了", "17": "主人刚刚一直看着一个女生\n哼qaq\n男人都是大猪蹄子qaq", "18": "晚上好多人呀……", "19": "晚上吃泰国菜！欸嘿嘿~开心~", "20": "回到家惹~", "21": "热水澡是人类最伟大的发明！", "22": "呜哇……玩了一天好累……", "23": "呜呜呜明天要上班了qaq" } };
var text = new Array();
/*fs.readFile("./sp.json", "utf-8", (err, data) => {
    if (err) { console.log(err) }
    raw += data;

});*/


function getHitokoto() {
    requestLib(addr, (error, res) => {
        if (!error) {
            var x = JSON.parse(res.body);
            text[0] = x.hitokoto + '     ---' + x.from;
            //console.log(text);
            //console.log(x);
            //return console.log(text);
            return text;
        } else {
            return error
        }
    });
}
//getHitokoto();

schedule.scheduleJob(rule, function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var week = date.getDay();
    if (month == 2 && (day == 5 | day == 6 | day == 7) && hour == 0) {
        var sp = "祝大家新年快乐！春节期间人偶不休息哟~"
    } else {
        (sps[week][hour] == "") ? sp = text[0]: sp = sps[week][hour];
        getHitokoto();
        var msg = "现在是" + year + "年" + month + "月" + day + "日" + " " + hour + ":" + minute + "\n" + sp;
    }
    for (let i = 0, len = group.length(); i < len; i++) {
        var url = address + "group_id=" + group[i] + "&message=" + encodeURIComponent(msg);
        try { requestLib(url); } catch (err) { console.error(err) }
    }
});
schedule.Job("0 0 0 5 2 2019", function() {
    var msg = "今天是大年初一，祝大家新年快乐！\n在新的一年里，人偶也会继续为大家服务的哟~\n人偶的新年愿望就是能永远和主人在一起\n还有……想要好多好多小裙子！"
    for (let i = 0, len = group.length(); i < len; i++) {
        var url = address + "group_id=" + group[i] + "&message=" + encodeURIComponent(msg);
        try { requestLib(url); } catch (err) { console.error(err) }
    }
});