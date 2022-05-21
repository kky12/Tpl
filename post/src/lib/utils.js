
"use strict";

exports.sendResponse = (code, message) => {
    return {
        "statusCode": code,
        "body": message,
        "isBase64Encoded": false
    };
}

exports.isEmpty = (value, name) => {
    if (value == "") {
		throw new Error('Missing required key in params: '+ name);
	}
}
