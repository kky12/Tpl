const dotenv = require('dotenv').config();
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const responseHandler = require('../config/response-handler.json')

const pool_region = dotenv.parsed.AWS_COGNITO_REGION
exports.verifyToken = async (token) => {
    return new Promise((resolve, reject) => {
        request({
            url: `https://cognito-idp.${pool_region}.amazonaws.com/${dotenv.parsed.AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let pems = {};
                var keys = body['keys'];
                for (var i = 0; i < keys.length; i++) {
                    //Convert each key to PEM
                    var key_id = keys[i].kid;
                    var modulus = keys[i].n;
                    var exponent = keys[i].e;
                    var key_type = keys[i].kty;
                    var jwk = { kty: key_type, n: modulus, e: exponent };
                    var pem = jwkToPem(jwk);
                    pems[key_id] = pem;
                }
                //validate the token
                var decodedJwt = jwt.decode(token, { complete: true });
                if (!decodedJwt) {
                    reject({ message: responseHandler.INVALID_TOKEN });
                } else {
                    var kid = decodedJwt.header.kid;
                    var pem = pems[kid];
                    if (!pem) {
                        reject({ message: responseHandler.INVALID_TOKEN });
                    }

                    jwt.verify(token, pem, function (err, payload) {
                        if (err) {
                            reject({ message: responseHandler.INVALID_TOKEN });
                        } else {
                            resolve(payload);
                        }
                    });
                }

            } else {
                reject({ message: "Error! Unable to download JWKs" });
            }
        });
    });
}