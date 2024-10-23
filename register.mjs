import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider"
import crypto from 'crypto'

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

    

    const secretHash = calculateSecretHash("" , "" , email) 
    console.log("HASH:", secretHash)

    const signUpParams = {
        ClientId: '',
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
        await client.send(new SignUpCommand(signUpParams))
        return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*", //Allow all origins 
              "Access-Control-Allow-Methods": "GET", //Allow specific methods
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

