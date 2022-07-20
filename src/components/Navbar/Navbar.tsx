/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useRef, useState, useEffect, useCallback } from 'react';
import { generateQuestionnaire } from '../../helpers/generateQuestionnaire';
import { Languages, TreeContext } from '../../store/treeStore/treeStore';
import Btn from '../Btn/Btn';
import MoreIcon from '../../images/icons/ellipsis-horizontal-outline.svg';
import useOutsideClick from '../../hooks/useOutsideClick';
import './Navbar.css';
import JSONView from '../JSONView/JSONView';
import PredefinedValueSetModal from '../PredefinedValueSetModal/PredefinedValueSetModal';
import ImportValueSet from '../ImportValueSet/ImportValueSet';
import { saveAction } from '../../store/treeStore/treeActions';
import { validateOrphanedElements, validateTranslations, ValidationErrors } from '../../helpers/orphanValidation';
import { ValidationErrorsModal } from '../ValidationErrorsModal/validationErrorsModal';
import { useTranslation } from 'react-i18next';
import { SAGEMessageID, StructorSendToSAGEMsg, SAGETriggerSendMsg, StructorMessageID } from '../../types/SAGE';

type Props = {
    showFormFiller: () => void;
    setValidationErrors: (errors: ValidationErrors[]) => void;
    validationErrors: ValidationErrors[];
    translationErrors: ValidationErrors[];
    setTranslationErrors: (errors: ValidationErrors[]) => void;
};

enum MenuItem {
    none = 'none',
    file = 'file',
    more = 'more',
}

const Navbar = ({
    showFormFiller,
    setValidationErrors,
    validationErrors,
    translationErrors,
    setTranslationErrors,
}: Props): JSX.Element => {
    const { i18n, t } = useTranslation();
    const { state, dispatch } = useContext(TreeContext);
    const [selectedMenuItem, setSelectedMenuItem] = useState(MenuItem.none);
    const [showContained, setShowContained] = useState(false);
    const [showImportValueSet, setShowImportValueSet] = useState(false);
    const [showJSONView, setShowJSONView] = useState(false);
    const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);
    const navBarRef = useRef<HTMLDivElement>(null);

    const exportToJsonAndDownload = useCallback(() => {
        // SAGE: Send questionnaire (in string form) as a message to the parent window
        const questionnaire = generateQuestionnaire(state);
        const questionnaireToSageMsg: StructorSendToSAGEMsg = {
            msgId: StructorMessageID.SendToSAGE,
            questionnaireStr: questionnaire,
        };
        console.log('sending event:');
        console.log(questionnaireToSageMsg);
        parent.postMessage(questionnaireToSageMsg, "*");
        dispatch(saveAction());
    }, [state, dispatch]);

    // SAGE: Add event listener for triggers to send the current questionnaire to SAGE
    useEffect(() => {
        const triggerSendEvHandler = ((event: MessageEvent<SAGETriggerSendMsg>) => {
            if (event.data.msgId === SAGEMessageID.TriggerSend) {
                console.log('structor: save triggered by SAGE');
                console.log(event);
                exportToJsonAndDownload();
            }
        }) as EventListener;
        window.addEventListener('message', triggerSendEvHandler, false)

		return () => window.removeEventListener('message', triggerSendEvHandler);
    }, [exportToJsonAndDownload]);

    const hideMenu = () => {
        setSelectedMenuItem(MenuItem.none);
    };

    useOutsideClick(navBarRef, hideMenu, selectedMenuItem === MenuItem.none);

    const callbackAndHide = (callback: () => void) => {
        callback();
        hideMenu();
    };

    const getFileName = (): string => {
        // let technicalName = state.qMetadata.name || 'skjema';
        // technicalName = technicalName.length > 40 ? technicalName.substring(0, 40) + '...' : technicalName;
        const version = state.qMetadata.version ? `-v${state.qMetadata.version}` : '';
        // if (state.qAdditionalLanguages && Object.values(state.qAdditionalLanguages).length < 1) {
        //     return `${technicalName}-${state.qMetadata.language}${version}`;
        // }
        // return `${technicalName}${version}`;
        return `${state.qMetadata.title}${version}`
    };

    const handleMenuItemClick = (clickedItem: MenuItem) => {
        if (selectedMenuItem !== clickedItem) {
            setSelectedMenuItem(clickedItem);
        } else {
            hideMenu();
        }
    };

    const cachedProfile = sessionStorage.getItem('profile');
    const profile = cachedProfile ? JSON.parse(cachedProfile) : null;

    function getProfileName(): string {
        return `${profile.given_name} ${profile.family_name}`;
    }

    const hasTranslations = (languages: Languages | undefined): boolean => {
        return !!languages && Object.keys(languages).length > 0;
    };

    return (
        <>
            {/* SAGE: Uncomment to test previewer */}
            {/* <div> 
                <Btn title={t('Preview')} onClick={showFormFiller} variant="primary" />
            </div> */}
            {showValidationErrors && (
                <ValidationErrorsModal
                    validationErrors={validationErrors}
                    translationErrors={translationErrors}
                    hasTranslations={hasTranslations(state.qAdditionalLanguages)}
                    onClose={() => setShowValidationErrors(false)}
                />
            )}
            {showContained && <PredefinedValueSetModal close={() => setShowContained(!showContained)} />}
            {showImportValueSet && <ImportValueSet close={() => setShowImportValueSet(!showImportValueSet)} />}
            {showJSONView && <JSONView showJSONView={() => setShowJSONView(!showJSONView)} />}
        </>
    );
};

export default Navbar;
