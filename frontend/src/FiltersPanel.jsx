import React, { useState, useEffect } from 'react';

export const FiltersPanelMeta = {
    title: 'Filters',
    description: 'What gets included',
};

export default function FiltersPanel({updateData, canProceed, minSize, minWidth, minHeight })
{
    const [minSizeState, setMinSize] = useState(minSize);
    const [minWidthState, setMinWidth] = useState(minWidth);
    const [minHeightState, setMinHeight] = useState(minHeight);

    useEffect(() => {
        updateData({
            minSize: minSizeState,
            minWidth: minWidthState,
            minHeight: minHeightState
        });
        canProceed(true);
    })

    const handleMinSizeChange = (event) => {
        setMinSize(event.target.value);
    };

    const handleMinWidthChange = (event) => {
        setMinWidth(event.target.value);
    };

    const handleMinHeightChange = (event) => {
        setMinHeight(event.target.value);
    };

    const showHintText = (text) => (
        <span className="block text-right text-xs text-gray-400">
            {text}
        </span>
    );

    const showFileSize = (size, dm = 2) => {
        const k = 1024,
            sizes = [`${size <= 1 ? "byte" : "bytes"}`, 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(size) / Math.log(k));
        return showHintText(
            !size || parseFloat(size) === 0 || typeof size === "undefined"
                ? "no minimal file size"
                : `file size must be greater or equal to ${parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]}`
        )
    }

    const showPixelSize = (size, type) => {
        return showHintText(
            !size || parseFloat(size) === 0 || typeof size === "undefined"
                ? "no minimal size"
                : `image must be greater or equal to ${parseInt(size)}px in ${type}`
        )
    }

    return (
        <>
            <div className="mb-6 border bg-white p-4 rounded-lg border-slate-300">
                <h2 className="font-bold text-gray-400">Optional filtering</h2>
                <p className="text-sm text-gray-400 mb-3">All of the <b>.JPG</b> files in your selected start directories will be considered for organising, but you can also add some additional filtering so that only jpg files with these conditions will be processed.  If you don't want to use these additional filters, select the <b>Next</b> button.</p>
                <p className="text-sm text-gray-400 mb-3 italic">Note that these filters are cumulative and may add considerable time to the processing of the images.</p>

                <div className="flex flex-1 mt-6">
                    <div className="flex-1 border-r border-gray-300 pr-6">
                        <label htmlFor="minSize">Minimum File Size:</label>
                        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-orange-700" id="minSize" type="number" min="0" max="524288000" value={minSizeState} onChange={handleMinSizeChange} />
                        {showFileSize(minSizeState)}
                    </div>
                    <div className="flex-1 pl-6 mr-6">
                        <div>
                            <label htmlFor="minWidth">Minimum Image Width:</label>
                            <input id="minWidth" type="number" className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-orange-700" min="0" value={minWidthState} onChange={handleMinWidthChange} />
                            {showPixelSize(minWidthState, 'width')}
                        </div>
                        <div className="mt-6">
                            <label htmlFor="minHeight">Minimum Image Height:</label>
                            <input id="minHeight" type="number" className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-orange-700" min="0" value={minHeightState} onChange={handleMinHeightChange} />
                            {showPixelSize(minHeightState, 'height')}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
