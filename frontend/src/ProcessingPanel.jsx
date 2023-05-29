import React, {useEffect, useState } from 'react';
import { OpenHostLocation } from "../wailsjs/go/main/App.js";
import Modal from "./Modal.jsx";


function ShowProcessingHeader({foundCount, isProcessingComplete, isRelocating, verifyResults, moveOrCopy, movedOrCopied }) {
    const [showCount, setShowCount] = useState("");
    const [showText, setShowText] = useState("Finding files");
    const [showSubText, setShowSubText] = useState("");

    useEffect(() => {
        if (isProcessingComplete) {
            if (!foundCount) {
                setShowText("No images were found");
                setShowSubText("Please check the directories and filters and try again");
            } else {
                setShowCount(foundCount);
                if (verifyResults) {
                    setShowText(`Please verify the files are OK to be ${movedOrCopied}`);
                } else {
                    setShowText(`The following files were ${movedOrCopied}`);
                }
            }
        }
        if (!isProcessingComplete) {
            setShowText(`Finding files to ${moveOrCopy}`);
            if (foundCount > 0) {
                setShowCount(foundCount);
            }
        }
        if (isRelocating) {
            setShowText(`Files are being ${movedOrCopied}`);
        }
    });

    return (
        <div className="flex flex-row items-center">
            <p className="text-2xl font-bold text-gray-800 flex-1">{showText}</p>
            {showSubText && <p className="text-sm text-gray-600">{showSubText}</p>}
            <span className="text-lg text-gray-600 flex-0">{showCount}</span>
        </div>
    );
}

function ProcessingPanel({reset, moveOrCopy, verifyResults, isProcessingComplete, foundFiles, isRelocating, isRelocationComplete, totalFiles, totalFilesRelocated, destinationDirectory }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const movedOrCopied = moveOrCopy === "copy" ? "copied" : "moved";

    useEffect(() => {
        setIsModalOpen(isRelocationComplete);
    }, [isRelocationComplete]);

    const handleModalConfirm = () => {
        setIsModalOpen(false);
        reset();
    };

    const openHostFile = (event) => {
        const fileInput = event.target.innerText;
        OpenHostLocation(fileInput);
    };

    const openHostDirectory = (event) => {
        const directoryInput = event.target.innerText;
        OpenHostLocation(directoryInput);
    }

    const toPathWithSuffix = (toPath, suffix) => {
        if (!suffix) {
            return toPath;
        }
        const fileExtensionIndex = toPath.lastIndexOf('.');
        const filePath = toPath.slice(0, fileExtensionIndex);
        const fileExtension = toPath.slice(fileExtensionIndex);
        return `${filePath}-${suffix}${fileExtension}`;
    }

    const relocatedStatus = (relocated) => {
        let bgColour = "bg-gray-200";
        let textColour = "text-gray-800";
        let iconPath = "M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75";
        if (relocated) {
            bgColour = "bg-green-200";
            textColour = "text-green-800";
            iconPath = "M4.5 12.75l6 6 9-13.5";
        }
        return (
            <>
                <span className="flex-grow"></span>
                <span className="flex-grow justify-center ml-2 mr-2">
                    <span className={`flex items-center justify-center h-4 w-4 rounded-full ${bgColour}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3 h-3 ${textColour}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                        </svg>
                    </span>
                </span>
            </>
        )
    }

    const modalMessage = (
        <div className="mb-4">
            <p>Your images have been organised! 🙂</p>
            <p className="text-blue-500 hover:underline m-4 cursor-pointer" onClick={openHostDirectory}>{destinationDirectory}</p>
            <p>In total, {totalFiles} were {movedOrCopied}</p>
        </div>
    );

    return (
        <>
            <div className="border bg-white p-4 rounded-lg border-slate-300">
                <ShowProcessingHeader {...{foundCount: foundFiles.length, isProcessingComplete, isRelocating, verifyResults, moveOrCopy, movedOrCopied }} />
                <ul className="flex flex-wrap text-xs mt-3 divide-y divide-gray-200 overflow-y-auto">
                    {foundFiles.map((file, index) => (
                        <li key={index} className={`flex items-center w-full p-2 hover:bg-slate-100 ${file.suffix && 'bg-amber-100'}`}>
                            <span className="flex-shrink-0 overflow-hidden whitespace-nowrap overflow-ellipsis hover:cursor-pointer" onClick={openHostFile}>{file.from}</span>
                            {relocatedStatus(file.relocated)}
                            <span className="flex-shrink-0 overflow-hidden whitespace-nowrap overflow-ellipsis">{toPathWithSuffix(file.to, file.suffix)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {isModalOpen && (
                <Modal
                    message={modalMessage}
                    onConfirm={handleModalConfirm}
                    buttonText={"OK"}
                />
            )}
        </>
    );
}

export default ProcessingPanel;
