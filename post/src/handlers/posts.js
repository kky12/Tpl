const AWS = require('aws-sdk');
const responseHandler = require('../config/response-handler.json')
const postService = require('../services/post')
const utils = require('../lib/utils')
const db_constant = require("../config/db-constants.json")

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

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
			case "GET /post":
				body = await dynamo.scan({ TableName: `${db_constant.post}` }).promise();
				responseBody = {
					"status": status,
					"statusCode": statusCode,
					"message": body
				}
				break;
			case "POST /post":
				body = JSON.parse(event.body);
				var result = await postService.insertPostInDB(body);
				body = result.body
				responseBody = {
					"status": status,
					"statusCode": statusCode
				}
				break;
			default:
				throw new Error(`Unsupported route: "${event.routeKey}"`);
		}
	} catch (err) {
		statusCode = 400;
		body = err.message;
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