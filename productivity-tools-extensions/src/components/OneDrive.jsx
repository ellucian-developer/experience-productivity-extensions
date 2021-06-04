/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo, Fragment } from "react";
import PropTypes from "prop-types";
import classnames from 'classnames';

import { Divider, Illustration, IMAGES, Popper, Typography } from "@hedtech/react-design-system/core";
import { withStyles } from "@hedtech/react-design-system/core/styles";
import { colorBrandNeutral250, colorCtaIrisActive, colorBrandNeutral300, fontWeightBold, fontWeightNormal, spacing30, spacing40, spacing50 } from "@hedtech/react-design-system/core/styles/tokens";

import { useExtensionControl, useUserInfo } from '@ellucian/experience-extension-hooks';

import { useComponents, useIntl } from '../context-hooks/card-context-hooks';

import { useAuth } from '../context-hooks/auth-context-hooks';
import { useDrive } from "../context-hooks/drive-context-hooks";

import { Person,  PeoplePicker, People, FileList, MgtTemplateProps, File, Login } from '@microsoft/mgt-react';
import { Button } from "@hedtech/react-design-system/core";

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
        flexFlow: "column",
        marginLeft: spacing40,
        marginRight: spacing40,
        '& hr:last-of-type': {
            display: 'none'
        }
    },
    'row0': {
        paddingTop: '0px !important'
    },
    row: {
        paddingTop: spacing30,
        paddingBottom: spacing30
        // '&:hover': {
        //     backgroundColor: colorBrandNeutral250
        // }
    },
    fileBox: {
        width: "90%",
        display: "flex",
        // padding: "0 9px",
        alignItems: "center"
    },
    fileNameBox: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'baseline'
    },
    fileIcon: {
        alignSelf: 'flex-start',
        marginTop: spacing30,
        marginRight: spacing40
    },
    fileName: {
        display: '-webkit-box',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        fontWeight: fontWeightBold
    },
    fileNamePopper: {
        paddingLeft: spacing50,
        paddingRight: spacing50
    },
    modified: {
        width: '100%',
        display: '-webkit-box',
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden'
    },
    divider: {
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: colorBrandNeutral300
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
    logoutBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing40,
        marginBottom: spacing40
    },
    button: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colorCtaIrisActive,
            color: colorBrandNeutral250
        }
    }
});



function MyFile (MgtTemplateProps, classes) {

    const fileDateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: '2-digit' })
    }, [locale]);

    const fileDateFormaterWithYear = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' })
    }, [locale]);

    const { locale } = useUserInfo();

    const { file } = MgtTemplateProps.dataContext;
    // return <div>
    //             <img height="28px" width="28px" src="https://spoprod-a.akamaihd.net/files/fabric-cdn-prod_20201008.001/assets/item-types/48/xlsx.svg"/>
    //         {file.name}
    //         </div>;
    const fileModified = new Date(file.lastModifiedDateTime);
                        const modified = new Date().getFullYear() === fileModified.getFullYear()
                            ? fileDateFormater.format(fileModified)
                            : fileDateFormaterWithYear.format(fileModified);
                        const modifiedBy = file.lastModifiedBy.user ? file.lastModifiedBy.user.displayName : 'unknown';
    return <Fragment key={file.id}>
                <a
                    style={{ textDecoration: "none", color: "initial" }}
                    href={file.webUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    {/* <mgt-file file-details ={file} view="twolines" line2Property="lastModifiedDateTime"> </mgt-file> */}
                    <File fileDetails={file} view="twolines"/>
                    {/* <Typography className={classes.modified} component='div' variant={"body3"}>
                        {intl.formatMessage({id: 'drive.modifiedBy'}, {date: modified, name: modifiedBy})}
                    </Typography> */}
                </a>
                {/* <Divider className={classes.divider} variant={"middle"} /> */}
            </Fragment>;
}

function MicrosoftLogin(MgtTemplateProps) {
    return <div style={{cursor: 'pointer',
                        height: '40px',
                        width: '100px',
                        borderRadius: '5px',
                        border: '2px solid #026BC8',
                        textAlign: 'center',
                        verticalAlign:'center',
                        fontFamily:'Roboto Condensed',
                        fontWeight: '700',
                        color: '#026BC8',
                        fontSize: '1rem',
                        letterSpacing: '.0625rem',
                        lineHeight:'2.5',
                        '&:hover': {
                            backgroundColor: colorCtaIrisActive,
                            color: colorBrandNeutral250
                        }}} >
                SIGN IN
            </div>
}

function OneDrive({ classes }) {
    const [people, setPeople] = useState([]);

    const { setErrorMessage, setLoadingStatus } = useExtensionControl();
    const { locale } = useUserInfo();

    const { intl } = useIntl();
    // const { NoFiles } = useComponents();

    const { error: authError, login, loginInit, loginFailed, loggedIn, logout, logoutCompleted } = useAuth();
    const { error: driveError, files } = useDrive();

    const [displayState, setDisplayState] = useState('init');

    const [popperContext, setPopperContext] = useState({ overflowedFileIds: []});

    const fileDateFormater = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: '2-digit' })
    }, [locale]);

    const fileDateFormaterWithYear = useMemo(() => {
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit' })
    }, [locale]);

    const [contentNode, setContentNode] = useState();

    const contentRef = (node) => {
        setContentNode(node);
    }

    const fileNameRef = (node, id) => {
        if (node) {
            const { clientHeight, scrollHeight } = node;
            const { overflowedFileIds } = popperContext;
            if (clientHeight < scrollHeight) {
                // it is overflowing
                const index = overflowedFileIds.indexOf(id);
                if (index === -1) {
                    overflowedFileIds.push(id);
                }
            } else {
                // it is not overflowing, hide tool tip
                const index = overflowedFileIds.indexOf(id);
                if (index >= 0) {
                    overflowedFileIds.splice(index, 1);
                }
            }
        }
    }

    useEffect(() => {
        if (authError || driveError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({id: 'error.contentNotAvailable'}),
                textMessage: intl.formatMessage({id: 'error.contactYourAdministrator'}),
                iconName: 'warning'
            })
        } else if (loggedIn === false) {
            setDisplayState('loggedOut');
        } else if (files !== undefined) {
            setDisplayState('filesLoaded');
        } else if (loggedIn) {
            setDisplayState('loggedIn');
        }
    }, [ files, loggedIn ])

    useEffect(() => {
        setLoadingStatus(displayState !== 'filesLoaded' && displayState !== 'loggedOut');
    }, [displayState])

    useEffect(() => {
        if (contentNode) {
            // find the parent with a title, to remove it so it doesn't interfere with the tool tip
            const nodesWithTitle = document.querySelectorAll('div[title]');
            for (const node of nodesWithTitle) {
                if (node.contains(contentNode))  {
                    // nodIe.removeAttribute('title');
                }
            }
        }
    }, [contentNode]);

    function openPopper(event, id) {
        const { currentTarget } = event;
        setPopperContext(() => ({
            id,
            anchor: currentTarget,
            overflowedFileIds: popperContext.overflowedFileIds
        }));
    }

    function closePopper() {
        setPopperContext(() => ({
            overflowedFileIds: popperContext.overflowedFileIds
        }));
    }

    // const handleSelectionChanged = (e) => {
    //     setPeople(e.target.selectedPeople);
    // };

    if (displayState === 'filesLoaded') {
        if (files && files.length > 0) {
            return (
                <div className={classes.content} ref={contentRef}>
                    {/* <FileList fileListQuery="/me/drive/search(q='')?$orderby=lastModifiedDateTime%20desc" pageSize="10">
                        <MyFile template="file"/>
                    </FileList> */}
                     {/* <File fileQuery="/me/drive/items/01MYB5TYUHERZ3VTRNDNAI223BLC7PFJHI" > </File> */}
                     {files.map((file, index) => {
                        const fileModified = new Date(file.lastModifiedDateTime);
                        const modified = new Date().getFullYear() === fileModified.getFullYear()
                            ? fileDateFormater.format(fileModified)
                            : fileDateFormaterWithYear.format(fileModified);
                        const modifiedBy = file.lastModifiedBy.user ? file.lastModifiedBy.user.displayName : 'unknown';
                        var filequery = "/me/drive/items/"+ file.id;
                        if (file.file === undefined) {
                            return "";
                        }
                        else {
                            return (
                                <Fragment key={file.id}>
                                    <div className={classnames(classes.row, classes[`row${index}`])}>
                                    <a
                                        style={{ textDecoration: "none", color: "initial" }}
                                        href={file.webUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {/* <mgt-file file-query ={filequery} view="twolines"> </mgt-file> */}
                                        {/* <mgt-file file-details ={file} view="oneline"> </mgt-file> */}
                                        <div className={classes.fileBox}>
                                            <File fileDetails={file} view="image"/>
                                            {/* <Typography className={classes.fileName} component='div' variant={"body2"} >
                                                {file.name}
                                            </Typography> */}
                                            <div className={classes.fileNameBox}>
                                                <Typography
                                                    className={classes.fileName}
                                                    component='div'
                                                    variant={"body2"}
                                                    ref={node => fileNameRef(node, file.id)}
                                                    onFocus={event => openPopper(event, file.id)}
                                                    onMouseOver={event => openPopper(event, file.id)}
                                                    onBlur={() => closePopper()}
                                                    onMouseLeave={() => closePopper()}
                                                >
                                                    {file.name}
                                                </Typography>
                                                <Popper
                                                    className={classes.fileNamePopper}
                                                    anchorEl={popperContext.anchor}
                                                    container={contentNode}
                                                    open={popperContext.id === file.id && popperContext.overflowedFileIds.includes(file.id)}
                                                    modifiers={{
                                                        preventOverflow: {
                                                            enabled: true,
                                                            padding: spacing40
                                                        }
                                                    }}
                                                >
                                                    <Typography>{file.name}</Typography>
                                                </Popper>
                                            <Typography className={classes.modified} component='div' variant={"body3"}>
                                                {intl.formatMessage({id: 'drive.modifiedBy'}, {date: modified, name: modifiedBy})}
                                            </Typography>
                                        </div>
                                    </div>
                                </a>
                                </div>
                                    <Divider className={classes.divider} variant={"middle"} />
                                </Fragment>
                            );
                        }
                    })}
                    {/* <Person personQuery="me" /> */}
                    {/* <div>
                        <PeoplePicker selectionChanged={handleSelectionChanged} />
                        Selected People: <People people={people} />
                    </div> */}
                    <div className={classes.logoutBox}>
                        <Login logoutInitiated={logout} logoutCompleted={logoutCompleted} />
                    </div>
                </div>
            );
        }
        else if (files) {
            // return <NoFiles/>;
            return <div> No Files found </div>;
        }
    } else if (displayState === 'loggedOut') {
        return (
            <div className={classes.card}>
                <Illustration name={IMAGES.ID_BADGE} />
                <Typography className={classes.fontWeightNormal} variant={"h3"} component='div'>
                    {intl.formatMessage({id: 'google.permissionsRequested'})}
                </Typography>
                {/* <LoginButton onClick={login}/> */}
                <Login loginCompleted={login} loginInitiated={loginInit} loginFailed={loginFailed} />
                <Login loginCompleted={login} loginInitiated={loginInit} loginFailed={loginFailed} data-type="signed-out-button-content">
                    {/* <template data-type="signed-out-button-content">
                        <div> SIGN IN </div>
                    </template> */}
                    <MicrosoftLogin template="signed-out-button-content" />
                </Login>
            </div>
        );
    } else {
        return null;
    }
}

OneDrive.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OneDrive);
