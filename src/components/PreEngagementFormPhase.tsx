import { Box } from "@twilio-paste/core/box";
import { TextArea } from "@twilio-paste/core/textarea";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { InputBox } from "@twilio-paste/core/input-box";
import { SendIcon } from "@twilio-paste/icons/esm/SendIcon";
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";
import { Flex } from "@twilio-paste/core";

import { sessionDataHandler } from "../sessionDataHandler";
import { addNotification, changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import { initSession } from "../store/actions/initActions";
import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { notifications } from "../notifications";
import { NotificationBar } from "./NotificationBar";
import { introStyles, titleStyles, formStyles } from "./styles/PreEngagementFormPhase.styles";
import { innerInputStyles, messageOptionContainerStyles, textAreaContainerStyles } from "./styles/MessageInput.styles";
import { CHAR_LIMIT } from "../constants";

export const PreEngagementFormPhase = () => {
    const { name, email } = useSelector((state: AppState) => state.config.preEngagementData) || {};
    const [text, setText] = useState("");
    // const [isSending, setIsSending] = useState(false);
    const dispatch = useDispatch();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    async function initiateChatSessionAndSendMessage(message: string) {
        dispatch(updatePreEngagementData({ query: message }));
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
        try {
            const data = await sessionDataHandler.fetchAndStoreNewSession({
                formData: {
                    friendlyName: name,
                    email,
                    query: message
                }
            });

            dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
        } catch (err) {
            dispatch(addNotification(notifications.failedToInitSessionNotification((err as Error).message)));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        await initiateChatSessionAndSendMessage(text);
        setText("");
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const onChange = (val: ChangeEvent<HTMLTextAreaElement>) => {
        setText(val.target.value);
    };

    return (
        <>
            <Header />
            <NotificationBar />
            <Box as="form" data-test="pre-engagement-chat-form" onSubmit={handleSubmit} {...formStyles}>
                <Flex hAlignContent="center" width="100%">
                    <ChatIcon decorative={false} title="chat" size="sizeIcon60" color="colorTextIconOffline" />
                </Flex>
                <Flex hAlignContent="center" width="100%">
                    <Text {...titleStyles} textAlign="center" as="p">
                        Welcome to Owl Bank!
                    </Text>
                </Flex>
                <Text {...introStyles} as="p">
                    Hi there! What can I help you with today?
                </Text>
                <p />
                {/* <Box marginLeft="space100" height="80" {...optionStyles}>
                    <Button
                        data-test="pre-engagement-chat-order-tracking-button"
                        variant="primary_icon"
                        size="icon_small"
                        onClick={async () => {
                            handleClick("Order Tracking");
                        }}
                    >
                        Order Tracking
                    </Button>
                </Box>
                <p />
                <Box marginLeft="space100" height="80" {...optionStyles}>
                    <Button
                        variant="primary_icon"
                        data-test="pre-engagement-chat-returns-button"
                        size="icon_small"
                        onClick={async () => {
                            handleClick("Returns");
                        }}
                    >
                        Returns
                    </Button>
                </Box>
                <p />
                <Box marginLeft="space100" height="80" {...optionStyles}>
                    <Button
                        data-test="pre-engagement-sizing-advice-button"
                        variant="primary_icon"
                        size="icon"
                        onClick={async () => {
                            handleClick("Sizing advice");
                        }}
                    >
                        Sizing advice
                    </Button>
                </Box> */}
                <Box as="div" height="220px" />
                <Flex vAlignContent="bottom">
                    <InputBox element="MESSAGE_INPUT_BOX">
                        <Box as="div" {...innerInputStyles}>
                            <Box {...textAreaContainerStyles}>
                                <TextArea
                                    ref={textAreaRef}
                                    data-test="message-input-textarea"
                                    placeholder="Type your message"
                                    value={text}
                                    element="MESSAGE_INPUT"
                                    onChange={onChange}
                                    onKeyPress={handleKeyPress}
                                    maxLength={CHAR_LIMIT}
                                />
                            </Box>
                            <Box {...messageOptionContainerStyles}>
                                <Button
                                    data-test="message-send-button"
                                    variant="primary_icon"
                                    size="icon_small"
                                    type="submit"
                                    // aria-disabled={isSubmitDisabled}
                                >
                                    <SendIcon decorative={false} title="Send message" size="sizeIcon30" />
                                </Button>
                            </Box>
                        </Box>
                    </InputBox>
                </Flex>
            </Box>
        </>
    );
};
