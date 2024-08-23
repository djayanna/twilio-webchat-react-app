const sgMail = require("@sendgrid/mail");
const axios = require("axios");

function createMessage(emailData, files, from) {
    const attachmentObjects = files.map((file) => ({
        content: file.file,
        filename: file.filename,
        type: file.type,
        disposition: "attachment"
    }));
    return {
        to: emailData.recipientAddress,
        from: from,
        subject: emailData.subject,
        html: emailData.text,
        attachments: attachmentObjects
    };
}

async function sendMessage(emailParams, context) {
    const uniqueFilenames = emailParams.uniqueFilenames;
    const getMedia = emailParams.mediaInfo.map((media) => axios.get(media.url, { responseType: "arraybuffer" }));
    const files = await Promise.all(getMedia).then((responses) => {
        const files = [];
        for (let i = 0; i < responses.length; i++) {
            try {
                const response = responses[i];
                const base64File = Buffer.from(response.data, "binary").toString("base64");
                files.push({ file: base64File, filename: uniqueFilenames[i], type: emailParams.mediaInfo[i].type });
            } catch (error) {
                console.error(error);
            }
        }
        return files;
    });

    try {
        await sgMail.send(createMessage(emailParams, files, context.FROM_EMAIL));
        return { message: `Transcript email sent to: ${emailParams.recipientAddress}` };
    } catch (error) {
        console.error(`Error sending transcript email to: ${emailParams.recipientAddress}`, error);
        if (error.response) {
            console.error(error.response.body);
        }
        return { message };
    }
}

exports.handler = async function (context, event, callback) {
    sgMail.setApiKey(context.SENDGRID_API_KEY);

    const response = new Twilio.Response();

    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
        const message = await sendMessage(event.body, context);
        response.setBody({ message });
    } catch (error) {
        console.error(error);
        response.setStatusCode(500);
        response.setBody({ error: `Invalid token provided: ${error.message}` });
        return callback(null, response);
    }

    response.setStatusCode(200);
    callback(null, response);
};
