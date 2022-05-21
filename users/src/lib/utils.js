
"use strict";

exports.sendResponse = (code, message) => {
    return {
        "statusCode": code,
        "body": message,
        "isBase64Encoded": false
    };
}


exports.generateUpdateQuery = (fields) => {
    let exp = {
        UpdateExpression: 'SET',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    })
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp
}

exports.checkAgeLimit = (dateOfBirth)=> {
    const date18YrsAgo = new Date();
    date18YrsAgo.setFullYear(date18YrsAgo.getFullYear() - 18);
    return dateOfBirth <= date18YrsAgo;
    
  }
  