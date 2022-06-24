/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../../FormField/FormField';
import Select from '../../Select/Select';
import {
    QUANTITY_UNIT_TYPE_CUSTOM,
    QUANTITY_UNIT_TYPE_NOT_SELECTED,
    quantityUnitTypes,
} from '../../../helpers/QuestionHelper';
import { removeItemExtension, setItemExtension } from '../../../helpers/extensionHelper';
import { IExtentionType } from '../../../types/IQuestionnareItemType';
import { Coding, Extension, QuestionnaireItem } from '../../../types/fhir';
import UriField from '../../FormField/UriField';
import { createUriUUID } from '../../../helpers/uriHelper';
import { TreeContext } from '../../../store/treeStore/treeStore';
import InputField from '../../InputField/inputField';
import AsyncSelect from 'react-select/async';
import { searchForUcumUnit } from '../../../helpers/ucum';

type UnitTypeSelectorProps = {
    item: QuestionnaireItem;
};

const UnitTypeSelector = (props: UnitTypeSelectorProps): JSX.Element => {
    const { t } = useTranslation();
    const { dispatch } = useContext(TreeContext);

    const updateQuantityUnitType = (event: ChangeEvent<HTMLSelectElement>): void => {
        const {
            target: { value: quantityUnitTypeCode },
        } = event;
        if (quantityUnitTypeCode === QUANTITY_UNIT_TYPE_NOT_SELECTED) {
            removeItemExtension(props.item, IExtentionType.questionnaireUnit, dispatch);
        } else {
            const coding =
                quantityUnitTypeCode === QUANTITY_UNIT_TYPE_CUSTOM
                    ? { code: '', display: '', system: createUriUUID() }
                    : quantityUnitTypes.find(({ code: predefinedCode }) => predefinedCode === quantityUnitTypeCode);
            const unitExtension: Extension = {
                url: IExtentionType.questionnaireUnit,
                valueCoding: coding,
            };
            setItemExtension(props.item, unitExtension, dispatch);
        }
    };

    const getCurrentQuantityUnitTypeCoding = () => {
        return props.item.extension?.find((extension) => {
            return extension.url === IExtentionType.questionnaireUnit;
        })?.valueCoding;
    };

    const updateCustomQuantityUnitType = (
        property: 'code' | 'display' | 'system',
        event: React.FocusEvent<HTMLInputElement>,
    ) => {
        const currentValueCoding = getCurrentQuantityUnitTypeCoding();
        let newValueCoding: Coding;
        if (currentValueCoding) {
            newValueCoding = { ...currentValueCoding, [property]: event.target.value };
        } else {
            newValueCoding = { [property]: event.target.value };
        }
        const unitExtension: Extension = {
            url: IExtentionType.questionnaireUnit,
            valueCoding: newValueCoding,
        };
        setItemExtension(props.item, unitExtension, dispatch);
    };

    const getQuantityUnitType = (): string => {
        const quantityUnitTypeCoding = getCurrentQuantityUnitTypeCoding();

        if (!quantityUnitTypeCoding) {
            return QUANTITY_UNIT_TYPE_NOT_SELECTED;
        }

        const {
            code: currentCode = '',
            display: currentDisplay = '',
            system: currentSystem = '',
        } = quantityUnitTypeCoding;

        const isPredefined = quantityUnitTypes.some(
            (type) =>
                type.code !== QUANTITY_UNIT_TYPE_CUSTOM &&
                type.code === currentCode &&
                type.display === currentDisplay &&
                type.system === currentSystem,
        );

        if (isPredefined) {
            return currentCode;
        }

        return QUANTITY_UNIT_TYPE_CUSTOM;
    };

    const selectedUnitType = getQuantityUnitType();
    const isCustom = selectedUnitType === QUANTITY_UNIT_TYPE_CUSTOM;
    const currentCoding = getCurrentQuantityUnitTypeCoding();
    const { code, display, system } = currentCoding ? currentCoding : { code: '', display: '', system: '' };

    return (
        <FormField label={t('Select unit')}>
            <AsyncSelect<Coding>
                loadOptions={searchForUcumUnit}
                value={currentCoding}
                noOptionsMessage={input =>
                    input.inputValue !== "" ? `No unit found for "${input.inputValue}"`
                        : `Please enter a unit`}
                isClearable={true}
                onChange={newUnit => setItemExtension(
                    props.item,
                    {
                        url: IExtentionType.questionnaireUnit,
                        valueCoding: newUnit === null ? undefined : newUnit,
                    },
                    dispatch
                )}
                formatOptionLabel={unit => {
                    return (
                        <div>
                            <b>{unit.display ?? "Unknown Unit Name"}</b>
                            <br />
                            {unit.code} <i>{unit.system}</i>
                        </div>
                    )
                }}
                getOptionValue={option => option.code ?? "undefined"}
                isOptionSelected={option => option.code === currentCoding?.code}
            />
        </FormField>
    );
};

export default UnitTypeSelector;
