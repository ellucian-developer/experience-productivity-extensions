/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import PropTypes from "prop-types";

import { Button, Card, CardContent, CardHeader } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { spacing30, spacing40 } from "@hedtech/react-design-system/core/styles/tokens";

import { useIntl } from '../context-hooks/card-context-hooks.js';
import { useAuth } from '../context-hooks/auth-context-hooks';

const styles = () => ({
    devCard: {
        marginLeft: spacing40,
        marginRight: spacing40,
        marginBottom: spacing40
    },
    devButton: {
        marginBottom: spacing30
    }
});

function DevelopmentBox({ classes }) {
    const { intl } = useIntl();
    const { logout, revokePermissions } = useAuth();

    function onLogout() {
        logout();
    }

    function onRevokePermissions() {
        revokePermissions();
    }

    if (process.env.NODE_ENV === 'development') {
        return (
            <Card className={classes.devCard}>
                <CardHeader title="Development Mode"/>
                <CardContent>
                    <Button className={classes.devButton} onClick={onLogout}>{intl.formatMessage({ id: 'development.signOut' })}</Button>
                    <Button className={classes.devButton} onClick={onRevokePermissions}>{intl.formatMessage({ id: 'development.revokePermissions' })}</Button>
                </CardContent>
            </Card>
        );
    } else {
        return null;
    }
}

DevelopmentBox.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DevelopmentBox);
