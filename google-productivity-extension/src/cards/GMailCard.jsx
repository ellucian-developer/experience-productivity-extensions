/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from "react";
import { withIntl } from "./ReactIntlProviderWrapper";
import PropTypes from "prop-types";

import { TextLink, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { spacing30, spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";

import { ExtensionProvider, useExtensionControl } from '@ellucian/experience-extension-hooks';

import { CardProvider, useIntl } from './card-context';

import GoogleSignInImage from '../images/btn_google_signin_dark_normal_web.png';
import GoogleIcon from '../images/btn_google_dark_focus_ios.svg';

import { AuthProvider, useAuth } from "./auth-context";
import { MailProvider, useMail } from "./mail-context";

const googleSignOnButtonStyles = () => ({
	root: {
	},
	button: {
		border: 'none',
		padding: '0px',
		cursor: 'pointer'
	}
});

function GoogleSignOnButtonSansStyles({classes, onClick}) {
	return (
		<div className={classes.root}>
			<button className={classes.button} onClick={onClick}>
				<img src={GoogleSignInImage}/>
			</button>
		</div>
	)
}
GoogleSignOnButtonSansStyles.propTypes = {
	classes: PropTypes.object.isRequired,
	onClick: PropTypes.func
};

const GoogleSignOnButton = withStyles(googleSignOnButtonStyles)(GoogleSignOnButtonSansStyles);

const styles = () => ({
	card: {
		flex: "1 0 auto",
		width: "100%",
		height: "100%",
		display: "flex",
		padding: spacingSmall,
		flexFlow: "column",
		alignItems: "center",
		justifyContent: "center",
		'& > *': {
			marginBottom: spacingSmall
		},
		'& :last-child': {
			marginBottom: '0px'
		}
	},
	row: {
		display: "flex",
		paddingLeft: spacingSmall,
		paddingRight: spacingSmall
	},
	fileBox: {
		width: "90%",
		display: "flex",
		flexDirection: "column",
		padding: "0 9px",
		alignItems: "flex-start"
	},
	fileNameBox: {
		display: "flex",
		width: '100%',
		alignItems: 'baseline',
		marginBottom: spacing30
	},
	fileIcon: {
		marginRight: spacingSmall
	},
	fileName: {
		overflow: 'hidden',
		wordWrap: 'break-word',
		textOverflow: 'ellipsis'
	}
});

function GMailCard({ classes }) {
	const { intl } = useIntl();
	const { setLoadingStatus } = useExtensionControl();

	const { login, loggedIn } = useAuth();
	const { messages, unread } = useMail();

	const [displayState, setDisplayState] = useState('init');

	useEffect(() => {
		if (unread !== undefined) {
			setDisplayState('loaded');
		} else if (loggedIn === false) {
			setDisplayState('loggedOut');
		} else if (loggedIn) {
			setDisplayState('loggedIn');
		}
	}, [ loggedIn, unread ])

	useEffect(() => {
		setLoadingStatus(displayState !== 'loaded' && displayState !== 'loggedOut');
	}, [displayState])

	if (displayState === 'loaded') {
		return (
			<div className={classes.card}>
				<img src={GoogleIcon}/>
				<Typography>
					{intl.formatMessage({id: (unread === 1 ? 'mail.unread' : 'mail.unreads')}, {unread})}
				</Typography>
				<Typography variant={"body1"} >
					<TextLink
						href='https://mail.google.com'
						variant='inherit'
						target='_blank'
					>
						{intl.formatMessage({id: 'mail.launchMessage'})}
					</TextLink>
				</Typography>
			</div>
		);
	} else if (displayState === 'loggedOut') {
		return (
			<div className={classes.card}>
				<GoogleSignOnButton onClick={login}/>
				<Typography variant={"h3"}>
					{intl.formatMessage({id: 'google.signedOut'})}
				</Typography>
				<Typography variant={"body1"} >
					<TextLink
						href='https://mail.google.com'
						variant='inherit'
						target='_blank'
					>
						{intl.formatMessage({id: 'mail.launchMessage'})}
					</TextLink>
				</Typography>
			</div>
		);
	} else {
		return null;
	}
}

GMailCard.propTypes = {
	classes: PropTypes.object.isRequired
};

const GMailCardWithStyles = withStyles(styles)(GMailCard);

function CardWithProviders(props) {
    return (
        <ExtensionProvider {...props}>
			<CardProvider {...props}>
				<AuthProvider type='google'>
					<MailProvider>
						<GMailCardWithStyles/>
					</MailProvider>
				</AuthProvider>
			</CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(CardWithProviders);