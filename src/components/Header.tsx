import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { useDispatch, useSelector } from "react-redux";

import { containerStyles, titleStyles, closeStyles } from "./styles/Header.styles";
import { AppState, EngagementPhase } from "../store/definitions";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { sessionDataHandler } from "../sessionDataHandler";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    const currentPhase = useSelector((state: AppState) => state.session.currentPhase);
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);
    const conversationSid = useSelector((state: AppState) => state.session.conversationSid);

    const handleClose = () => {
        if (currentPhase === EngagementPhase.MessagingCanvas) {
            if (conversationSid) {
                sessionDataHandler.endSession(conversationSid);
            }
        } else {
            dispatch(changeExpandedStatus({ expanded: !expanded }));
        }
    };

    return (
        <Box as="header" {...containerStyles}>
            <Text as="h2" {...titleStyles}>
                {customTitle || "Owl Bank"}
            </Text>
            <Box
                as="button"
                data-test="close-button"
                onClick={() => {
                    handleClose();
                }}
                {...closeStyles}
            >
                <CloseIcon
                    onClick={handleClose}
                    decorative={true}
                    title="Close chat"
                    {...{ color: "colorTextWeakest" }}
                    size="sizeIcon50"
                />
            </Box>
        </Box>
    );
};
