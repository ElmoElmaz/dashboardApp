import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"
import crypto from 'crypto'
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";


const client = new CognitoIdentityProviderClient({ region : "us-east-1" })

export const loginUser = async (event) => {
    console.log(event);
    const content = JSON.parse(event.body);
    const { email, password} = content;
    const clientssm = new SSMClient({region: 'us-east-1'});
    const inputClientId = { 
      Name: "prod-ClientId", 
      WithDecryption: true
    };
    const responseClientId = await clientssm.send(new GetParameterCommand(inputClientId));
    const clientId = responseClientId.Parameter.Value;
    
    const inputClientSecret = {
        Name: "prod-ClientSecret",
        WithDecryption: true
    };
    const responseClientSecret = await clientssm.send(new GetParameterCommand(inputClientSecret));
    const clientSecret = responseClientSecret.Parameter.Value


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
            body: JSON.stringify({ message: 'Incorrect User Name od Password'})
        };
    }



};



