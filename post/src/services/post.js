
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const db_constant = require("../config/db-constants.json")
const utils = require('../lib/utils')

exports.insertPostInDB = async (body) => {

    var { user_id, type, description, link } = body;
    var today = new Date();
    var date = today.getDate() + '' + (today.getMonth() + 1) + '' + today.getFullYear();
    let ms = today.getMilliseconds();
    const utc_time = Math.floor((new Date()).getTime() / 1000);

    utils.isEmpty(type, 'Type');
    utils.isEmpty(user_id, 'USER ID');

    switch (type) {
        case "text":
            utils.isEmpty(description, 'Description');
            var item = {
                pk: `USER#${user_id}`,
                sk: `POST#${date}${ms}#TEXT`,
                type: 'text',
                description,
                publish: true,
                publish_date: date,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;
        case "image":
            
            break;
        case "video":
        
            break;
        case "audio":
        
            break;
        case "poll":
        
            break;
        case "link":
            utils.isEmpty(link, 'Link');
            var item = {
                pk: `USER#${user_id}`,
                sk: `POST#${date}${ms}#LINK`,
                type: 'link',
                link,
                publish: true,
                publish_date: date,
                likes_count: 0,
                comments_count: 0,
                status: 'active',
                created_at: new Date().getTime(),
                updated_at: '',
            }
            break;            
        default:
            throw new Error('Unknown post type: '+ type);
    }

    const TableName = db_constant.post;
    const params = {
        TableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(pk)"
    }
    return await dynamo.put(params).promise();
}

exports.updatePostInDB = async (item) => {
    const TableName = db_constant.post;
    const params = {
        TableName,
        Key: {
            pk: item.pk,
            sk: item.sk
        },
        ExpressionAttributeValues: {
            ":cn": item.post_name,
            ":ua": item.date,
            ":ac": item.active
        },
        UpdateExpression: "SET post_name = :cn, updated_at = :ua, active = :ac",
        ReturnValues: "ALL_NEW"
    };
    return await dynamo.update(params).promise();
}