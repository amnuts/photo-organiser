import React, { useMemo } from 'react';
import { DirectoriesPanelMeta } from './DirectoriesPanel.jsx';
import { FiltersPanelMeta } from './FiltersPanel.jsx';
import { NamingPanelMeta } from './NamingPanel.jsx';
import { OrganisePanelMeta } from './OrganisePanel.jsx';

function StepIndicator(props) {
    const steps = [
        DirectoriesPanelMeta,
        FiltersPanelMeta,
        NamingPanelMeta,
        OrganisePanelMeta,
    ];

    const checkmark = (
        <svg aria-hidden="true" className="w-5 h-5 absolute top-1 right-1 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
        </svg>
    )

    const useColour = (onStep) => {
        if (onStep === props.step) {
            return 'bg-sky-400 text-slate-900';
        }
        if (props.step > onStep) {
            return 'bg-green-400 text-green-900';
        }
        return 'bg-white';
    };


    return (
        <ol className="grid divide-x divide-gray-100 overflow-hidden rounded-lg border border-slate-600 text-sm text-gray-500 grid-cols-4">
            {
                steps.map((step, index) => {
                    ++index;
                    return (
                        <li key={index}
                            className={`relative flex items-center justify-center gap-2 p-4 ${useColour(index)}`}>
                            {props.step > index && checkmark}
                            <p className="leading-none">
                                <strong className="block font-medium"> {step.title} </strong>
                                <span className="block"> {step.description} </span>
                            </p>
                        </li>
                    )
                })
            }
        </ol>
    );
}

export default StepIndicator;