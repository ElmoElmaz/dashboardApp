const tailwindStyles = `
    <style>
        /* Include Tailwind CSS styles */
        /* You can customize these styles based on your Tailwind configuration */
        /* Example styles for common elements */
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Arial', sans-serif;
            background-color: #f7fafc;
        }
        .text-center {
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3182ce;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background-color: #2c5282;
        }
    </style>
`;


export const customMessage = async (event, context, callback) => {
    if (event.triggerSource === 'CustomMessage_SignUp') {
        console.log(JSON.stringify(event))
        const { codeParameter } = event.request
        const { clientId } = event.callerContext;
        const {userName } = event;
   
        const confirmationLink = `https://dashboardapp.auth.us-east-1.amazoncognito.com/confirmUser?client_id=${clientId}&user_name=${userName}&confirmation_code=${codeParameter}`;
   
        // Customize the email subject and message
        event.response.emailSubject = 'Almost there! Confirm your account!';
        event.response.emailMessage = `
            <html>
            <head>
                ${tailwindStyles}
            </head>
            <body>
                <div class="container">
                    <div class="text-center">
                        <img src="https://img-it-academy.s3.amazonaws.com/logo-it.png" alt="Logo" style="max-width: 200px;">
                        <h2 class="text-xl font-bold mt-4">Confirm Your Account</h2>
                        <p class="mt-2">Click the confirmation button below to activate your account:</p>
                        <a href="${confirmationLink}" class="btn mt-4">Confirm Account</a>
                    </div>
                </div>
            </body>
            </html>
        `;

    }

    console.log("Response: ", event.response);
    callback(null, event);


    }


