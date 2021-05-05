import React, { useState, useEffect } from "react";
import { withIntl } from "../ReactIntlProviderWrapper";
import PropTypes from "prop-types";

// Ellucian Design System
import { Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { Icon } from "@eui/ds-icons/lib";

// START MSAL
import { UserAgentApplication } from "msal";
import { Client } from "@microsoft/microsoft-graph-client";
import { ImplicitMSALAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/ImplicitMSALAuthenticationProvider";
import { MSALAuthenticationProviderOptions } from "@microsoft/microsoft-graph-client/lib/src/MSALAuthenticationProviderOptions";

const styles = () => ({
	card: {
		flex: "1 1 auto",
		width: "100%",
		height: "100%",
		display: "flex",
		padding: "2.5rem 3rem 1rem 3rem",
		flexFlow: "column",
		alignItems: "center",
		justifyContent: "center"
	},
	icon: {
		color: "#5B5E65",
		height: "80px !important",
		width: "80px !important"
	},
	count: {
		fontWeight: "bold"
	}
});

const OutlookMailCard = (props) => {
	const [emails, setEmailsNum] = useState(0);
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

			const graphScopes = ["mail.read"];
			// An array of graph scopes

			const msalInstance = new UserAgentApplication(msalConfig);
			const options = new MSALAuthenticationProviderOptions(graphScopes);
			const authProvider = new ImplicitMSALAuthenticationProvider(
				msalInstance,
				options
			);
			const preferredUsername = props.cardInfo.configuration.userId;

			const clientOptions = {
				authProvider
				// An instance created from previous step
			};

			const client = Client.initWithMiddleware(clientOptions);

			const msalRequest = {
				loginHint: preferredUsername
			};

			const getMail = async () => {
				try {
					await msalInstance
						.ssoSilent(msalRequest)
						.then(async (response) => {
							// The API call below to get unread count is not accurate
							/*
							const emailDetails = await client
								.api(
									"/me/mailFolders/Inbox/messages?$filter=isRead+eq+false"
								)
								.get();
							setEmailsNum(emailDetails.value.length);
							*/
							const emailDetails = await client
								.api(
									"/me/mailFolders?$filter=displayName%20eq%20'Inbox'"
								)
								.get();
							setEmailsNum(emailDetails.value[0].unreadItemCount);

							setLoadingStatus(false);
							clearTimeout(timer);
						})
						.catch((error) => {
							console.log("MAIL ERROR 1", error);
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
					console.log("MAIL ERROR 2", error);
					setErrorMessage({
						headerMessage: "Contact Your Administrator",
						textMessage: "There was an issue retrieving your data.",
						iconName: "warning",
						iconColor: "#EFC728"
					});
					clearTimeout(timer);
				}
			};

			getMail();
		})();
	}, []);

	if (emails > 0) {
		return (
			<div className={classes.card}>
				<a
					style={{
						textAlign: "center",
						textDecoration: "none",
						color: "initial"
					}}
					href="https://outlook.office.com/mail/inbox"
					target="_blank"
					rel="noreferrer"
				>
					<Icon className={classes.icon} name="email"></Icon>
					<Typography>
						You have{" "}
						<span className={classes.count}>{emails} unread</span>{" "}
						emails.
					</Typography>
					<Typography>Click to go to your inbox.</Typography>
				</a>
			</div>
		);
	}
	else {
		return (
			<div className={classes.card}>
				<a
					style={{
						textAlign: "center",
						textDecoration: "none",
						color: "initial"
					}}
					href="https://outlook.office.com/mail/inbox"
					target="_blank"
					rel="noreferrer"
				>
					<Icon className={classes.icon} name="email"></Icon>
					<Typography>
						You have no unread emails.
					</Typography>
					<Typography>Click to go to your inbox.</Typography>
				</a>
			</div>
		);
	}
};

OutlookMailCard.propTypes = {
	classes: PropTypes.object.isRequired,
	cardInfo: PropTypes.object.isRequired,
	cardControl: PropTypes.object.isRequired,
	intl: PropTypes.object.isRequired
};

export default withIntl(withStyles(styles)(OutlookMailCard));
