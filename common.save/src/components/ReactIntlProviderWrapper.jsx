import React from 'react';
import { injectIntl, IntlProvider, addLocaleData } from 'react-intl';
import PropTypes from 'prop-types';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';

import ENGLISH_TRANSLATION from '../i18n/en.json';

addLocaleData([ ...en, ...es ]);

const getMessages = (userLocale) => {
    const {messages: baseMessages } = ENGLISH_TRANSLATION;

    try {
        const { messages: localeMessages } = require(`./${userLocale}.json`);
        // check for territory specific translations
        if (localeMessages) {
            return Object.assign({}, baseMessages, localeMessages);
        } else {
            // check for language translations
            const actionLanguage = userLocale.split(/[-_]/)[0];
            const { messages: localeMessages } = require(`./${actionLanguage}.json`);
            return Object.assign({}, baseMessages, localeMessages);
        }
    } catch (e) {
        try {
            const actionLanguage = userLocale.split(/[-_]/)[0];
            const { messages: localeMessages } = require(`./${actionLanguage}.json`);
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
