import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider"; 


const client = new CognitoIdentityProviderClient({ region : "us-east-1" })

export const GetUserInfo = async (event) => {
    console.log(event);
    const content = JSON.parse(event.body)
    const {email} = content;


    const input = { 
        UserPoolId: "", 
        Username: email 
    };

    try {
        //const command = new AdminGetUserCommand(input);
        //const response = await client.send(command); 
        await client.send(new AdminGetUserCommand(input));
        return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*", //Allow all origins 
              "Access-Control-Allow-Methods": "POST", //Allow specific methods
              "Access-Control-Allow-Headers": "Content-Type", //Allow specific headers
            },
            body: JSON.stringify("User Info Saved"),
          };
    } catch (error) {
        console.error("Error registering user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify(error.message) };
        }
    }

