import { AxiosResponse } from "axios";

//import("axios");

export interface msg {
    message_type: "private"|"group",
    // 当type为group时无效
    user_id: number,
    // 当type为private时无效
    group_id: number,
    message: string,
    auto_escape: boolean
}

export interface result {
    message_id: number
}

declare function send(msg:msg, cb:(err:Error,res:result)=>{}):Promise<AxiosResponse<any>["data"]>

export function recall(message_id:number):void
