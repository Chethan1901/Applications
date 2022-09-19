import twilio from 'twilio';


const accountSid = "USE YOUR SID";
const authToken = "USE YOUR TOKEN";
const client = new twilio("AC5701753334bcb537becd67fbec693a18", "03939da7a15b7c8fc55168d9eb4db90e");

// let smsbody = {
//     body: "this is a reminder",
//     to: "+919014828737"
// }
async function sendSMS(smsbody) {
    try {
        let message = await client.messages
            .create({
                body: smsbody.body,
                from: '+19787186117',
                to: smsbody.to
            })
        console.log(message.sid);
    } catch (error) {
        console.error(error)
    }
}
export default sendSMS;
// sendSMS({
//     body: `Thank you for Signing Up. Please click on the given link to verify your phone. http://192.168.68.133:5000/api/verify/mobile/`,
//     to: "+919703534849"
// })



