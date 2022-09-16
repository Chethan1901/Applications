// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure

import twilio from 'twilio';

const accountSid = 'ACd57eedbae7a95fce425f3830468b6938';
const authToken = '86855098e97f6a5a3ce1c9680cb35605';
const client = new twilio(accountSid, authToken);

let sendSmsObject = {
    body: 'Bhai, Jawab nai diye',
    to: '+919394804040'
}

async function sendsms(sendSmsObject) {
	try {
		let message = await client.messages.create({
            body:sendSmsObject.body, 
            to:sendSmsObject.to,
			from: '+19786794405'
		});
		console.log(message.sid);
	} catch (error) {
        console.error(error);
    }
}
sendsms(sendSmsObject);