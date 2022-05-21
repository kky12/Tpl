const AWS = require('aws-sdk');
const responseHandler = require('../config/response-handler.json')
const categoryService = require('../services/category')
const utils = require('../lib/utils')
const db_constant = require("../config/db-constants.json")

const dynamo = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");
let id = '';

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "DELETE /category/{pk}/{sk}":
        await dynamo
          .delete({
            TableName: db_constant.category,
            Key: {
              pk: event.pathParameters.pk,
              sk: event.pathParameters.sk
            }
          })
          .promise();
        body = `Deleted category ${event.pathParameters.pk}`;
        break;
      case "GET /category/{pk}/{sk}":
        body = await dynamo
          .get({
            TableName: db_constant.category,
            Key: {
              pk: event.pathParameters.pk,
              sk: event.pathParameters.sk
            }
          })
          .promise();
        console.log("*********************!!!!!!", body);
        break;
      case "GET /category":
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        body = await dynamo.scan({ TableName: `${db_constant.category}` }).promise();
        break;
      case "POST /category":
        id = crypto.randomBytes(16).toString("hex");
        body = JSON.parse(event.body);
        var { category_name } = body;
        var today = new Date();
        var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
        var item = {
          pk: id,
          sk: id,
          category_name,
          created_at: date,
          updated_at: date,
          active: true
        }
        await categoryService.insertCategoryInDB(item);
        return utils.sendResponse(201,
          JSON.stringify(responseHandler.Category_created)
        )
        break;
      case "PUT /category/{pk}/{sk}":
        body = JSON.parse(event.body);
        var { category_name, active } = body;
        var today = new Date();
        var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
        var itemObj = {
          category_name,
          active,
          date,
          pk: event.pathParameters.pk,
          sk: event.pathParameters.sk
        }
        await categoryService.updateCategoryInDB(itemObj);
        return utils.sendResponse(200,
          JSON.stringify(responseHandler.Category_updated)
        )
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
}