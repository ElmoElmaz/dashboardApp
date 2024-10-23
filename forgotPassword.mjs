import { CognitoIdentityProviderClient, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto'

export const handler = async (event) => {
    const content =JSON.parse(event.body);
    console.log({content})
    const { email } = content;



const client = new CognitoIdentityProviderClient({region: 'us-east-1'});

const clientId = '';
const clientSecret = '';
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
    
