import React, {useState, useEffect} from 'react';
import {GetExamplePathSubstitution} from "../wailsjs/go/main/App.js";
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

export const NamingPanelMeta = {
    title: 'Naming',
    description: 'How to organise files',
};

const ShowExampleFilename = ({exampleFiles, namingConvention}) => {
    const [results, setResults] = useState([])

    useEffect(() => {
        const mapResults = async (exampleFile, index) => GetExamplePathSubstitution(namingConvention, exampleFile.data, exampleFile.description);
        const getResults = Promise.allSettled(exampleFiles.map(mapResults))
        getResults.then(res => {
            let paths = []
            res.forEach((r) => {
                if (r.status === "fulfilled") {
                    paths.push(r.value)
                }
            })
            setResults(paths)
        })
    }, [exampleFiles, namingConvention])

    return (
        <>
            {
                results.map((r, i, arr) => (
                    <span key={i} className="block text-xs text-gray-400 mt-1 leading-tight text-right">
                        {r.description}: <code className="bg-gray-100 text-gray-500 rounded px-1 py-0.5">{r.path}</code>
                    </span>
                ))
            }
        </>
    )
};

export default function NamingPanel({updateData, canProceed, namingConvention, destinationDirectory})
{
    const [namingConventionState, setNamingConvention] = useState(namingConvention);

    if (destinationDirectory.slice(-1) !== "/") {
        destinationDirectory += "/";
    }

    const placeholders = {
        year: 'The year (YYYY) the photo was taken if available in the EXIF data, otherwise the year the file was created',
        year_taken: 'The year (YYYY) the photo was taken if available in the EXIF data, ignored otherwise',
        year_created: 'The year (YYYY) the file was created',
        month: 'The month (MM) the photo was taken if available in the EXIF data, otherwise the month the file was created',
        month_taken: 'The month (MM) the photo was taken if available in the EXIF data, ignored otherwise',
        month_created: 'The month (MM) the file was created',
        date: 'The date (DD) the photo was taken if available in the EXIF data, otherwise the day the file was created',
        date_taken: 'The date (DD) the photo was taken if available in the EXIF data, ignored otherwise',
        date_created: 'The date (DD) the file was created',
        parent: 'The name of the parent folder the file is in, ignore if it\'s the same as the start folder',
        parent_if_not_date: 'The name of the parent folder the file is in, so long as it\'s not in a date format, ignored otherwise',
        location_hash: 'A hash of the lon/lat coordinates where the photo was taken, if available in the EXIF data, ignored otherwise',
        location_country: 'Calculated country based on lon/lat, ignored if cannot determine',
        location_division: 'Calculated state/county/province based on lon/lat, ignored if cannot determine',
        location_city: 'Calculated city based on lon/lat, ignored if cannot determine',
        location_place: 'Calculated place based on lon/lat, ignored if cannot determine',
    };

    const exampleFiles = [
        {
            description: "With location data, date taken different to created date",
            data: {
                filepath: `${destinationDirectory}Scottish Highlands/IMG_1234.jpg`,
                year: "2023",
                year_taken: "2023",
                year_created: "2023",
                month: "04",
                month_taken: "04",
                month_created: "05",
                date: "19",
                date_taken: "19",
                date_created: "15",
                parent: "Scottish Highlands",
                parent_if_not_date: "Scottish Highlands",
                location: {
                    hash: "gfhptc9m",
                    country: "GB",
                    division: "Scotland",
                    city: "Highlands",
                    place: "Beinn Eighe National Nature Reserve"
                }
            }
        },
        {
            description: "No data from exif, parent folder is a date format",
            data: {
                filepath: `${destinationDirectory}2011/07/23/IMG_1234.jpg`,
                year: "2011",
                year_created: "2011",
                month: "07",
                month_created: "07",
                date: "23",
                date_created: "23",
                parent: "23"
            }
        },
        {
            description: "Minimal location data, parent folder is a date format, date taken different to created date",
            data: {
                filepath: `${destinationDirectory}DCIM/Camera/2022-09-22/IMG_1234.jpg`,
                year: "2022",
                year_taken: "2022",
                year_created: "2022",
                month: "09",
                month_taken: "09",
                month_created: "09",
                date: "22",
                date_taken: "22",
                date_created: "23",
                parent: "2022-09-22",
                location: {
                    hash: "9q9hvumk",
                    country: "US",
                }
            }
        }
    ];

    useEffect(() => {
        updateData({ namingConvention: namingConventionState });
        canProceed(true);
    })

    const handleNamingConventionChange = (event) => {
        setNamingConvention(
            event.hasOwnProperty('target')
                ? event.target.value
                : event
        );
    };

    return (
        <>
            <div className="border bg-white p-4 rounded-lg border-slate-300">
                <h2 className="font-bold text-gray-400">How to name your newly organised photos</h2>
                <p className="text-sm text-gray-400 mb-3">Starting from your selected base directory, use a combination of placeholders and your own text, along with <code className="bg-gray-100 text-gray-500 rounded px-1 py-0.5">/</code> for directory separators, to build up how you want your photos to be organised.</p>

                <div className="mt-6">
                    <label htmlFor="minSize">Naming pattern, starting from <code className="bg-gray-100 text-gray-500 rounded px-1 py-0.5">{destinationDirectory}</code></label>
                    <TextInput id="namingConvention" value={namingConventionState} Component="input" trigger={["{"]} options={[...Object.keys(placeholders)]} spacer={'}'} onChange={handleNamingConventionChange} className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-orange-700 mt-1" />
                    <ShowExampleFilename exampleFiles={exampleFiles} namingConvention={namingConventionState} />
                </div>
            </div>

            <div className="border bg-white p-4 rounded-lg border-slate-300 mt-6">
                <h2 className="font-bold text-gray-400">Placeholders</h2>
                <p className="text-sm text-gray-400 mb-3">Use these placeholders to build up the naming convention to be used for your image paths.</p>

                <div className="flex flex-1 mt-6">
                    <ul className="columns-2">
                        {Object.entries(placeholders).map(([placeholder, hintText], index) => (
                            <li key={placeholder} className="leading-tight mb-3">
                                <code className="bg-gray-100 text-gray-500 rounded px-1 py-0.5 text-xs font-bold mr-1">{`{${placeholder}}`}</code>
                                <span className="text-xs text-gray-400">{hintText}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
