import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"
import crypto from 'crypto'
import { ClientRequest } from "http";

const client = new CognitoIdentityProviderClient({ region : "us-east-1" })

export const loginUser = async (event) => {
    console.log(event);
    const content = JSON.parse(event.body);
    const { email, password} = content;
    const clientId = "";
    const clientSecret = "";


    const calculateSecretHash = (clientId, clientSecret, clientemail) => {
        const message = clientemail + clientId;
        console.log({message})
        const hmac = crypto.createHmac('sha256', clientSecret)
        console.log({hmac})
        hmac.update(message);
        return hmac.digest('base64')
    }


    const SecretHash = calculateSecretHash(clientId, clientSecret, email)
    

    const authParams = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: SecretHash
        }
    };

    try {
        const authResponse = await client.send(new InitiateAuthCommand(authParams));
        console.log("User authenticated successfuly: "),authResponse;
        const accessToken = authResponse.AuthenticationResult.AccessToken;
        const idToken = authResponse.AuthenticationResult.idToken; 
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "Content-Type",
            'Access-Control-Allow-Methods' : 'OPTIONS,POST'
        },

        body: JSON.stringify({accessToken, idToken, email})
    };

    } catch (error) {
        console.error("Error authenticating user", error);
        return {
            statusCode:500,
            headers: {
                'Access-Control-Allow-Origin': "*",
                'Access-Control-Allow-Headers': "Content-Type",
                'Access-Control-Allow-Methods' : 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'Verification code sent successfully'})
        };
    }



};



