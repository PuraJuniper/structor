import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncSelect from "react-select/async";
import {
    deleteItemCodeAction,
    updateItemCodePropertyAction,
    setItemCodesAction,
} from '../../../store/treeStore/treeActions';
import Btn from '../../Btn/Btn';
import { Coding } from '../../../types/fhir';
import createUUID from '../../../helpers/CreateUUID';
import { ICodingProperty } from '../../../types/IQuestionnareItemType';
import { TreeContext } from '../../../store/treeStore/treeStore';
import UriField from '../../FormField/UriField';
import { createUriUUID } from '../../../helpers/uriHelper';
import { ValidationErrors } from '../../../helpers/orphanValidation';
import FormField from '../../FormField/FormField';
import InputField from '../../InputField/inputField';
import { debouncedLoadCodes, systemUrlToOntology } from '../../../helpers/bioportal';

type CodeProps = {
    linkId: string;
    itemValidationErrors: ValidationErrors[];
};

const Codes = ({ linkId, itemValidationErrors }: CodeProps): JSX.Element => {
    const { t } = useTranslation();
    const { state, dispatch } = useContext(TreeContext);
    const [searchInput, setSearchInput] = useState("");

    const codes = state.qItems[linkId].code?.map((code) => {
        // Add id (for internal usage) if not already set
        return { ...code, id: code.id || createUUID() };
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createEmptyCode = (): Coding => {
        return { code: '', display: '', system: createUriUUID(), id: createUUID() };
    };

    const updateCode = (index: number, prop: ICodingProperty, value: string) => {
        dispatch(updateItemCodePropertyAction(linkId, index, prop, value));
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderCode = (code: Coding, index: number) => {
        const hasValidationError = itemValidationErrors.some(
            (x) => x.errorProperty.substr(0, 4) === 'code' && index === x.index,
        );
        return (
            <div key={`${code.id}`} className={`code-section ${hasValidationError ? 'validation-error' : ''}`}>
                <div className="horizontal equal">
                    <FormField label={t('Display')}>
                        <InputField
                            defaultValue={code.display}
                            onBlur={(event) => updateCode(index, ICodingProperty.display, event.target.value)}
                        />
                    </FormField>
                    <FormField label={t('Code')}>
                        <InputField
                            defaultValue={code.code}
                            onBlur={(event) => updateCode(index, ICodingProperty.code, event.target.value)}
                        />
                    </FormField>
                </div>
                <div className="horizontal full">
                    <FormField label={t('System')}>
                        <UriField
                            value={code.system}
                            onBlur={(event) => updateCode(index, ICodingProperty.system, event.target.value)}
                        />
                    </FormField>
                </div>
                <div className="center-text">
                    <Btn
                        title={`- ${t('Remove Code')}`}
                        type="button"
                        onClick={() => dispatch(deleteItemCodeAction(linkId, index))}
                        variant="secondary"
                    />
                </div>
                <hr style={{ margin: '24px 0px' }} />
            </div>
        );
    };

    return (
        <div className="codes">
            <AsyncSelect<Coding, true>
                isMulti
                inputValue={searchInput}
                onInputChange={(newInput, action): string => {
                    switch (action.action) {
                        case "set-value":
                        case "input-blur":
                            return searchInput;
                        case "input-change":
                            setSearchInput(newInput);
                            return newInput;
                        case "menu-close":
                            setSearchInput("");
                            return "";
                    }
                }}
                closeMenuOnSelect={false}
                closeMenuOnScroll={false}
                value={codes}
                loadOptions={debouncedLoadCodes}
                noOptionsMessage={input => input.inputValue !== ""
                    ? `No code found for ${input.inputValue}`
                    : `Please enter a code or the name of a code`}
                onChange={newCodes =>
                    dispatch(setItemCodesAction(
                        linkId,
                        newCodes.map(newCode => 
                            ({ code: newCode.code, system: newCode.system, display: newCode.display })
                        )
                    ))
                }
                formatOptionLabel={code => {
                    return (
                        <div>
                            <b>{code.display ?? "Unknown Code Name"}</b>
                            <br />
                            {code.code} <i>{(code.system && systemUrlToOntology[code.system]) ?? code.system}</i>
                        </div>
                    )
                }}
                getOptionValue={option => `${option.system}${option.version}${option.code}`}
                isOptionSelected={option =>
                    codes !== undefined
                    && codes.some(v =>
                        option.code === v?.code && option.system === v?.system && option.version === v?.version)}
                styles={{
                    menu: provided => ({ ...provided, zIndex: 9999 }), // https://stackoverflow.com/a/55831990
                    control: provided => ({ ...provided, minHeight: "60px" }) 
                }}
            />
        </div>
    );
};

export default Codes;
