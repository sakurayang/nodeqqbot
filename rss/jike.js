const request = require('request'),
    route_config = require('./route.json'),
    route = require('./route.js');

example_topic = {
    "data": Array[{
        "id": String,
        "type": String,
        "content": String,
        "urlsInText": Array,
        "status": String,
        "isCommentForbidden": Boolean,
        "likeCount": Number,
        "commentCount": Number,
        "repostCount": Number,
        "shareCount": Number,
        "topic": /*Object*/ {
            "id": String,
            "type": String,
            "content": String,
            "subscribersCount": Number,
            "approximateSubscribersCount": String,
            "briefIntro": String,
            "squareP icture": {
                "thumbnailUrl": String,
                "middlePicUrl": String,
                "picUrl": String,
                "format": String,
                "averageHue": Number || String //0xbbcfa
            },
            "enablePictureComments": Boolean,
            "enablePictureWatermark": Boolean,
            "likeIcon": "shock",
            "isValid": Boolean,
            "topicType": String,
            "operateStatus": String,
            "isCommentForbidden": Boolean,
            "tips": {
                "inDraft": String,
                "inComment": String
            },
            "lastMessagePostTime": DateString, //ISOFormat
            "squarePostUpdateTime": DateString, //ISOFormat
            "subscribersName": String,
            "s ubscribersAction": String,
            "subscribersTextSuffix": String,
            "subscribersDescription": String,
            "su bscribedStatusRawValue": Number,
            "inShortcuts": Boolean,
            "isUserTopicAdmin": Boolean,
            "intro": String
        },
        "pictures": [{
            "thumbnailUrl": String,
            "smallPicUrl": String,
            "middlePicUrl": String,
            "picUrl": String, //文章图片
            "format": String,
            "averageHue": String,
            "cropperPosX": Number,
            "cropperPosY": Number,
            "width": Number,
            "height": Number
        }],
        "collected": Boolean,
        "collectTime": null,
        "user": {
            "id": String,
            "username": String,
            "screenName": String,
            "cr eatedAt": DateString, //ISOFormat
            "updatedAt": DateString, //ISOFormat
            "isVerified": Boolean,
            "verifyMessage": String,
            "briefIntro": String,
            "avatarImage": {
                "thumbnailUrl": String,
                "smallPicUrl": String,
                "picUrl": String,
                "format": String,
                "badgeUrl": String
            },
            "profileImageUrl": String,
            "trailingIcons": Array,
            "statsCount": {
                "topicSubscribed": Number,
                "topicCreated": Number,
                "followedCount": Number,
                "followingCount": Number,
                "highlightedPersonalUpdates": Number,
                "liked": Number
            },
            "isDefaultScreenName": Boolean,
            "bio": String,
            "gender": String,
            "ref": String
        },
        "createdAt": DateString, //ISOFormat
        "messageId": String,
        "rollouts": {
            "wmpShare": {
                "id": String,
                "path": String
            }
        },
        "likeIcon": String,
        "readTrackInfo": {
            "feedType": String
        }
    }]
}


async function check(_id, type) {
    let options = new route.Jike(_id, type);
    await request(options.url, options.uri, (err, res) => {
        if (err || res.statusCode != 200) {
            return new Error(err)
        } else {
            return new Error(`错误：${res.error}`);
        }
    });
}