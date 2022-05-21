"use strict";
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const dotenv = require('dotenv').config();

const poolData = {
    UserPoolId: dotenv.parsed.AWS_COGNITO_USER_POOL_ID,
    ClientId: dotenv.parsed.AWS_COGNITO_CLIENT_ID
};
const pool_region = dotenv.parsed.AWS_COGNITO_REGION
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.signUp = async (params) => {
    try {
        var attribute_list = [];
        return new Promise((resolve, reject) => {
            const { first_name, email, last_name, password, birth_date } = params
            attribute_list.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
            attribute_list.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "given_name", Value: first_name }));
            attribute_list.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "family_name", Value: last_name }));
            attribute_list.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "birthdate", Value: birth_date }));
            attribute_list.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: "updated_at", Value: Math.floor(new Date().getTime() / 1000).toString()
            }));
            userPool.signUp(email, password, attribute_list, null, (err, result) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                    return;
                }
                let cognitoUser = result.user;
                resolve(cognitoUser)
            });
        });
    } catch (error) {
        return error
    }
}

exports.signIn = async (params) => {
    const { email, password } = params
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
    });
    var userData = {
        Username: email,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                resolve(result.getAccessToken().getJwtToken());
                // console.log('access token + ' + result.getAccessToken().getJwtToken());
                // console.log('id token + ' + result.getIdToken().getJwtToken());
                // console.log('refresh token + ' + result.getRefreshToken().getToken());
            },
            onFailure: function (err) {
                reject(err);
            },
        });
    })
}

exports.verify = async (params) => {
    const { email, confirmation_code } = params
    const userData = {
        Username: email,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(confirmation_code, true, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result)
        });
    });
}