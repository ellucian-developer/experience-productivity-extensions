/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from "react";
import { withIntl } from "./ReactIntlProviderWrapper";
import PropTypes from "prop-types";

import { Avatar, Divider, TextLink, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { fontWeightBold, spacing30, spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";

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
		marginLeft: spacingSmall,
		marginRight: spacingSmall
	},
	messageBox: {
		display: "flex",
		alignItems: "center",
		paddingLeft: spacingSmall,
		paddingRight: spacingSmall,
		width: '100%'
	},
	messageIcon: {
		flex: '0 0 auto'
	},
	messageDetailsBox: {
		paddingLeft: spacingSmall,
		width: 'calc(100% - 40px)',
		flex: '1 1 auto',
		display: "flex",
		flexDirection: 'column',
		alignItems: 'stretch'
	},
	messageFrom: {
		fontWeight: fontWeightBold
	},
	subjectBox: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	subject: {
		fontWeight: fontWeightBold,
		marginRight: spacingSmall
	},
	body: {
	},
	divider: {
		marginTop: spacing30,
		marginBottom: spacing30
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

	const loadedMessages = (messages || []).filter(message => message.data);
	if (displayState === 'loaded') {
		if (loadedMessages.length > 0) {
			return (
				<>
					{loadedMessages.map((message) => {
						const {
							data: {
								receivedDate,
								fromName,
								fromInitials,
								subject,
								body
							}
						} = message;
						return (
							<>
								<div className={classes.messageBox}>
									<Avatar>{fromInitials}</Avatar>
									<div className={classes.messageDetailsBox}>
										<Typography
											className={classes.messageFrom}
											noWrap
											variant={"body1"}
										>
											{fromName}
										</Typography>
										<div className={classes.subjectBox}>
											<Typography component='div' noWrap className={classes.subject}>
												{subject}
											</Typography>
											<Typography component='div' className={classes.date}>
												{receivedDate.toString()}
											</Typography>
										</div>
										<Typography component='div' noWrap className={classes.body}>
											{body}
										</Typography>
									</div>
								</div>
								<Divider classes={{ root: classes.divider }} variant={"middle"} />
							</>
						);
					})}
				</>
			);
		} else if (displayState === 'loggedOut') {
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
		} else {
			// happens for a skinny second
			return null;
		}
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