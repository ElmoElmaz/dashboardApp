import { CognitoIdentityProviderClient, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto'
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export const handler = async (event) => {
    const content =JSON.parse(event.body);
    console.log({content})
    const { email } = content;



const client = new CognitoIdentityProviderClient({region: 'us-east-1'});

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
const secretHash = calculateSecretHash(clientSecret, email, clientId);

const params ={
    ClientId: clientId,
    Username: email,
    SecretHash: secretHash
}
console.log({params})

try {
    await client.send(new ForgotPasswordCommand(params));
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "Content-Type",
            'Access-Control-Allow-Methods' : 'OPTIONS,POST'
        },    
        body: JSON.stringify({message: 'Verification code sent successfully'})
        
    };
} 
catch (error) {
        console.log("Error sending verification code", error);
        return {
            statusCode: 500,
            headers: {
                    'Access-Control-Allow-Origin': "*",
                    'Access-Control-Allow-Headers': "Content-Type",
                    'Access-Control-Allow-Methods' : 'OPTIONS,POST'
                },
                body: JSON.stringify({ error: 'Failed to send verification code'})
            };
        }

    };
const calculateSecretHash = (clientSecret, username, clientId) => {
    const data = username + clientId;
    const hash = crypto.createHmac('sha256', clientSecret).update(data).digest('base64');
    return hash;
}
    
