import { BoxStyleProps } from "@twilio-paste/core/box";

export const containerStyles: BoxStyleProps = {
    border: "none",
    backgroundColor: "colorBackgroundPrimary",
    display: "flex",
    /*
     *height: "100",
     *width: "300",
     */
    margin: "space30",
    height: "100",
    width: "300",
    fontSize: "fontSize50",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "borderRadius20",
    color: "colorTextWeakest",
    cursor: "pointer",
    transition: "background-color 0.2s",
    outline: "0px",
    _hover: {
        backgroundColor: "colorBackgroundPrimaryStronger"
    },
    _focusVisible: {
        backgroundColor: "colorBackgroundPrimaryStronger",
        boxShadow: "shadowFocus"
    }
};
