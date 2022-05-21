const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient({'region': 'us-east-1'});
const crypto = require("crypto");

//create user info
exports.createUser = async event => {
  const body = JSON.parse(event.body);
  try {
    const { first_name, email, last_name,password,birth_date } = body;
    const id = crypto.randomBytes(16).toString("hex");
    const TableName = 'usersInfo';
    const params = {
      TableName,
      Item: {
          user_id:id, 
          first_name:first_name,
              last_name:last_name,
              email: email,
              password:password,
              birth_date:birth_date,
              cateogary:[],
              profile_image_url:"",
              user_name:"",
              Bio:"",
              genral_location:"",
              gender:"",
              referred_email:"",
              active:"true",
              verified:"false"
          
        },
      ConditionExpression: "attribute_not_exists(email)"
    };
    await dynamo.put(params).promise();
    return { message: 'Post created successfully' }
  } catch (e) {
    return { message:'Could not create the post'};
  }
};



//update user info
exports.updateUserInfo = async event => {
  const body = JSON.parse(event.body);
  console.log(event.pathParameters.id,"PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPp")
  try {
    const { bio,profile_image_url,user_name,genral_location,gender,referred_email } = body;
    
    const params = {
      TableName,
      key: {
          user_id:event.pathParameters.id,            
        },
        
          ExpressionAttributeValues: {
            ":bio": bio,
            ":profile_image_url": profile_image_url,
            ":user_name": user_name,
            ":general_location": genral_location,
            ":gender": gender,
            ":referred_email": referred_email

          },
          UpdateExpression:
          "SET bio = :bio, profile_image_url = :profile_image_url, user_name = :user_name, general_location = :general_location,gender = :gender, referred_email = :referred_email",
        ReturnValues: "ALL_NEW"
    
    };
    await dynamo.update(params).promise();
    return { message: 'Post updated successfully' }
  } catch (e) {
    return { message:'Could not update the post'
  };
}
}
