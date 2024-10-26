import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider"
import crypto from 'crypto'
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";


const client = new CognitoIdentityProviderClient({ region : "us-east-1" })

export const registerUser = async (event) => {
    console.log(event);
    const content = JSON.parse(event.body)
    const { firstName, lastName, email, phoneNumber, password} = content;

    const calculateSecretHash = (clientId, clientSecret, clientemail) => {
        const message = clientemail + clientId;
        console.log({message})
        const hmac = crypto.createHmac('sha256', clientSecret)
        console.log({hmac})
        hmac.update(message);
        return hmac.digest('base64')
    }

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

    const secretHash = calculateSecretHash( clientId, clientSecret, email) 
    console.log("HASH:", secretHash)

    const signUpParams = {
        ClientId: clientId,
        Username: email,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
            {Name: "given_name", Value: firstName},
            {Name: "family_name", Value: lastName},
            {Name: "phone_number", Value: phoneNumber},
        ]
    }
    try {
        const response =  await client.send(new SignUpCommand(signUpParams))
        console.log({response})
        return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*", //Allow all origins 
              "Access-Control-Allow-Methods": "POST", //Allow specific methods
              "Access-Control-Allow-Headers": "Content-Type", //Allow specific headers
            },
            body: JSON.stringify("User sign up Succesfully"),
          };
    } catch (error) {
        console.error("Error registering user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify(error.message) };
        }
    }

