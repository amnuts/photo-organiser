import React, { useState, useEffect } from 'react';

import DirectoriesPanel from './DirectoriesPanel.jsx';
import FiltersPanel from './FiltersPanel.jsx';
import NamingPanel from './NamingPanel.jsx';
import OrganisePanel from './OrganisePanel.jsx';
import ProcessingPanel from './ProcessingPanel.jsx';
import StepIndicator from "./StepIndicator.jsx";

import {
    BackendSetMinSize,
    BackendSetMinWidth,
    BackendSetMinHeight,
    BackendSetNamingConvention,
    BackendSetMoveOrCopy,
    BackendSetVerifyResults,
    ProcessImages,
    VerifyRelocation,
    ResetEverything
} from "../wailsjs/go/main/App.js";

import { useEventSubscription, useEventSubscriptionOnce} from "./CustomEventHooks.jsx";

function App() {
    const [currentPanel, setCurrentPanel] = useState(1);
    const [startDirectories, setStartDirectories] = useState('');
    const [destinationDirectory, setDestinationDirectory] = useState('');
    const [minSize, setMinSize] = useState('');
    const [minWidth, setMinWidth] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [namingConvention, setNamingConvention] = useState('');
    const [moveOrCopy, setMoveOrCopy] = useState('copy');
    const [verifyResults, setVerifyResults] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);

    const [foundFiles, setFoundFiles] = useState([])
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessingComplete, setIsProcessingComplete] = useState(false)
    const [isRelocating, setIsRelocating] = useState(false)
    const [totalFiles, setTotalFiles] = useState(0);
    const [totalFilesRelocated, setTotalFilesRelocated] = useState(0);
    const [isRelocationComplete, setIsRelocationComplete] = useState(false);

    const handleEventFinding = (data) => {
        setFoundFiles(Object.values(data));
    };

    const handeEventFindingComplete = () => {
        setIsProcessing(false);
        setIsProcessingComplete(true);
        if (foundFiles.length > 0) {
            canProceed(true);
        }
    }

    const handleEventRelocatingStart = (data) => {
        setIsRelocating(true);
    };

    const handleEventRelocating = (data) => {
        setTotalFiles(data.totalFiles);
        setTotalFilesRelocated(data.totalRelocated);
        setFoundFiles(Object.values(data.files));
    };

    const handleEventRelocatingComplete = (data) => {
        setIsRelocationComplete(true);
    };

    useEventSubscription('finding-files', handleEventFinding);
    useEventSubscriptionOnce('finding-complete', handeEventFindingComplete);
    useEventSubscriptionOnce('relocating-start', handleEventRelocatingStart);
    useEventSubscription('relocating-files', handleEventRelocating);
    useEventSubscriptionOnce('relocating-complete', handleEventRelocatingComplete);

    useEffect(() => {
        if (currentPanel < 5) {
            setIsProcessing(false);
            setIsProcessingComplete(false);
            setFoundFiles([]);
        }
        if (currentPanel === 5 && !isProcessing && !isProcessingComplete) {
            setIsProcessing(true);
            canProceed(false);
            ProcessImages()
        }

    }, [currentPanel]);

    const handlePreviousStep = () => {
        if (currentPanel > 1) {
            setCurrentPanel(currentPanel - 1);
        }
    };

    const handleNextStep = () => {
        if (currentPanel < 5) {
            setCurrentPanel(currentPanel + 1);
        }
    };

    const handleVerify = () => {
        VerifyRelocation();
    }

    const canProceed = (canProceed) => {
        setNextDisabled(!canProceed);
    }

    const updateDirectoriesData = ({ startDirectories, destinationDirectory }) => {
        setStartDirectories(startDirectories);
        setDestinationDirectory(destinationDirectory);
    };

    const updateFiltersData = ({ minSize, minWidth, minHeight }) => {
        setMinSize(minSize);
        setMinWidth(minWidth);
        setMinHeight(minHeight);
        BackendSetMinSize(parseInt(minSize) || null);
        BackendSetMinWidth(parseInt(minWidth) || null);
        BackendSetMinHeight(parseInt(minHeight) || null);
    };

    const updateNamingData = ({ namingConvention }) => {
        setNamingConvention(namingConvention);
        BackendSetNamingConvention(namingConvention);
    };

    const updateOrganiseData = ({ moveOrCopy, verifyResults }) => {
        setMoveOrCopy(moveOrCopy);
        setVerifyResults(verifyResults);
        BackendSetMoveOrCopy(moveOrCopy);
        BackendSetVerifyResults(verifyResults);
    };

    const reset = () => {
        ResetEverything();
        setCurrentPanel(1);
        setStartDirectories('');
        setDestinationDirectory('');
        setMinSize('');
        setMinWidth('');
        setMinHeight('');
        setNamingConvention('');
        setMoveOrCopy('copy');
        setVerifyResults(true);
        setNextDisabled(true);
        setFoundFiles([]);
        setIsProcessing(false);
        setIsProcessingComplete(false);
        setIsRelocating(false);
        setTotalFiles(0);
        setTotalFilesRelocated(0);
        setIsRelocationComplete(false);
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-slate-700 text-white py-4 px-6">
                <StepIndicator step={currentPanel} />
            </header>
            <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
                {currentPanel === 1 && <DirectoriesPanel {...{updateData: updateDirectoriesData, canProceed, startDirectories, destinationDirectory}} />}
                {currentPanel === 2 && <FiltersPanel {...{updateData: updateFiltersData, canProceed, minSize, minWidth, minHeight}} />}
                {currentPanel === 3 && <NamingPanel {...{updateData: updateNamingData, canProceed, namingConvention, destinationDirectory}} />}
                {currentPanel === 4 && <OrganisePanel {...{updateData: updateOrganiseData, canProceed, moveOrCopy, verifyResults}} />}
                {currentPanel === 5 && <ProcessingPanel {...{reset, moveOrCopy, verifyResults, isProcessingComplete, foundFiles, isRelocating, isRelocationComplete,totalFiles, totalFilesRelocated, destinationDirectory }} />}
            </main>
            <footer className="bg-slate-700 text-white py-4 px-6 flex justify-between">
                {currentPanel > 1 && <button onClick={handlePreviousStep} className="bg-blue-400 hover:bg-blue-700 hover:text-white text-slate-800 py-2 px-4 rounded mr-auto">Previous</button>}
                {currentPanel < 5 && <button onClick={handleNextStep} className={`text-slate-800 py-2 px-4 rounded ml-auto ${nextDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-green-400 hover:bg-green-700 hover:text-white'}`} disabled={nextDisabled}>{currentPanel < 4 ? 'Next' : 'Organise'}</button>}
                {currentPanel === 5 && verifyResults && <button onClick={handleVerify} className={`text-slate-800 py-2 px-4 rounded ml-auto ${nextDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-green-400 hover:bg-green-700 hover:text-white'}`} disabled={nextDisabled}>Verify</button>}
            </footer>
        </div>
    );
}

export default App;
