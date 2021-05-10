/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo } from "react";
import { withIntl } from "./ReactIntlProviderWrapper";
import PropTypes from "prop-types";

import { TextLink, Typography, Divider } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { spacing30, spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";

import { ExtensionProvider, useExtensionControl, useUserInfo } from '@ellucian/experience-extension-hooks';

import { CardProvider, useIntl } from './card-context';

import GoogleSignInImage from '../images/btn_google_signin_dark_normal_web.png';
import { AuthProvider, useAuth } from "./auth-context";
import { DriveProvider, useDrive } from "./drive-context";

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
	cardLoggedOut: {
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
		padding: "0 9px",
		alignItems: "center"
	},
	fileNameBox: {
		display: "flex",
		flexDirection: 'column',
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

function DriveCard({ classes }) {
	const { intl } = useIntl();
	const { setLoadingStatus } = useExtensionControl();
	const { locale } = useUserInfo();

	const { login, loggedIn } = useAuth();
	const { files } = useDrive();

	const [displayState, setDisplayState] = useState('init');

	const fileDateFormater = useMemo(() => {
		return new Intl.DateTimeFormat(locale, { month: 'short', day: '2-digit' })
	}, [locale]);

	const fileDateFormaterWithYear = useMemo(() => {
		return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' })
	}, [locale]);

	useEffect(() => {
		if (files !== undefined) {
			setDisplayState('filesLoaded');
		} else if (loggedIn === false) {
			setDisplayState('loggedOut');
		} else if (loggedIn) {
			setDisplayState('loggedIn');
		}
	}, [ files, loggedIn ])

	useEffect(() => {
		setLoadingStatus(displayState !== 'filesLoaded' && displayState !== 'loggedOut');
	}, [displayState])

	if (displayState === 'filesLoaded') {
		if (files.length > 0) {
			return (
				<div>
					{files.map((file) => {
						const { modifiedTime: fileModifiedTime } = file;
						const fileModified = new Date(fileModifiedTime);
						const modified = new Date().getFullYear() ===  fileModified.getFullYear()
							? fileDateFormater.format(fileModified)
							: fileDateFormaterWithYear.format(fileModified);
						const modifiedBy = file.lastModifyingUser ? file.lastModifyingUser.displayName : 'unknown';
						return (
							<a
								style={{ textDecoration: "none", color: "initial" }}
								href={file.webViewLink}
								key={file.id}
								target="_blank"
								rel="noreferrer"
							>
								<div className={classes.row}>
									<div className={classes.fileBox}>
										<img className={classes.fileIcon} src={file.iconLink}/>
										<div className={classes.fileNameBox}>
											<Typography
												className={classes.fileName}
												style={{ fontWeight: "bold" }}
												variant={"body1"}
											>
												{file.name}
											</Typography>
											<Typography variant={"body3"}>
												{intl.formatMessage({id: 'drive.modifiedBy'}, {date: modified, name: modifiedBy})}
											</Typography>
										</div>
									</div>
								</div>
								<Divider variant={"middle"} />
							</a>
						);
					})}
				</div>
			);
		}
	} else if (displayState === 'loggedOut') {
		return (
			<div className={classes.cardLoggedOut}>
				<GoogleSignOnButton onClick={login}/>
				<Typography variant={"h3"}>
					{intl.formatMessage({id: 'google.signedOut'})}
				</Typography>
				<Typography variant={"body1"} >
					<TextLink
						href='https://drive.google.com'
						variant='inherit'
						target='_blank'
					>
						{intl.formatMessage({id: 'google.launchMessage'})}
					</TextLink>
				</Typography>
			</div>
		);
	} else {
		return null;
	}
}

DriveCard.propTypes = {
	classes: PropTypes.object.isRequired
};

const DriveCardWithStyles = withStyles(styles)(DriveCard);

function CardWithProviders(props) {
    return (
        <ExtensionProvider {...props}>
			<CardProvider {...props}>
				<AuthProvider type='google'>
					<DriveProvider>
						<DriveCardWithStyles/>
					</DriveProvider>
				</AuthProvider>
			</CardProvider>
        </ExtensionProvider>
    )
}

export default withIntl(CardWithProviders);