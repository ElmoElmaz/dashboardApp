import { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import crypto from 'crypto'

export const handler = async(event) => {
    const content = JSON.parse(event.body);
    const { code, password, email } = content;

const clientssm = new SSMClient({region: 'us-east-1'});
const inputClientId = { 
  Name: "prod-ClientId", 
  WithDecryption: true
};
const commandClientId = new GetParameterCommand(inputClientId);
const responseClientId = await clientssm.send(commandClientId);


const inputClientSecret = {
    Name: "prod-ClientSecret",
    WithDecryption: true
};
const commandClientSecret = new GetParameterCommand(inputClientSecret);
const responseClientSecret = await clientssm.send(commandClientSecret);
console.log("Tukaaaaaaaaaaaa", responseClientSecret)
const clientSecret = responseClientSecret.Parameter.Value



const client = new CognitoIdentityProviderClient({region: 'us-east-1'});
const clientId = '';

const secretHash = calculateSecretHash(clientSecret, email, clientId);

const params = {
    ClientId: clientId,
    ConfirmationCode: code,
    Username: email,
    Password: password,
    SecretHash: secretHash
};

try {
    const data = await client.send(new ConfirmForgotPasswordCommand(params));
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "Content-Type",
            'Access-Control-Allow-Methods' : 'OPTIONS,POST'
        },    
        body: JSON.stringify({message: 'Password confirmed Successfully' + data})
        
    };
} 
catch (error) {
        console.log("Error confirming new password:", error);
        return {
            statusCode: 500,
            headers: {
                    'Access-Control-Allow-Origin': "*",
                    'Access-Control-Allow-Headers': "Content-Type",
                    'Access-Control-Allow-Methods' : 'OPTIONS,POST'
                },
                body: JSON.stringify({ error: 'Failed to confirm new password'})
            };
        }

    };
const calculateSecretHash = (clientSecret, username, clientId) => {
    const data = username + clientId;
    const hash = crypto.createHmac('sha256', clientSecret).update(data).digest('base64');
    return hash;
}







