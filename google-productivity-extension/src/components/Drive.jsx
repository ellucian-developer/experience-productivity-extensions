/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { Divider, Illustration, IMAGES, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { fontWeightBold, spacing30, spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";

import { useExtensionControl, useUserInfo } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import { useAuth } from "../context-hooks/auth-context-hooks";
import { useDrive } from "../context-hooks/google/drive-context-hooks";

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
		width: '100%',
		fontWeight: fontWeightBold
	},
	divider: {
		marginTop: spacing30,
		marginBottom: spacing30
	}
});

function Drive({ classes }) {
	const { setLoadingStatus } = useExtensionControl();
	const { locale } = useUserInfo();

	const { intl } = useIntl();
	const { LoginButton } = useComponents();

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
												noWrap
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
								<Divider className={classes.divider} variant={"middle"} />
							</a>
						);
					})}
				</div>
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
		return null;
	}
}

Drive.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Drive);
