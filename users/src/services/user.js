
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const crypto = require("crypto");
const db_constant = require("../config/db-constants.json")
const utils = require('../lib/utils')
const responseHandler = require('../config/response-handler.json')

exports.insertUserInDB = async (body) => {
    //const id = crypto.randomBytes(16).toString("hex");
    var result
    const { first_name, email, last_name, birth_date, password, confirm_password } = body;
    var f_name = first_name.trim()
    var l_name = last_name.trim()
    var dob = birth_date.trim()
    if (f_name == "") {
        return {
            "message": responseHandler.FNAME_VALIDATION
        }
    }
    if (l_name == "") {
        return {
            "message": responseHandler.LNAME_VALIDATION
        }
    }
    if (dob == "") {
        return {
            "message": responseHandler.DATE_VALIDATION
        }
    }
    let dobVerification = await utils.checkAgeLimit(new Date(dob))
    console.log(dobVerification, "dobVerification++++++++++++++++++++++")
    if (dobVerification == false) {
        return {
            "message": responseHandler.AGE_LIMIT
        }

    }
    const TableName = db_constant.user_table;
    var params = {
        TableName,
        Item: {
            first_name: first_name,
            last_name: last_name,
            email: email,
            birth_date: birth_date,
            pk: 'user#' + email,
            sk: 'user#' + email,
            category: [],
            sub_category: [],
            profile_image_url: "",
            user_name: "",
            Bio: "",
            general_location: "",
            gender: "",
            referred_email: "",
            content_type: [],
            active: false,
            verified: false,
            type: db_constant.USER,
            created_date: new Date().getTime(),
            gsi1sk: "@username",
            modified_date: ''

        },
        ConditionExpression: "attribute_not_exists(email)"
    }
    await dynamo.put(params).promise();
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.USER_CREATED)
    )
}


exports.updateUserProfile = async (inputData, event) => {

    const { bio, profile_image_url, user_name, genral_location, gender, referred_email, category } = inputData;
    const TableName = db_constant.users_info;

    if (inputData.bio) {
        if (bio.length > 100) {
            return utils.sendResponse(500,
                JSON.stringify(responseHandler.LIMIT_EXCEED))

        }
    }
    if (inputData.gender) {
        if (!db_constant.Gender.includes(gender)) {
            return utils.sendResponse(500,
                JSON.stringify(responseHandler.GENDER))

        }
    }
    if (inputData.category) {
        if (category.length > 3) {
            return utils.sendResponse(500,
                JSON.stringify(responseHandler.CATEGORY))
        }
    }

    var updateInput = utils.generateUpdateQuery(inputData)

    const params = {
        TableName,
        Key: {
            pk: 'user#' + event.pathParameters.id,
            sk: 'user#' + event.pathParameters.id
        },

        ExpressionAttributeValues: updateInput.ExpressionAttributeValues,
        ExpressionAttributeNames: updateInput.ExpressionAttributeNames,
        UpdateExpression: updateInput.UpdateExpression,
        ReturnValues: "UPDATED_NEW"

    };
    await dynamo.update(params).promise();
    return utils.sendResponse(201,
        JSON.stringify(responseHandler.PROFILE_UPDATED)
    )
}



