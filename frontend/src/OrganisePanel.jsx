import React, { useState, useEffect } from 'react';
import './OrganisePanel.css';

export const OrganisePanelMeta = {
    title: 'Organise',
    description: 'Start the move or copy',
};

export default function OrganisePanel({ updateData, canProceed, moveOrCopy, verifyResults })
{
    const [willVerifyResults, setWillVerifyResults] = useState(!!verifyResults);
    const [willMoveOrCopy, setWillMoveOrCopy] = useState(moveOrCopy || "copy");

    useEffect(() => {
        updateData({ moveOrCopy: willMoveOrCopy, verifyResults: willVerifyResults });
        canProceed(true);
    })

    const handleMoveOrCopyChange = (event) => {
        setWillMoveOrCopy(event.target.value);
    };

    const handleVerifyResultsChange = (event) => {
        setWillVerifyResults(!willVerifyResults);
    };

    return (
        <>
            <div className="border bg-white p-4 rounded-lg border-slate-300">
                <h2 className="font-bold text-gray-400">Copy or move the files?</h2>
                <p className="text-sm text-gray-400 mb-3">Select how you want to perform the organisation, and whether you want to validate the process first.</p>

                <div className="flex items-center align-middle mt-8 mb-2">
                    <input type="radio" id="copy" name="transfer" value="copy" className="opacity-0 absolute h-8 w-8" checked={willMoveOrCopy === "copy"} onChange={handleMoveOrCopyChange}/>
                    <div className="bg-white border-2 rounded-full border-gray-500 w-8 h-8 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-orange-700">
                        <svg className="fill-current hidden w-3 h-3 text-orange-700 pointer-events-none" version="1.1" viewBox="0 0 17 12" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                                <g transform="translate(-9 -11)" fill="rgb(194, 65, 12)" fillRule="nonzero">
                                    <path d="m25.576 11.414c0.56558 0.55188 0.56558 1.4439 0 1.9961l-9.404 9.176c-0.28213 0.27529-0.65247 0.41385-1.0228 0.41385-0.37034 0-0.74068-0.13855-1.0228-0.41385l-4.7019-4.588c-0.56584-0.55188-0.56584-1.4442 0-1.9961 0.56558-0.55214 1.4798-0.55214 2.0456 0l3.679 3.5899 8.3812-8.1779c0.56558-0.55214 1.4798-0.55214 2.0456 0z"/>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <label htmlFor="copy" className="select-none leading-tight">
                        <p className="font-bold text-gray-400">Copy the files</p>
                        <p className="text-gray-500 text-xs">Organise by copying your files from the original locations and duplicating them in the destination location, so they will be in both folders.</p>
                    </label>
                </div>

                <div className="flex items-center align-middle mt-4 mb-2">
                    <input type="radio" id="move" name="transfer" value="move" className="opacity-0 absolute h-8 w-8" checked={willMoveOrCopy === "move"} onChange={handleMoveOrCopyChange}/>
                    <div className="bg-white border-2 rounded-full border-gray-500 w-8 h-8 flex flex-shrink-0 justify-center items-center mr-2 focus-within:text-orange-700">
                        <svg className="fill-current hidden w-3 h-3 text-orange-700 pointer-events-none" version="1.1" viewBox="0 0 17 12" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                                <g transform="translate(-9 -11)" fill="rgb(194, 65, 12)" fillRule="nonzero">
                                    <path d="m25.576 11.414c0.56558 0.55188 0.56558 1.4439 0 1.9961l-9.404 9.176c-0.28213 0.27529-0.65247 0.41385-1.0228 0.41385-0.37034 0-0.74068-0.13855-1.0228-0.41385l-4.7019-4.588c-0.56584-0.55188-0.56584-1.4442 0-1.9961 0.56558-0.55214 1.4798-0.55214 2.0456 0l3.679 3.5899 8.3812-8.1779c0.56558-0.55214 1.4798-0.55214 2.0456 0z"/>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <label htmlFor="move" className="select-none leading-tight">
                        <p className="font-bold text-gray-400">Move the files</p>
                        <p className="text-gray-500 text-xs">Organise by moving your files from the original locations into the destination location, so they will only be in the destination folder.</p>
                    </label>
                </div>

                <div className="flex items-center align-middle mt-12 mb-2">
                    <input type="checkbox" id="validate" name="validate" value="1" className="opacity-0 absolute h-8 w-8" checked={willVerifyResults} onChange={handleVerifyResultsChange}/>
                    <div className="bg-white border-2 rounded-md border-gray-500 w-8 h-8 flex flex-shrink-0 justify-center items-center mr-2 focus-within:text-orange-700">
                        <svg className="fill-current hidden w-3 h-3 text-orange-700 pointer-events-none" version="1.1" viewBox="0 0 17 12" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                                <g transform="translate(-9 -11)" fill="rgb(194, 65, 12)" fillRule="nonzero">
                                    <path d="m25.576 11.414c0.56558 0.55188 0.56558 1.4439 0 1.9961l-9.404 9.176c-0.28213 0.27529-0.65247 0.41385-1.0228 0.41385-0.37034 0-0.74068-0.13855-1.0228-0.41385l-4.7019-4.588c-0.56584-0.55188-0.56584-1.4442 0-1.9961 0.56558-0.55214 1.4798-0.55214 2.0456 0l3.679 3.5899 8.3812-8.1779c0.56558-0.55214 1.4798-0.55214 2.0456 0z"/>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <label htmlFor="validate" className="select-none leading-tight">
                        <p className="font-bold text-gray-400">Validate what will happen</p>
                        <p className="text-gray-500 text-xs">Do you want to see a log of what will be done before it happens so you can validate and then approve?</p>
                    </label>
                </div>
            </div>
        </>
    )
}
