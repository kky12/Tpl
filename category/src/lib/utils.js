
"use strict";

exports.sendResponse = (code, message) => {
    return {
        "statusCode": code,
        "body": message,
        "isBase64Encoded": false
    };
}
