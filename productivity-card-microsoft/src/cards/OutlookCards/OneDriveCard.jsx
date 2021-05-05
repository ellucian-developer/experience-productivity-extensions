import React, { useState, useEffect } from "react";
import { withIntl } from "../ReactIntlProviderWrapper";
import PropTypes from "prop-types";
import moment from "moment";

// Ellucian Design System
import { Typography, Divider } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { spacingSmall } from "@hedtech/react-design-system/core/styles/tokens";
import { Icon } from "@eui/ds-icons/lib";

// START MSAL
import { UserAgentApplication } from "msal";
import { Client } from "@microsoft/microsoft-graph-client";
import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from "@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions";

const styles = () => ({
	card: {
		flex: "1 0 auto",
		width: "100%",
		height: "100%",
		display: "flex",
		padding: "2.5rem 3rem 1rem 3rem",
		flexFlow: "column",
		alignItems: "center",
		justifyContent: "center"
	},
	row: {
		display: "flex",
		paddingLeft: spacingSmall,
		paddingRight: spacingSmall
	},
	leftCol: {
		width: "10%",
		display: "flex",
		flexDirection: "column",
		padding: "0 10px",
		alignItems: "flex-end"
	},
	rightCol: {
		width: "90%",
		display: "flex",
		flexDirection: "column",
		padding: "0 9px",
		alignItems: "flex-start",
		borderLeft: "solid 1px #5B5E65"
	},
	icon: {
		color: "#5B5E65",
		height: "80px !important",
		width: "80px !important",
		marginBottom: "10px"
	}
});

const OneDriveCard = (props) => {
	const [oneDriveItems, setOneDriveItems] = useState([]);
	const {
		classes,
		cardControl: { setLoadingStatus, setErrorMessage },
		intl
	} = props;

	useEffect(() => {
		(async () => {
			// General Timeout if MSAL/Graph fails to return data.
			const timer = setTimeout(() => {
				setErrorMessage({
					headerMessage: "Contact Your Administrator",
					textMessage: "The request for data timed out.",
					iconName: "warning",
					iconColor: "#EFC728"
				});
			}, 10000);

			await setLoadingStatus(true);

			const msalConfig = {
				auth: {
					// DEVELOPMENT VALUE - Hard-coded Value
					// clientId: "c4d4387d-99e6-4a7f-af44-ddbe1abc5247", // Client Id of the registered application

					// Experience Admin Configuration
					clientId: props.cardInfo.configuration.aadClientId,

					// DEVELOPMENT VALUE - Hard-Coded Value
					// authority: "https://login.microsoftonline.com/609df3e8-ecd2-4767-9876-7f569b12945e/",

					// Experience Admin Configuration
					authority: `https://login.microsoftonline.com/${props.cardInfo.configuration.aadTenantId}/`,

					// DEVELOPMENT VALUE - Hard-coded Value
					// redirectUri: "http://localhost:8080"

					// Experience Admin Configuration
					redirectUri: props.cardInfo.configuration.aadRedirectUrl
				},
				cache: {
					cacheLocation: "localStorage"
				}
			};

			const graphScopes = ["calendars.read"];
			// An array of graph scopes

			const msalInstance = new UserAgentApplication(msalConfig);
			const options = new MSALAuthenticationProviderOptions(graphScopes);
			const authProvider = new ImplicitMSALAuthenticationProvider(
				msalInstance,
				options
			);
			// const preferredUsername = props.userInfo.userId;
			const preferredUsername = props.cardInfo.configuration.userId;

			const clientOptions = {
				authProvider
				// An instance created from previous step
			};

			const client = Client.initWithMiddleware(clientOptions);

			const msalRequest = {
				loginHint: preferredUsername
			};

			const getOneDriveItems = async () => {
				try {
					await msalInstance
						.ssoSilent(msalRequest)
						.then(async (response) => {

							const oneDriveItemDetails = await client
								.api(
									`/me/drive/root/children`
								)
								.get();

							console.log("OneDrive Items 1 ", oneDriveItemDetails);

							setOneDriveItems(oneDriveItemDetails.value);
							setLoadingStatus(false);
							clearTimeout(timer);
						})
						.catch((error) => {
							console.log("OneDrive ERROR 1", error);
							setErrorMessage({
								headerMessage: "Contact Your Administrator",
								textMessage:
									"There was an issue retrieving your data.",
								iconName: "warning",
								iconColor: "#EFC728"
							});
							clearTimeout(timer);
						});
				} catch (error) {
					console.log("OneDrive ERROR 2", error);
					setErrorMessage({
						headerMessage: "Contact Your Administrator",
						textMessage: "There was an issue retrieving your data.",
						iconName: "warning",
						iconColor: "#EFC728"
					});
					clearTimeout(timer);
				}
			};

			getOneDriveItems();
			console.log("OneDrive Items ", oneDriveItems);
		})();
	}, []);

	// Conditionally renders view based on number of items in OneDrive.
	if (oneDriveItems.length > 0) {
		return (
			<div>
				{oneDriveItems.map((item) => {
					return (
						<a
							style={{ textDecoration: "none", color: "initial" }}
							href={item.webLink}
							key={item.id}
							target="_blank"
							rel="noreferrer"
						>
							<div className={classes.row}>
								<div className={classes.leftCol}>
									<Typography
										style={{ fontWeight: "bold" }}
										variant={"body1"}
									>
										{moment(item.createdDateTime).format(
											"D"
										)}
									</Typography>
									<Typography variant={"body3"}>
										{moment(item.createdDateTime).format(
											"ddd"
										)}
									</Typography>
								</div>
								<div className={classes.rightCol}>
									<a
											style={{
											textAlign: "center",
											textDecoration: "none",
											color: "initial"
											}}
										href={item.webUrl}
										target="_blank"
										rel="noreferrer"
									>
									<Typography
										style={{ fontWeight: "bold" }}
										variant={"body1"}
									>
										<u>{item.name}</u>
									</Typography>
									</a>
									<Typography variant={"body3"}>
										Last Modified: {moment.utc(item.lastModifiedDateTime).local().format("YYYY-MM-DD HH:mm:ss")}
										<span style={{ paddingRight: "8px" }}></span>
										<span
											style={{
												paddingLeft: "7px",
												borderLeft: "solid 1px #5B5E65"
											}}
										>
										By: {item.lastModifiedBy.user.displayName}
										</span>
									</Typography>
								</div>
							</div>
							<Divider variant={"middle"} />
						</a>
					);
				})}
			</div>
		);
	} else {
		return (
			<div className={classes.card}>
				<a
					style={{
						textAlign: "center",
						textDecoration: "none",
						color: "initial"
					}}
					href="https://ellucian-my.sharepoint.com/"
					target="_blank"
					rel="noreferrer"
				>
					<Icon className={classes.icon} name="onedrive"></Icon>
					<Typography>You have no one drive items today.</Typography>
					<Typography>Click to view your one drive.</Typography>
				</a>
			</div>
		);
	}
};

OneDriveCard.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withIntl(withStyles(styles)(OneDriveCard));
