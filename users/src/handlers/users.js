const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-1' });
const crypto = require("crypto");
const userServices = require('../services/user')
const cognito = require('../services/cognito');
const utils = require('../lib/utils')
const responseHandler = require('../config/response-handler.json')
const db_constant = require('../config/db-constants.json')


exports.handler = async (event) => {
  let body;
  let statusCode = 200;
  var status = true
  const headers = {
    "Content-Type": "application/json"
  };
  var responseBody = {
    "status": status,
    "statusCode": statusCode
  }

  try {
    switch (event.routeKey) {
      case "DELETE /users/{id}": //Not implemented
        await dynamo
          .delete({
            TableName: db_constant.user_table,
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /users/{id}": // Not Implemented
        body = await dynamo
          .get({
            TableName: db_constant.user_table,
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        break;
      case "GET /users": // Not Implemented
        body = await dynamo.scan({ TableName: db_constant.user_table }).promise();
        break;
      case "POST /users": // Create user api
        const inputData = JSON.parse(event.body);
        await cognito.signUp(inputData)
        var result = await userServices.insertUserInDB(inputData)
        body = result.body
        responseBody = {
          "status": status,
          "statusCode": statusCode
        }
        break;
      case "POST /users/login": // Create user api
        const userCred = JSON.parse(event.body);
        var getUserToken = await cognito.signIn(userCred);
        responseBody = {
          "status": status,
          "statusCode": statusCode,
          "token": getUserToken
        }
        break;
      case "POST /users/verify": // Verify user OTP
        const verificationDetails = JSON.parse(event.body);
        await cognito.verify(verificationDetails);
        responseBody = {
          "status": status,
          "statusCode": statusCode
        }
        break;
      case "PUT /users/{id}": // Update user
        const userData = JSON.parse(event.body);
        body = await userServices.updateUserProfile(userData, event)
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    body = err.message;
    statusCode = body === 'User is not confirmed.' ? 401 : 400;
    status = false
    responseBody = {
      "status": status,
      "statusCode": statusCode,
      "message": body
    }
  } finally {
    responseBody = JSON.stringify(responseBody);
  }

  return {
    statusCode: statusCode,
    headers,
    body: responseBody
  };
}
