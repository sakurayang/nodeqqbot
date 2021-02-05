interface Event {
    // 事件发生的时间戳
    readonly time: number;
    // 收到事件的机器人 QQ 号
    readonly self_id: number;
    // 上报类型
    readonly post_type: "message" | "notice" | "request" | "meta_event";
}

interface Sender {
    // 发送者 QQ 号
    readonly user_id: number;
    // 昵称
    readonly nickname: string;
    // 性别，male 或 female 或 unknown
    readonly sex?: "male" | "female" | "unknown";
    // 年龄
    readonly age?: number;
}

interface Message extends Event {
    // 消息类型 group private temp
    readonly message_type: "private" | "group" | "temp";
    // 消息 ID
    readonly message_id: number;
    // 发送者 QQ 号
    readonly user_id: number;
    // 消息内容
    readonly message: string;
    // 原始消息内容
    readonly raw_message: string;
    // 字体
    readonly font?: number;
}

interface GroupSender extends Sender {
    // 群名片／备注
    readonly card: string;
    // 地区
    readonly area?: string;
    // 成员等级
    readonly level?: string;
    // 角色
    readonly role: "owner" | "admin" | "member";
    // 专属头衔
    readonly title?: string;
}

interface PrivateSender extends Sender { }

interface Anonymous {
    // 匿名用户 ID
    readonly id: number;
    // 匿名用户名称
    readonly name: string;
    // 匿名用户 flag，在调用禁言 API 时需要传入
    readonly flag: string;
}

interface PrivateMessage extends Message {
    readonly message_type: "private";
    readonly sub_type: "friend" | "group" | "other";
    readonly sender: PrivateSender;
}

interface GroupMessage extends Message {
    readonly message_type: "group";
    readonly sub_type: "normal" | "anonymous" | "notice";
    readonly group_id: number;
    readonly anonymous?: Anonymous;
    readonly sender: GroupSender;
}

declare function parser(msg: PrivateMessage | GroupMessage): string;

export =parser;
