import "@testing-library/jest-dom";

import { validateFiles } from "./validateFiles";
import { matchPartialNotificationObject } from "../test-utils";
import { notifications } from "../notifications";
import * as genericActions from "../store/actions/genericActions";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};
const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
const alreadyAttachedFile = { name: "filenameAttached.jpg", type: "image/png", size: 1, lastModified: 1 } as File;
const mockDispatch = jest.fn();

describe("validateFiles", () => {
    it("does not validate a file that is already attached", () => {
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        const validFiles = validateFiles(
            [alreadyAttachedFile],
            mockDispatch,
            [alreadyAttachedFile],
            fileAttachmentConfig
        );

        expect(validFiles).toHaveLength(0);
        expect(addNotificationSpy).toHaveBeenCalledWith(
            matchPartialNotificationObject(
                notifications.fileAttachmentAlreadyAttachedNotification({ fileName: alreadyAttachedFile.name })
            )
        );
    });
});
