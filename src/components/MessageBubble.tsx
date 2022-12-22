import { Media, Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { ScreenReaderOnly } from "@twilio-paste/core/screen-reader-only";
import { useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Flex } from "@twilio-paste/core/flex";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { Key, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SuccessIcon } from "@twilio-paste/icons/esm/SuccessIcon";
import { Button } from "@twilio-paste/core";

import { AppState } from "../store/definitions";
import { FilePreview } from "./FilePreview";
import { parseMessageBody } from "../utils/parseMessageBody";
import {
    getAvatarContainerStyles,
    getInnerContainerStyles,
    authorStyles,
    timeStampStyles,
    bodyStyles,
    outerContainerStyles,
    readStatusStyles,
    bubbleAndAvatarContainerStyles,
    productNameStyles,
    productPriceStyles,
    optionStyles
} from "./styles/MessageBubble.styles";

interface MessageWithAttributes {
    type: string;
}

interface ProductCardAttributes extends MessageWithAttributes {
    type: string;
    name: string;
    imageUrl: string;
    price: string;
    productUrl: string;
}

interface SelectableOptionsAttributes extends MessageWithAttributes {
    options: string[];
}

const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

export const MessageBubble = ({
    message,
    isLast,
    isLastOfUserGroup,
    focusable,
    updateFocus
}: {
    message: Message;
    isLast: boolean;
    isLastOfUserGroup: boolean;
    focusable: boolean;
    updateFocus: (newFocus: number) => void;
}) => {
    const [read, setRead] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const { conversation, conversationsClient, participants, users, fileAttachmentConfig } = useSelector(
        (state: AppState) => ({
            conversation: state.chat.conversation,
            conversationsClient: state.chat.conversationsClient,
            participants: state.chat.participants,
            users: state.chat.users,
            fileAttachmentConfig: state.config.fileAttachment
        })
    );
    const messageRef = useRef<HTMLDivElement>(null);

    const belongsToCurrentUser = message.author === conversationsClient?.user.identity;

    useEffect(() => {
        if (isLast && participants && belongsToCurrentUser) {
            const getOtherParticipants = participants.filter((p) => p.identity !== conversationsClient?.user.identity);
            setRead(
                Boolean(getOtherParticipants.length) &&
                    getOtherParticipants.every((p) => p.lastReadMessageIndex === message.index)
            );
        } else {
            setRead(false);
        }
    }, [participants, isLast, belongsToCurrentUser, conversationsClient, message]);

    useEffect(() => {
        if (focusable) {
            messageRef.current?.focus();
        }
    }, [focusable]);

    const renderMedia = () => {
        if (fileAttachmentConfig?.enabled) {
            if (!message.attachedMedia) {
                return null;
            }

            return message.attachedMedia.map((media: Media, index: Key) => {
                const file = {
                    name: media.filename,
                    type: media.contentType,
                    size: media.size
                } as File;
                return <FilePreview key={index} file={file} isBubble={true} media={media} focusable={focusable} />;
            });
        }

        return <i>Media messages are not supported</i>;
    };

    const renderSelectableOptions = () => {
        const attributes = message.attributes as SelectableOptionsAttributes;
        if (!attributes?.options) {
            return null;
        }

        return attributes?.options.map((option: string, index: Key) => {
            return (
                <Box key={index}>
                    <p />
                    <Box key={index} marginLeft="space100" height="70" {...optionStyles}>
                        <Button
                            key={index}
                            data-test="message-send-button"
                            variant="primary_icon"
                            size="icon_small"
                            onClick={async () => {
                                let preparedMessage = conversation?.prepareMessage();
                                preparedMessage = preparedMessage?.setBody(option);
                                await preparedMessage?.build().send();
                            }}
                        >
                            {option}
                        </Button>
                    </Box>
                </Box>
            );
        });
    };

    const renderProductCard = () => {
        const attributes = message.attributes as ProductCardAttributes;

        return (
            <Box
                alignContent="center"
                onClick={() => {
                    window.location.href = attributes?.productUrl;
                }}
            >
                {/* <Anchor href={attributes?.productUrl}> */}
                <img src={attributes?.imageUrl} alt="" width={164} height={164} />
                <Text as="p" {...productNameStyles}>
                    {attributes?.name}
                </Text>
                <Text as="p" {...productPriceStyles}>
                    {attributes?.price}
                </Text>
                {/* </Anchor> */}
            </Box>
        );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const newFocusValue = message.index + (e.key === "ArrowUp" ? -1 : 1);
            updateFocus(newFocusValue);
        }
    };

    const handleMouseDown = () => {
        setIsMouseDown(true);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleFocus = () => {
        // Ignore focus from clicks
        if (!isMouseDown) {
            // Necessary since screen readers can set the focus to any focusable element
            updateFocus(message.index);
        }
    };

    const author = users?.find((u) => u.identity === message.author)?.friendlyName || message.author;

    const mAttributes = message.attributes as MessageWithAttributes;
    return (
        <Box
            {...outerContainerStyles}
            tabIndex={focusable ? 0 : -1}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            ref={messageRef}
            data-message-bubble
            data-testid="message-bubble"
        >
            <Box {...bubbleAndAvatarContainerStyles}>
                {!belongsToCurrentUser && (
                    <Box {...getAvatarContainerStyles(!isLastOfUserGroup)} data-testid="avatar-container">
                        {isLastOfUserGroup && <UserIcon decorative={true} size="sizeIcon40" />}
                    </Box>
                )}
                <Box {...getInnerContainerStyles(belongsToCurrentUser)}>
                    <Flex hAlignContent="between" width="100%" vAlignContent="center" marginBottom="space20">
                        <Text {...authorStyles} as="p" aria-hidden style={{ textOverflow: "ellipsis" }} title={author}>
                            {author}
                        </Text>
                        <ScreenReaderOnly as="p">
                            {belongsToCurrentUser
                                ? "You sent at"
                                : `${users?.find((u) => u.identity === message.author)?.friendlyName} sent at`}
                        </ScreenReaderOnly>
                        <Text {...timeStampStyles} as="p">
                            {`${doubleDigit(message.dateCreated.getHours())}:${doubleDigit(
                                message.dateCreated.getMinutes()
                            )}`}
                        </Text>
                    </Flex>
                    <Text as="p" {...bodyStyles}>
                        {message.body ? parseMessageBody(message.body, belongsToCurrentUser) : null}
                    </Text>
                    {mAttributes.type === "productCard" ? renderProductCard() : null}
                    {message.type === "media" ? renderMedia() : null}
                </Box>
            </Box>
            {mAttributes.type === "selectable" ? renderSelectableOptions() : null}
            {read && (
                <Flex hAlignContent="right" vAlignContent="center" marginTop="space20">
                    <Text as="p" {...readStatusStyles}>
                        Read
                    </Text>
                    <SuccessIcon decorative={true} size="sizeIcon10" color="colorTextWeak" />
                </Flex>
            )}
        </Box>
    );
};
