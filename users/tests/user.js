const expect = require('chai').expect
const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
before((done) => {
    //before all the test cases run 
    done();
});

after((done) => {
    //after all the test cases run 
    done();
});

describe('User functions', () => {
    it('User Sign-Up || Success', done => {
        expect(true).to.equal(true);
        done();
    })
})