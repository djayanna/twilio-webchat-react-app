const axios = require("axios");
const { createToken } = require(Runtime.getFunctions()[
  "helpers/createToken"
].path);
const { TOKEN_TTL_IN_SECONDS } = require(Runtime.getFunctions()[
  "constants"
].path);

const contactWebchatOrchestrator = async (context, formData, customerFriendlyName) => {
  const params = new URLSearchParams();
  params.append("AddressSid", context.CHAT_ADDRESS_SID);
  params.append("ChatFriendlyName", "Webchat widget");
  params.append("CustomerFriendlyName", customerFriendlyName);
  params.append(
    "PreEngagementData",
    JSON.stringify({
      ...formData,
      friendlyName: customerFriendlyName
    })
  );

  let conversationSid;
  let identity;

  try {
    const res = await axios.post(
      `https://flex-api.twilio.com/v2/WebChats`,
      params,
      {
        auth: {
          username: context.ACCOUNT_SID,
          password: context.AUTH_TOKEN,
        },
      }
    );

    console.log("res",  res.data);
    ({ identity, conversation_sid: conversationSid } = res.data);
  } catch (e) {
    console.log(e)
    throw e
  }

  return {
    conversationSid,
    identity,
  };
};

const sendUserMessage = async (context, conversationSid, identity, body) => {
  await context
    .getTwilioClient()
    .conversations.conversations(conversationSid)
    .messages.create({
      body: body,
      author: identity,
      xTwilioWebhookEnabled: true, // trigger webhook
    })
    .then(() => {
      console.log("(async) User message sent");
    })
    .catch((e) => {
      console.log(`(async) Couldn't send user message: ${e?.message}`);
    });
};

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

  console.log("formData", event.formData);

  const customerFriendlyName = event.formData?.friendlyName || "Customer";

  let conversationSid;
  let identity;

  try {
    const result = await contactWebchatOrchestrator(
      context,
      event.formData,
      customerFriendlyName,
    );
    ({ identity, conversationSid } = result);
    // Generate token for customer
    const token = await createToken(context, identity);
    // OPTIONAL — if user query is defined
    if (event.formData?.query) {
      await sendUserMessage(context, conversationSid, identity, event.formData?.query);
    }
    response.setBody({
      token,
      conversationSid,
      expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000,
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
        "Couldn't initiate webchat. Check Twilio Console for more information.",
    });

    return callback(null, response);
  }
};
