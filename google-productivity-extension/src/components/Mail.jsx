/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import safeHtml from 'safe-html';
import classnames from 'classnames';

import { Avatar, Button, Card, CardContent, CardHeader, Divider, Illustration, IMAGES, Tooltip, Typography } from "@hedtech/react-design-system/core";
import { Icon } from '@eui/ds-icons/lib/';
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { colorBrandNeutral250, fontWeightBold, fontWeightNormal, spacing30, spacing40 } from "@hedtech/react-design-system/core/styles/tokens";

import { useExtensionControl } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks.js';
import { useAuth } from "../context-hooks/auth-context-hooks";
import { useMail } from "../context-hooks/google/mail-context-hooks";

const styles = () => ({
	card: {
		flex: "1 0 auto",
		width: "100%",
		height: "100%",
		display: "flex",
		padding: spacing40,
		flexFlow: "column",
		alignItems: "center",
		justifyContent: "center",
		'& > *': {
			marginBottom: spacing40
		},
		'& :last-child': {
			marginBottom: '0px'
		}
	},
	content: {
		display: "flex",
		flexFlow: "column"
	},
	messageBox: {
		display: "flex",
		alignItems: "center",
		paddingLeft: spacing40,
		paddingRight: spacing40,
		paddingBottom: spacing30,
		width: '100%',
		'&:hover': {
			backgroundColor: colorBrandNeutral250
		}
	},
	messagePaddingTop: {
		paddingTop: spacing30
	},
	messageIcon: {
		flex: '0 0 auto'
	},
	messageDetailsBox: {
		paddingLeft: spacing40,
		width: 'calc(100% - 40px)',
		flex: '1 1 auto',
		display: "flex",
		flexDirection: 'column',
		alignItems: 'stretch'
	},
	messageFrom: {
	},
	fromBox: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	subjectBox: {
		display: 'flex',
		alignItems: 'center'
	},
	subject: {
		marginRight: spacing40
	},
	attachment: {
		flex: '1 0 auto',
		maxWidth: spacing40
	},
	bold: {
		fontWeight: fontWeightBold
	},
	noWrap: {
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis'
	},
	fontWeightNormal: {
		fontWeight: fontWeightNormal
	},
	devCard: {
		marginLeft: spacing40,
		marginRight: spacing40,
		marginBottom: spacing40
	},
	devButton: {
		marginBottom: spacing30
	},
	divider: {
		marginTop: '0px',
		marginBottom: '0px'
	}
});

function Mail({ classes }) {
	const { setErrorMessage, setLoadingStatus } = useExtensionControl();

	const { intl } = useIntl();
	const { LoginButton } = useComponents();
	const { error: authError, login, loggedIn, logout, revokePermissions, state: authState } = useAuth();
	const { error: mailError, messages, refresh, state: mailState } = useMail();

	const [displayState, setDisplayState] = useState('init');

	useEffect(() => {
		if (authError || mailError) {
			setErrorMessage({
				headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
				textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
				iconName: 'warning'
			})
		} else if (loggedIn === false && authState === 'ready') {
			setDisplayState('loggedOut');
		} else if (mailState === 'loaded' || mailState === 'refresh') {
			setDisplayState('loaded');
		} else if (mailState && mailState.error) {
			setDisplayState('error');
		}
	}, [ loggedIn, mailState ])

	useEffect(() => {
		setLoadingStatus(displayState === 'init');
	}, [authState, displayState, mailState])

	function onLogout() {
		logout();
	}

	function onRevokePermissions() {
		revokePermissions();
		refresh();
	}

	if (displayState === 'loaded') {
		if (messages && messages.length > 0) {
			return (
				<div className={classes.content}>
					{messages.map((message, index) => {
						const {
							body,
							id,
							fromInitial,
							fromName,
							hasAttachment,
							messageUrl,
							received,
							subject,
							unread
						} = message;
						const first = index === 0;
						const last = index === messages.length - 1;
						return (
							<Fragment key={id}>
								<div className={classnames(classes.messageBox, {[classes.messagePaddingTop]: !first})}>
									<Avatar>{fromInitial}</Avatar>
									<div className={classes.messageDetailsBox}>
										<div className={classes.fromBox}>
											<Typography
												className={classnames(classes.messageFrom, { [classes.bold]: unread })}
												noWrap
												variant={"body1"}
											>
												{fromName}
											</Typography>
											<Typography component='div' className={classes.date}>
												{received}
											</Typography>
										</div>
										<div className={classes.subjectBox}>
											<Typography component='div' noWrap className={classnames(classes.subject, { [classes.bold]: unread })}>
												<a
													href={messageUrl}
													target='_blank'
													rel="noreferrer"
												>
													{subject}
												</a>
											</Typography>
											{ hasAttachment && (
												<Tooltip title={intl.formatMessage({id: 'mail.attachment'})}>
													<Icon className={classes.attachment} name='file-text' />
												</Tooltip>
											)}
										</div>
										<Typography component='div' noWrap>
											<div className={classes.noWrap} dangerouslySetInnerHTML={{__html: safeHtml(body)}}/>
										</Typography>
									</div>
								</div>
								{ !last && (
									<Divider classes={{ root: classes.divider }} variant={"middle"} />
								)}
							</Fragment>
						);
					})}
					{ process.env.NODE_ENV === 'development' && (
						<Card className={classes.devCard}>
							<CardHeader title="Development Mode"/>
							<CardContent>
								<Button className={classes.devButton} onClick={onLogout}>Sign Out</Button>
								<Button className={classes.devButton} onClick={onRevokePermissions}>Revoke Permissions</Button>
							</CardContent>
						</Card>
					)}
				</div>
			);
		} else {
			return (
				<div>No Messages</div>
			)
		}
	} else if (displayState === 'loggedOut') {
		return (
				<div className={classes.card}>
				<Illustration name={IMAGES.ID_BADGE} />
				<Typography className={classes.fontWeightNormal} variant={"h3"} component='div'>
					{intl.formatMessage({id: 'google.permissionsRequested'})}
				</Typography>
				<LoginButton login={login}/>
			</div>
		);
	} else {
		// eslint-disable-next-line no-warning-comments
		// TODO add error case
		return null;
	}
}

Mail.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Mail);
