export default function (sender: string, invitationLink: string, role: string, classroomName: string) {
    return `
    <div style="margin: 0; padding: 20px; width: 100%; background-color: #efefef">
        <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            style="margin: 0 auto; padding: 0; table-layout: fixed"
        >
            <tr>
            <td>
                <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                style="
                    margin: 0 auto;
                    padding: 0;
                    table-layout: fixed;
                    background-color: white;
                "
                >
                <tbody>
                    <tr
                    style="
                        border-collapse: collapse;
                        border-spacing: 0;
                        padding: 0;
                        margin: 0;
                    "
                    >
                    <td
                        style="
                        max-width: 500;
                        width: 600px;
                        border: 1px solid #e3e3e3;
                        padding: 25px;
                        "
                    >
                        <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="width: 100%"
                        >
                        <tbody>
                            <tr>
                            <td>
                                Hi,<br />
                                <b><i>${sender}</b></i> invited you to become a ${role === "teacher" ? "teacher" : "student"} in
                                <b><i>${classroomName}</i></b>.<br />
                                If you accept this invitation, click the button below to process.
                            </td>
                            </tr>
                        </tbody>
                        </table>
                        <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="width: 100%"
                        >
                        <tbody>
                            <tr>
                            <td style="text-align: center; height: 80px">
                                <a
                                style="
                                    background-color: mediumblue;
                                    color: white;
                                    text-decoration: none;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                "
                                href="${invitationLink}"
                                >Accept</a
                                >
                            </td>
                            </tr>
                        </tbody>
                        </table>
                        <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="width: 100%"
                        >
                        <tbody>
                            <tr>
                            <td style="text-align: center">
                                If you have problems with the button abouve, <br />
                                please copy this link and paste into the address bar.
                            </td>
                            </tr>
                        </tbody>
                        </table>
                        <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="width: 100%; margin: 10px 0px"
                        >
                        <tbody>
                            <tr>
                            <td style="text-align: center; font-size: 0.8em">
                                <a
                                href="${invitationLink}"
                                >
                                    ${invitationLink}
                                </a>
                            </td>
                            </tr>
                        </tbody>
                        </table>
                        <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="width: 100%; margin-bottom: 20px"
                        >
                        <tbody>
                            <tr>
                            <td>
                                Thank you,<br />
                                Gradebook System Team
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    </tr>
                </tbody>
                </table>
                <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="width: 100%; margin-bottom: 20px; margin-top: 10px"
                >
                <tbody>
                    <tr>
                    <td style="text-align: center; color: #808080">
                        This is an automatic email.
                        <br />
                        Please don't reply to this email. <br />
                        <br />
                        <i>Gradebook System - 2021</i>
                    </td>
                    </tr>
                </tbody>
                </table>
            </td>
            </tr>
        </table>
    </div>
    `;
};