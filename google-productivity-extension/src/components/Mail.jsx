/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import safeHtml from 'safe-html';
import classnames from 'classnames';

import { Avatar, Divider, Illustration, IMAGES, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { fontWeightBold, fontWeightNormal, spacing30, spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";

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
	},
	subjectBox: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	subject: {
		marginRight: spacingSmall
	},
	bold: {
		fontWeight: fontWeightBold
	},
	noWrap: {
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis'
	},
	divider: {
		marginTop: spacing30,
		marginBottom: spacing30
	},
	fontWeightNormal: {
		fontWeight: fontWeightNormal
	}
});

function Mail({ classes }) {
	const { setLoadingStatus } = useExtensionControl();

	const { intl } = useIntl();
	const { LoginButton } = useComponents();
	const { login, loggedIn, state: authState } = useAuth();
	const { messages, state: mailState } = useMail();

	const [displayState, setDisplayState] = useState('init');

	useEffect(() => {
		if (mailState === 'loaded' || mailState === 'refresh') {
			setDisplayState('loaded');
		} else if (mailState && mailState.error) {
			setDisplayState('error');
		} else if (loggedIn === false) {
			setDisplayState('loggedOut');
		} else if (loggedIn) {
			setDisplayState('loggedIn');
		}
	}, [ loggedIn, mailState ])

	useEffect(() => {
		setLoadingStatus(displayState === 'init' || !mailState || authState !== 'ready');
	}, [authState, displayState, mailState])

	if (displayState === 'loaded') {
		if (messages.length > 0) {
			return (
				<>
					{messages.map((message) => {
						const {
							body,
							id,
							fromInitials,
							fromName,
							messageLink,
							receivedDate,
							subject
						} = message;
						return (
							<Fragment key={id}>
								<div className={classes.messageBox}>
									<Avatar>{fromInitials}</Avatar>
									<div className={classes.messageDetailsBox}>
										<Typography
											className={classnames(classes.messageFrom, { [classes.bold]: message.unread })}
											noWrap
											variant={"body1"}
										>
											{fromName}
										</Typography>
										<div className={classes.subjectBox}>
											<Typography component='div' noWrap className={classnames(classes.subject, { [classes.bold]: message.unread })}>
												<a
													href={messageLink}
													target='_blank'
													rel="noreferrer"
												>
													{subject}
												</a>
											</Typography>
											<Typography component='div' className={classes.date}>
												{receivedDate.toString()}
											</Typography>
										</div>
										<Typography component='div' noWrap>
											<div className={classes.noWrap} dangerouslySetInnerHTML={{__html: safeHtml(body)}}/>
										</Typography>
									</div>
								</div>
								<Divider classes={{ root: classes.divider }} variant={"middle"} />
							</Fragment>
						);
					})}
				</>
			);
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
