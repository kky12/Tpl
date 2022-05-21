
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const crypto = require("crypto");
const db_constant = require("../config/db-constants.json")
exports.insertCategoryInDB = async (item) => {
    const TableName = db_constant.category;
    const params = {
        TableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(pk)"
    }
    return await dynamo.put(params).promise();
}

exports.updateCategoryInDB = async (item) => {
    const TableName = db_constant.category;
    const params = {
        TableName,
        Key: {
            pk: item.pk,
            sk: item.sk
        },
        ExpressionAttributeValues: {
            ":cn": item.category_name,
            ":ua": item.date,
            ":ac": item.active
        },
        UpdateExpression: "SET category_name = :cn, updated_at = :ua, active = :ac",
        ReturnValues: "ALL_NEW"
    };
    return await dynamo.update(params).promise();
}