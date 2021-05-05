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

const TeamsCard = (props) => {
	const [teamsItems, setTeamsItems] = useState([]);
	const [channelItems, setChannelItems] = useState([]);
	const [messageItems, setChannelMessageItems] = useState([]);
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

			const graphScopes = ["team.readbasic.all", "channel.readbasic.all", "channelmessage.read.all"];
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

			const getTeamsItems = async () => {
				try {
					await msalInstance
						.ssoSilent(msalRequest)
						.then(async (response) => {

							const oneTeamsDetails = await client
								.api(
									`/me/joinedTeams`
								)
								.get();

							console.log("Team Items 1 ", oneTeamsDetails);

							setTeamsItems(oneTeamsDetails.value);
							console.log("teams Items", teamsItems);
							clearTimeout(timer);
							getChannels(oneTeamsDetails.value);
						})
						.catch((error) => {
							console.log("Teams ERROR 1", error);
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
					console.log("Teams ERROR 2", error);
					setErrorMessage({
						headerMessage: "Contact Your Administrator",
						textMessage: "There was an issue retrieving your data.",
						iconName: "warning",
						iconColor: "#EFC728"
					});
					clearTimeout(timer);
				}
			};

			// For now: This should be called inside the GetTeams
			const getChannels =  (teamsItems) => {
				// temporary, to iterate through teams
				var teamId = teamsItems[0].id;
				// url: https://graph.microsoft.com/v1.0/teams/68f93e1d-6f07-4edc-a694-42f15a5a60cc/channels
				var getChannelUrl = `/teams/` + teamId + `/channels`;
				console.log("get Channel Url: ", getChannelUrl);
				try {
					msalInstance
						.ssoSilent(msalRequest)
						.then(async (response) => {

							const oneChannelDetails = await client
								.api(
									getChannelUrl
								)
								.get();

							console.log("Chanmel Items 1 ", oneChannelDetails);

							setChannelItems(oneChannelDetails.value);
							setLoadingStatus(false);
							clearTimeout(timer);

							getChannelMessages(teamId, oneChannelDetails.value);

						})
						.catch((error) => {
							console.log("Channel ERROR 1", error);
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
					console.log("Chanmel ERROR 2", error);
					setErrorMessage({
						headerMessage: "Contact Your Administrator",
						textMessage: "There was an issue retrieving your data.",
						iconName: "warning",
						iconColor: "#EFC728"
					});
					clearTimeout(timer);
				}
			};

			// For now: This should be called inside the getChannels
			const getChannelMessages =  (teamId, channelItems) => {
				// temporary: no only use first one. to iterate through teams
				var channelId = channelItems[0].id;
				// url: https://graph.microsoft.com/beta/teams/68f93e1d-6f07-4edc-a694-42f15a5a60cc/channels/19:a5265771774f4cfeac26813736d60389@thread.tacv2/messages
				var getChannelMessageUrl = `/teams/` + teamId + `/channels/` + channelId + `/messages`;
				console.log("get Channel message Url: ", getChannelMessageUrl);
				try {
					msalInstance
						.ssoSilent(msalRequest)
						.then(async (response) => {

							const oneMessageDetails = await client
								.api(
									getChannelMessageUrl
								)
								.version('beta')
								.get();

							console.log("Chanmel Items 1 ", oneMessageDetails);

							setChannelMessageItems(oneMessageDetails.value);
							setLoadingStatus(false);
							clearTimeout(timer);
						})
						.catch((error) => {
							console.log("Channel Message ERROR 1", error);
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
					console.log("Chanmel MessageERROR 2", error);
					setErrorMessage({
						headerMessage: "Contact Your Administrator",
						textMessage: "There was an issue retrieving your data.",
						iconName: "warning",
						iconColor: "#EFC728"
					});
					clearTimeout(timer);
				}
			};

			getTeamsItems();
		})();
	}, []);

	// Conditionally renders view based on number of teams.
	if (teamsItems.length > 0 && channelItems.length >0 && messageItems.length > 0 ) {
		return (
			<div>
				{teamsItems.map((item) => {
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
										style={{ fontWeight: "italic" }}
										variant={"body2"}
									>
									Team
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
										Team #1: <u>{item.displayName}</u>
									</Typography>
									</a>
									<Typography variant={"body2"}>
										<span
											style={{
												paddingLeft: "7px",
												borderLeft: "solid 1px #5B5E65"
											}}
										>
										This team has {channelItems.length} Channel(s)
										</span>
									</Typography>
									<Typography variant={"body3"}>
										<span
											style={{
												paddingLeft: "7px",
												borderLeft: "solid 1px"
											}}
										>
										- Channel #1: {channelItems[0].displayName}, Description: {channelItems[0].description}
										</span>
										<div>
										<Typography variant={"body3"}>
										<span
											style={{
												paddingLeft: "7px",
												borderLeft: "solid 1px"
											}}
										>
										--- Message: (via Beta API) <br />
										<u>from</u>: {messageItems[0].from.user.displayName}  <br />
										<u>body</u>: {messageItems[0].body.content} <br />
										<u>attachments</u>: {messageItems[0].attachments[0].name}
										</span>
										</Typography>
										</div>
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
					href="https://teams.microsoft.com/"
					target="_blank"
					rel="noreferrer"
				>
					<Icon className={classes.icon} name="teams"></Icon>
					<Typography>You are not in any teams.</Typography>
					<Typography>Click to view teams.</Typography>
				</a>
			</div>
		);
	}
};

TeamsCard.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withIntl(withStyles(styles)(TeamsCard));
