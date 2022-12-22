exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
  response.appendHeader("Content-Type", "application/json");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent"
  );
  response.setStatusCode(200);

  console.log("conversationSid", event.conversationSid);

  let conversationSid = event.conversationSid


  try {
    const result = await context
    .getTwilioClient()
    .conversations.conversations(conversationSid)
    .update({state: "closed"})
    .then(() => {
      console.log(`conversation ${conversationSid} closed`);
    })
    .catch((e) => {
      console.log(`Could not close conversation ${conversationSid} - ${e?.message}`);
    });

    response.setBody({
        result
      });

    
    console.log("response", response);

    return callback(null, response);
  } catch (error) {
    console.log(error);
    console.error(error);
    response.setStatusCode(500);
    response.setBody({
      error: true,
      errorObject:
        `Could not close conversation ${conversationSid}. Check Twilio Console for more information.`,
    });

    return callback(null, response);
  }
};
