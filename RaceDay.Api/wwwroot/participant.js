let selectedEventId = null;

const eventEnrolmentModal =
    document.getElementById("eventEnrolmentModal");

const eventEnrolmentForm =
    document.getElementById("eventEnrolmentForm");

const eventCategorySelect =
    document.getElementById("eventCategorySelect");

const eventEnrolmentMessage =
    document.getElementById("eventEnrolmentMessage");

const profileModal =
    document.getElementById("profileModal");

const profileForm =
    document.getElementById("profileForm");


async function getCurrentProfile() {

    const response = await fetch(
        "/api/profile",
        {
            credentials: "same-origin"
        }
    );

    if (!response.ok) {
        return null;
    }

    return await response.json();
}


async function openParticipantEvent(eventId) {

    const profile =
        await getCurrentProfile();

    if (!profile) {
        openModal(loginModal);
        return;
    }

    if (profile.role !== "Participant") {

        alert(
            "Only Participant accounts can enrol in events."
        );

        return;
    }

    selectedEventId = eventId;

    eventEnrolmentMessage.className =
        "form-message";

    eventEnrolmentMessage.textContent = "";

    try {

        const [
            eventResponse,
            categoryResponse
        ] = await Promise.all([
            fetch(`/api/events/${eventId}`),

            fetch(
                `/api/events/${eventId}/categories`
            )
        ]);

        if (
            !eventResponse.ok ||
            !categoryResponse.ok
        ) {
            throw new Error();
        }

        const raceEvent =
            await eventResponse.json();

        const categories =
            await categoryResponse.json();


        document
            .getElementById(
                "enrolEventTitle"
            )
            .textContent =
            raceEvent.name;


        document
            .getElementById(
                "enrolEventMeta"
            )
            .textContent =
            `${raceEvent.location} • ${raceEvent.distance} km • ${raceEvent.eventType}`;


        if (!categories.length) {

            eventCategorySelect.innerHTML =
                `
                <option value="">
                    No categories available
                </option>
                `;

            eventCategorySelect.disabled =
                true;
        }
        else {

            eventCategorySelect.disabled =
                false;

            eventCategorySelect.innerHTML =
                categories
                    .map(
                        category => `
                        <option
                            value="${category.eventCategoryId}">
                            ${escapeParticipant(
                                category.name
                            )}
                            (${escapeParticipant(
                                category.categoryType
                            )})
                        </option>
                        `
                    )
                    .join("");
        }

        openModal(
            eventEnrolmentModal
        );
    }
    catch {

        alert(
            "The event details could not be loaded."
        );
    }
}


async function submitEnrolment(event) {

    event.preventDefault();

    eventEnrolmentMessage.className =
        "form-message";

    if (
        !selectedEventId ||
        eventCategorySelect.disabled
    ) {

        eventEnrolmentMessage.textContent =
            "No valid event category is available.";

        return;
    }

    eventEnrolmentMessage.textContent =
        "Submitting enrolment...";

    try {

        const response =
            await fetch(
                `/api/events/${selectedEventId}/enrolments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify({
                            eventCategoryId:
                                Number(
                                    eventCategorySelect.value
                                )
                        })
                }
            );

        if (!response.ok) {

            eventEnrolmentMessage.textContent =
                await readParticipantError(
                    response
                );

            return;
        }

        eventEnrolmentMessage.className =
            "form-message success";

        eventEnrolmentMessage.textContent =
            "You are now enrolled in this event.";

        setTimeout(
            () => {

                closeModal(
                    eventEnrolmentModal
                );

                eventEnrolmentMessage.textContent =
                    "";

            },
            900
        );
    }
    catch {

        eventEnrolmentMessage.textContent =
            "Unable to connect to RaceDay.";
    }
}


async function showMyEnrolments() {

    dashboard.classList.remove(
        "hidden"
    );

    dashboardTitle.textContent =
        "My Enrolments";

    dashboardMessage.textContent =
        "Events you have entered through RaceDay.";

    dashboardCards.innerHTML =
        `
        <div class="status-message">
            Loading enrolments...
        </div>
        `;

    try {

        const response =
            await fetch(
                "/api/enrolments/my",
                {
                    credentials:
                        "same-origin"
                }
            );

        if (!response.ok) {
            throw new Error();
        }

        const enrolments =
            await response.json();

        let html =
            participantBackButton();


        if (!enrolments.length) {

            html += `
                <div class="empty-panel">

                    <h3>
                        No enrolments yet
                    </h3>

                    <p>
                        Browse the available events
                        and enter your first RaceDay event.
                    </p>

                </div>
            `;
        }
        else {

            html += `
                <div class="record-list">

                    ${enrolments
                        .map(
                            item => `
                            <article class="record-item">

                                <div>

                                    <span class="record-label">
                                        ${escapeParticipant(
                                            item.categoryType
                                        )}
                                    </span>

                                    <h3>
                                        ${escapeParticipant(
                                            item.eventName
                                        )}
                                    </h3>

                                    <p>
                                        Category:
                                        ${escapeParticipant(
                                            item.categoryName
                                        )}
                                    </p>

                                </div>

                                <span
                                    class="status-pill
                                    status-${String(
                                        item.status
                                    ).toLowerCase()}">

                                    ${escapeParticipant(
                                        item.status
                                    )}

                                </span>

                            </article>
                            `
                        )
                        .join("")}

                </div>
            `;
        }

        dashboardCards.innerHTML =
            html;
    }
    catch {

        dashboardCards.innerHTML =
            `
            ${participantBackButton()}

            <div class="empty-panel">
                Unable to load enrolments.
            </div>
            `;
    }
}


async function showMyResults() {

    dashboard.classList.remove(
        "hidden"
    );

    dashboardTitle.textContent =
        "My Results";

    dashboardMessage.textContent =
        "Your published RaceDay performance history.";

    dashboardCards.innerHTML =
        `
        <div class="status-message">
            Loading results...
        </div>
        `;

    try {

        const response =
            await fetch(
                "/api/results/my",
                {
                    credentials:
                        "same-origin"
                }
            );

        if (!response.ok) {
            throw new Error();
        }

        const results =
            await response.json();

        let html =
            participantBackButton();


        if (!results.length) {

            html += `
                <div class="empty-panel">

                    <h3>
                        No published results yet
                    </h3>

                    <p>
                        Your race results will appear
                        here after an Organiser
                        publishes them.
                    </p>

                </div>
            `;
        }
        else {

            html += `
                <div class="record-list">

                    ${results
                        .map(
                            result => `
                            <article
                                class="record-item result-item">

                                <div>

                                    <span class="record-label">
                                        ${escapeParticipant(
                                            result.categoryName
                                        )}
                                    </span>

                                    <h3>
                                        ${escapeParticipant(
                                            result.eventName
                                        )}
                                    </h3>

                                </div>

                                <div class="result-stats">

                                    <div>

                                        <strong>
                                            ${formatFinishTime(
                                                result.finishTime
                                            )}
                                        </strong>

                                        <span>
                                            Finish Time
                                        </span>

                                    </div>

                                    <div>

                                        <strong>
                                            #${result.finishingPosition}
                                        </strong>

                                        <span>
                                            Position
                                        </span>

                                    </div>

                                </div>

                            </article>
                            `
                        )
                        .join("")}

                </div>
            `;
        }

        dashboardCards.innerHTML =
            html;
    }
    catch {

        dashboardCards.innerHTML =
            `
            ${participantBackButton()}

            <div class="empty-panel">
                Unable to load results.
            </div>
            `;
    }
}


async function openProfileEditor() {

    try {

        const response =
            await fetch(
                "/api/profile",
                {
                    credentials:
                        "same-origin"
                }
            );

        if (!response.ok) {
            throw new Error();
        }

        const profile =
            await response.json();


        document
            .getElementById(
                "profileFirstName"
            )
            .value =
            profile.firstName;


        document
            .getElementById(
                "profileLastName"
            )
            .value =
            profile.lastName;


        document
            .getElementById(
                "profileEmail"
            )
            .value =
            profile.email;


        document
            .getElementById(
                "profileRole"
            )
            .value =
            profile.role;


        document
            .getElementById(
                "profilePhone"
            )
            .value =
            profile.phoneNumber;


        document
            .getElementById(
                "profileMessage"
            )
            .textContent = "";


        openModal(
            profileModal
        );
    }
    catch {

        alert(
            "Your profile could not be loaded."
        );
    }
}


async function updateProfile(event) {

    event.preventDefault();

    const message =
        document.getElementById(
            "profileMessage"
        );

    message.className =
        "form-message";

    message.textContent =
        "Saving profile...";


    const body = {

        firstName:
            document
                .getElementById(
                    "profileFirstName"
                )
                .value,

        lastName:
            document
                .getElementById(
                    "profileLastName"
                )
                .value,

        phoneNumber:
            document
                .getElementById(
                    "profilePhone"
                )
                .value
    };


    try {

        const response =
            await fetch(
                "/api/profile",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        if (!response.ok) {

            message.textContent =
                await readParticipantError(
                    response
                );

            return;
        }


        const data =
            await response.json();


        state.user =
            data.user;


        accountName.textContent =
            `${data.user.firstName} ${data.user.lastName}`;


        message.className =
            "form-message success";


        message.textContent =
            "Profile updated successfully.";


        setTimeout(
            () => {

                closeModal(
                    profileModal
                );

                message.textContent =
                    "";

            },
            800
        );
    }
    catch {

        message.textContent =
            "Unable to save your profile.";
    }
}


function showParticipantHome() {

    dashboard.classList.remove(
        "hidden"
    );

    dashboardTitle.textContent =
        "Participant Dashboard";

    dashboardMessage.textContent =
        "Manage your RaceDay entries, results and profile.";


    dashboardCards.innerHTML = `

        <article class="dashboard-card action-card">

            <div class="card-icon">
                🏁
            </div>

            <h3>
                My Enrolments
            </h3>

            <p>
                View the events and categories
                you are currently entered in.
            </p>

            <button
                class="button button-primary"
                data-participant-action="enrolments">

                View Enrolments

            </button>

        </article>


        <article class="dashboard-card action-card">

            <div class="card-icon">
                🏆
            </div>

            <h3>
                My Results
            </h3>

            <p>
                View your published finish times
                and finishing positions.
            </p>

            <button
                class="button button-primary"
                data-participant-action="results">

                View Results

            </button>

        </article>


        <article class="dashboard-card action-card">

            <div class="card-icon">
                👤
            </div>

            <h3>
                My Profile
            </h3>

            <p>
                Review and update your RaceDay
                account information.
            </p>

            <button
                class="button button-light"
                data-participant-action="profile">

                Edit Profile

            </button>

        </article>
    `;
}


function participantBackButton() {

    return `
        <div class="panel-toolbar">

            <button
                class="button button-light"
                data-participant-action="home">

                ← Back to Dashboard

            </button>

        </div>
    `;
}


function formatFinishTime(value) {

    if (!value) {
        return "--";
    }

    return String(value)
        .split(".")[0];
}


function escapeParticipant(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


async function readParticipantError(
    response
) {

    try {

        const data =
            await response.json();

        if (data.message) {
            return data.message;
        }

        if (data.errors) {

            return Object
                .values(
                    data.errors
                )
                .flat()
                .join(" ");
        }

        return "Something went wrong.";
    }
    catch {

        return "Something went wrong.";
    }
}


/* Participant event actions */

document.addEventListener(
    "click",
    async event => {

        const enrolButton =
            event.target.closest(
                "[data-enrol-event]"
            );


        if (enrolButton) {

            await openParticipantEvent(
                Number(
                    enrolButton
                        .dataset
                        .enrolEvent
                )
            );

            return;
        }


        const actionButton =
            event.target.closest(
                "[data-participant-action]"
            );


        if (!actionButton) {
            return;
        }


        const action =
            actionButton
                .dataset
                .participantAction;


        if (action === "home") {
            showParticipantHome();
        }


        if (action === "enrolments") {
            await showMyEnrolments();
        }


        if (action === "results") {
            await showMyResults();
        }


        if (action === "profile") {
            await openProfileEditor();
        }
    }
);


eventEnrolmentForm.addEventListener(
    "submit",
    submitEnrolment
);


profileForm.addEventListener(
    "submit",
    updateProfile
);