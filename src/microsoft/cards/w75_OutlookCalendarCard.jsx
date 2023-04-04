/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { withIntl } from '../../components/ReactIntlProviderWrapper';

import { MicrosoftCardProvider } from '../context-providers/w75_microsoft-card-context-provider';
import { MicrosoftAuthProvider } from '../context-providers/microsoft-auth-context-provider';
import { MicrosoftCalendarProvider } from '../context-providers/w75_microsoft-calendar-context-provider';

import Agenda from '../../components/w75_Calendar';

import { initializeLogging } from '../../util/log-level';
initializeLogging('Microsoft');

function OutlookCalendarCard(props) {
    return (
            <MicrosoftCardProvider {...props}>
                <MicrosoftAuthProvider>
                    <MicrosoftCalendarProvider>
                        <Agenda/>
                    </MicrosoftCalendarProvider>
                </MicrosoftAuthProvider>
            </MicrosoftCardProvider>
    )
}

export default withIntl(OutlookCalendarCard);
