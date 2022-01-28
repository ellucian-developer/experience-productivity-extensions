// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

/* eslint-disable global-require */
import React from 'react';
import { injectIntl, IntlProvider, addLocaleData } from 'react-intl';
import PropTypes from 'prop-types';
import ar from 'react-intl/locale-data/ar';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';

import ENGLISH_TRANSLATION from '../i18n/en.json';

addLocaleData([ ...en, ...es, ...fr, ...ar ]);

const getMessages = (userLocale) => {
    const {messages: baseMessages } = ENGLISH_TRANSLATION;

    try {
        const { messages: localeMessages } = require(`../i18n/${userLocale}.json`);
        // check for territory specific translations
        if (localeMessages) {
            return Object.assign({}, baseMessages, localeMessages);
        } else {
            // check for language translations
            const actionLanguage = userLocale.split(/[-_]/)[0];
            const { messages: localeMessages } = require(`../i18n/${actionLanguage}.json`);
            return Object.assign({}, baseMessages, localeMessages);
        }
    } catch (e) {
        try {
            const actionLanguage = userLocale.split(/[-_]/)[0];
            const { messages: localeMessages } = require(`../i18n/${actionLanguage}.json`);
            return Object.assign({}, baseMessages, localeMessages);
        } catch (e) {
            // This userLocale is not supported.
            return null;
        }
    }
}

export function withIntl(WrappedComponent) {
    let InjectedComponent;

    class WithIntl extends React.Component {
        constructor(props) {
            super(props);
            InjectedComponent = injectIntl(WrappedComponent);
        }
        render() {
            const { userInfo: { locale } } = this.props;

            return (
                <IntlProvider locale={locale} messages={getMessages(locale)}>
                    <InjectedComponent {...this.props} />
                </IntlProvider>
            );
        }
    }
    WithIntl.propTypes = {
        userInfo: PropTypes.object
    };
    WithIntl.displayName = `WithIntl(${WrappedComponent.displayName})`;
    return WithIntl;
}
