function organiserBackButton() {
    return `
        <div class="panel-toolbar">
            <button
                class="button button-light"
                data-organiser-action="home">
                ← Back to Dashboard
            </button>
        </div>
    `;
}


function getOwnEvents() {
    if (!state.user) {
        return [];
    }

    return state.events.filter(
        event =>
            Number(event.organiserId) ===
            Number(state.user.userId)
    );
}


function showOrganiserHome() {
    dashboard.classList.remove("hidden");

    dashboardTitle.textContent =
        "Organiser Dashboard";

    dashboardMessage.textContent =
        "Manage your events, participants and race results.";

    dashboardCards.innerHTML = `

        <article class="dashboard-card action-card">

            <h3>Create Event</h3>

            <p>
                Create a new running, walking
                or cycling event.
            </p>

            <button
                class="button button-primary"
                data-organiser-action="create-event">
                Create Event
            </button>

        </article>


        <article class="dashboard-card action-card">

            <h3>Manage Events</h3>

            <p>
                View and edit events that
                belong to your account.
            </p>

            <button
                class="button button-primary"
                data-organiser-action="events">
                Manage Events
            </button>

        </article>


        <article class="dashboard-card action-card">

            <h3>Categories</h3>

            <p>
                Create categories and assign
                them to your events.
            </p>

            <button
                class="button button-light"
                data-organiser-action="categories">
                Manage Categories
            </button>

        </article>


        <article class="dashboard-card action-card">

            <h3>Enrolments</h3>

            <p>
                View participants and update
                their enrolment status.
            </p>

            <button
                class="button button-light"
                data-organiser-action="enrolments">
                Manage Enrolments
            </button>

        </article>


        <article class="dashboard-card action-card">

            <h3>Race Results</h3>

            <p>
                Capture finish times and
                publish race results.
            </p>

            <button
                class="button button-primary"
                data-organiser-action="results">
                Manage Results
            </button>

        </article>


        <article class="dashboard-card action-card">

            <h3>My Profile</h3>

            <p>
                Review and update your
                Organiser account.
            </p>

            <button
                class="button button-light"
                data-organiser-action="profile">
                Edit Profile
            </button>

        </article>
    `;

    dashboard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function showCreateEvent() {
    dashboardTitle.textContent =
        "Create Event";

    dashboardMessage.textContent =
        "Add a new RaceDay event.";

    dashboardCards.innerHTML = `
        ${organiserBackButton()}

        <div class="manager-panel">

            <form id="createEventForm">

                <div class="form-row">

                    <label>
                        Event name

                        <input
                            id="createEventName"
                            type="text"
                            required>
                    </label>

                    <label>
                        Event type

                        <select
                            id="createEventType"
                            required>

                            <option value="Run">
                                Run
                            </option>

                            <option value="Walk">
                                Walk
                            </option>

                            <option value="Cycle">
                                Cycle
                            </option>

                        </select>
                    </label>

                </div>


                <label>
                    Description

                    <input
                        id="createEventDescription"
                        type="text"
                        required>
                </label>


                <div class="form-row">

                    <label>
                        Date and time

                        <input
                            id="createEventDate"
                            type="datetime-local"
                            required>
                    </label>

                    <label>
                        Distance (km)

                        <input
                            id="createEventDistance"
                            type="number"
                            min="0.1"
                            step="0.1"
                            required>
                    </label>

                </div>


                <label>
                    Location

                    <input
                        id="createEventLocation"
                        type="text"
                        required>
                </label>


                <div
                    id="createEventMessage"
                    class="form-message">
                </div>


                <button
                    type="submit"
                    class="button button-primary">
                    Create Event
                </button>

            </form>

        </div>
    `;
}


async function submitCreateEvent(form) {
    const message =
        document.getElementById(
            "createEventMessage"
        );

    message.className =
        "form-message";

    message.textContent =
        "Creating event...";

    const body = {
        name:
            document.getElementById(
                "createEventName"
            ).value,

        description:
            document.getElementById(
                "createEventDescription"
            ).value,

        eventDate:
            document.getElementById(
                "createEventDate"
            ).value,

        location:
            document.getElementById(
                "createEventLocation"
            ).value,

        distance:
            Number(
                document.getElementById(
                    "createEventDistance"
                ).value
            ),

        eventType:
            document.getElementById(
                "createEventType"
            ).value
    };

    try {
        const response =
            await fetch(
                "/api/events",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(body)
                }
            );

        if (!response.ok) {
            message.textContent =
                await readOrganiserError(
                    response
                );

            return;
        }

        message.className =
            "form-message success";

        message.textContent =
            "Event created successfully.";

        form.reset();

        await loadEvents();

        setTimeout(
            showManageEvents,
            700
        );
    }
    catch {
        message.textContent =
            "Unable to create the event.";
    }
}


async function showManageEvents() {
    await loadEvents();

    const events =
        getOwnEvents();

    dashboardTitle.textContent =
        "Manage Events";

    dashboardMessage.textContent =
        "Events created by your Organiser account.";

    let html =
        organiserBackButton();

    if (!events.length) {
        html += `
            <div class="empty-panel">
                <h3>No events yet</h3>

                <p>
                    Create your first RaceDay event.
                </p>

                <button
                    class="button button-primary"
                    data-organiser-action="create-event">
                    Create Event
                </button>
            </div>
        `;
    }
    else {
        html += `
            <div class="manager-list">

                ${events.map(
                    event => `
                    <article class="manager-row">

                        <div>
                            <span class="record-label">
                                ${escapeOrganiser(
                                    event.eventType
                                )}
                            </span>

                            <h3>
                                ${escapeOrganiser(
                                    event.name
                                )}
                            </h3>

                            <p>
                                ${escapeOrganiser(
                                    event.location
                                )}
                                ·
                                ${event.distance} km
                                ·
                                ${formatDate(
                                    event.eventDate
                                )}
                            </p>
                        </div>

                        <div class="manager-actions">

                            <button
                                class="button button-light"
                                data-edit-event="${event.eventId}">
                                Edit
                            </button>

                            <button
                                class="button button-danger"
                                data-delete-event="${event.eventId}">
                                Delete
                            </button>

                        </div>

                    </article>
                    `
                ).join("")}

            </div>
        `;
    }

    dashboardCards.innerHTML =
        html;
}


function showEditEvent(eventId) {
    const raceEvent =
        state.events.find(
            item =>
                Number(item.eventId) ===
                Number(eventId)
        );

    if (!raceEvent) {
        return;
    }

    dashboardTitle.textContent =
        "Edit Event";

    dashboardMessage.textContent =
        raceEvent.name;

    dashboardCards.innerHTML = `
        ${organiserBackButton()}

        <div class="manager-panel">

            <form
                id="editEventForm"
                data-event-id="${raceEvent.eventId}">

                <div class="form-row">

                    <label>
                        Event name

                        <input
                            id="editEventName"
                            value="${escapeAttribute(
                                raceEvent.name
                            )}"
                            required>
                    </label>


                    <label>
                        Event type

                        <select
                            id="editEventType"
                            required>

                            <option
                                value="Run"
                                ${raceEvent.eventType === "Run"
                                    ? "selected"
                                    : ""}>
                                Run
                            </option>

                            <option
                                value="Walk"
                                ${raceEvent.eventType === "Walk"
                                    ? "selected"
                                    : ""}>
                                Walk
                            </option>

                            <option
                                value="Cycle"
                                ${raceEvent.eventType === "Cycle"
                                    ? "selected"
                                    : ""}>
                                Cycle
                            </option>

                        </select>
                    </label>

                </div>


                <label>
                    Description

                    <input
                        id="editEventDescription"
                        value="${escapeAttribute(
                            raceEvent.description
                        )}"
                        required>
                </label>


                <div class="form-row">

                    <label>
                        Date and time

                        <input
                            id="editEventDate"
                            type="datetime-local"
                            value="${formatDateTimeInput(
                                raceEvent.eventDate
                            )}"
                            required>
                    </label>

                    <label>
                        Distance (km)

                        <input
                            id="editEventDistance"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value="${raceEvent.distance}"
                            required>
                    </label>

                </div>


                <label>
                    Location

                    <input
                        id="editEventLocation"
                        value="${escapeAttribute(
                            raceEvent.location
                        )}"
                        required>
                </label>


                <div
                    id="editEventMessage"
                    class="form-message">
                </div>


                <button
                    type="submit"
                    class="button button-primary">
                    Save Changes
                </button>

            </form>

        </div>
    `;
}


async function submitEditEvent(form) {
    const eventId =
        Number(
            form.dataset.eventId
        );

    const message =
        document.getElementById(
            "editEventMessage"
        );

    message.textContent =
        "Saving changes...";

    const body = {
        name:
            document.getElementById(
                "editEventName"
            ).value,

        description:
            document.getElementById(
                "editEventDescription"
            ).value,

        eventDate:
            document.getElementById(
                "editEventDate"
            ).value,

        location:
            document.getElementById(
                "editEventLocation"
            ).value,

        distance:
            Number(
                document.getElementById(
                    "editEventDistance"
                ).value
            ),

        eventType:
            document.getElementById(
                "editEventType"
            ).value
    };

    const response =
        await fetch(
            `/api/events/${eventId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "same-origin",

                body:
                    JSON.stringify(body)
            }
        );

    if (!response.ok) {
        message.textContent =
            await readOrganiserError(
                response
            );

        return;
    }

    message.className =
        "form-message success";

    message.textContent =
        "Event updated successfully.";

    await loadEvents();

    setTimeout(
        showManageEvents,
        500
    );
}


async function deleteEvent(eventId) {
    const raceEvent =
        state.events.find(
            event =>
                Number(event.eventId) ===
                Number(eventId)
        );

    if (!raceEvent) {
        return;
    }

    const confirmed =
        confirm(
            `Delete "${raceEvent.name}"?`
        );

    if (!confirmed) {
        return;
    }

    const response =
        await fetch(
            `/api/events/${eventId}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );

    if (!response.ok) {
        alert(
            await readOrganiserError(
                response
            )
        );

        return;
    }

    await showManageEvents();
}


async function showCategoryManager() {
    await loadEvents();

    const ownEvents =
        getOwnEvents();

    dashboardTitle.textContent =
        "Manage Categories";

    dashboardMessage.textContent =
        "Create categories and assign them to your events.";

    dashboardCards.innerHTML = `
        ${organiserBackButton()}

        <div class="manager-grid">

            <section class="manager-panel">

                <h3>Create Category</h3>

                <form id="createCategoryForm">

                    <label>
                        Category name

                        <input
                            id="categoryName"
                            placeholder="10km"
                            required>
                    </label>

                    <label>
                        Category type

                        <input
                            id="categoryType"
                            placeholder="Distance"
                            required>
                    </label>

                    <label>
                        Description

                        <input
                            id="categoryDescription"
                            required>
                    </label>

                    <div
                        id="categoryCreateMessage"
                        class="form-message">
                    </div>

                    <button
                        class="button button-primary"
                        type="submit">
                        Create Category
                    </button>

                </form>

            </section>


            <section class="manager-panel">

                <h3>Event Categories</h3>

                ${
                    ownEvents.length
                    ? `
                        <label>
                            Select event

                            <select
                                id="categoryEventSelect">

                                ${ownEvents.map(
                                    event => `
                                    <option
                                        value="${event.eventId}">
                                        ${escapeOrganiser(
                                            event.name
                                        )}
                                    </option>
                                    `
                                ).join("")}

                            </select>
                        </label>

                        <div
                            id="eventCategoryManager">
                        </div>
                    `
                    : `
                        <p class="status-message">
                            Create an event first.
                        </p>
                    `
                }

            </section>

        </div>
    `;

    if (ownEvents.length) {
        await loadEventCategoryManager(
            ownEvents[0].eventId
        );
    }
}


async function createCategory(form) {
    const message =
        document.getElementById(
            "categoryCreateMessage"
        );

    const body = {
        name:
            document.getElementById(
                "categoryName"
            ).value,

        categoryType:
            document.getElementById(
                "categoryType"
            ).value,

        description:
            document.getElementById(
                "categoryDescription"
            ).value
    };

    const response =
        await fetch(
            "/api/categories",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "same-origin",

                body:
                    JSON.stringify(body)
            }
        );

    if (!response.ok) {
        message.textContent =
            await readOrganiserError(
                response
            );

        return;
    }

    message.className =
        "form-message success";

    message.textContent =
        "Category created.";

    form.reset();

    const select =
        document.getElementById(
            "categoryEventSelect"
        );

    if (select) {
        await loadEventCategoryManager(
            Number(select.value)
        );
    }
}


async function loadEventCategoryManager(
    eventId
) {
    const target =
        document.getElementById(
            "eventCategoryManager"
        );

    if (!target) {
        return;
    }

    target.innerHTML =
        `<p class="status-message">
            Loading categories...
         </p>`;

    const [
        allResponse,
        assignedResponse
    ] = await Promise.all([
        fetch("/api/categories"),

        fetch(
            `/api/events/${eventId}/categories`
        )
    ]);

    if (
        !allResponse.ok ||
        !assignedResponse.ok
    ) {
        target.innerHTML =
            "Unable to load categories.";

        return;
    }

    const all =
        await allResponse.json();

    const assigned =
        await assignedResponse.json();

    const assignedIds =
        new Set(
            assigned.map(
                item => item.categoryId
            )
        );

    const available =
        all.filter(
            item =>
                !assignedIds.has(
                    item.categoryId
                )
        );

    target.innerHTML = `

        <div class="manager-subsection">

            <h4>Assigned</h4>

            ${
                assigned.length
                ? assigned.map(
                    item => `
                    <div class="small-record">

                        <span>
                            ${escapeOrganiser(
                                item.name
                            )}
                            ·
                            ${escapeOrganiser(
                                item.categoryType
                            )}
                        </span>

                        <button
                            class="button button-danger"
                            data-remove-category="${item.categoryId}"
                            data-category-event="${eventId}">
                            Remove
                        </button>

                    </div>
                    `
                ).join("")
                : `
                    <p class="status-message">
                        No categories assigned.
                    </p>
                `
            }

        </div>


        <div class="manager-subsection">

            <h4>Assign Category</h4>

            ${
                available.length
                ? `
                    <select
                        id="assignCategorySelect">

                        ${available.map(
                            item => `
                            <option
                                value="${item.categoryId}">
                                ${escapeOrganiser(
                                    item.name
                                )}
                                ·
                                ${escapeOrganiser(
                                    item.categoryType
                                )}
                            </option>
                            `
                        ).join("")}

                    </select>

                    <button
                        class="button button-primary organiser-inline-button"
                        data-assign-category="${eventId}">
                        Assign
                    </button>
                `
                : `
                    <p class="status-message">
                        All categories are already assigned.
                    </p>
                `
            }

        </div>
    `;
}


async function assignCategory(
    eventId
) {
    const select =
        document.getElementById(
            "assignCategorySelect"
        );

    if (!select) {
        return;
    }

    const response =
        await fetch(
            `/api/events/${eventId}/categories`,
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
                        categoryId:
                            Number(
                                select.value
                            )
                    })
            }
        );

    if (!response.ok) {
        alert(
            await readOrganiserError(
                response
            )
        );

        return;
    }

    await loadEventCategoryManager(
        eventId
    );
}


async function removeCategory(
    eventId,
    categoryId
) {
    const response =
        await fetch(
            `/api/events/${eventId}/categories/${categoryId}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );

    if (!response.ok) {
        alert(
            await readOrganiserError(
                response
            )
        );

        return;
    }

    await loadEventCategoryManager(
        eventId
    );
}


async function showEnrolmentManager() {
    await loadEvents();

    const events =
        getOwnEvents();

    dashboardTitle.textContent =
        "Manage Enrolments";

    dashboardMessage.textContent =
        "View Participants and update their event status.";

    dashboardCards.innerHTML = `
        ${organiserBackButton()}

        <div class="manager-panel">

            ${
                events.length
                ? `
                    <label>
                        Select event

                        <select
                            id="enrolmentEventSelect">

                            ${events.map(
                                event => `
                                <option
                                    value="${event.eventId}">
                                    ${escapeOrganiser(
                                        event.name
                                    )}
                                </option>
                                `
                            ).join("")}

                        </select>
                    </label>

                    <div
                        id="enrolmentManagerList">
                    </div>
                `
                : `
                    <div class="empty-panel">
                        Create an event first.
                    </div>
                `
            }

        </div>
    `;

    if (events.length) {
        await loadEventEnrolments(
            events[0].eventId
        );
    }
}


async function loadEventEnrolments(
    eventId
) {
    const target =
        document.getElementById(
            "enrolmentManagerList"
        );

    target.innerHTML =
        `<p class="status-message">
            Loading enrolments...
         </p>`;

    const response =
        await fetch(
            `/api/events/${eventId}/enrolments`,
            {
                credentials:
                    "same-origin"
            }
        );

    if (!response.ok) {
        target.innerHTML =
            "Unable to load enrolments.";

        return;
    }

    const enrolments =
        await response.json();

    if (!enrolments.length) {
        target.innerHTML =
            `
            <div class="empty-panel">
                No Participants have enrolled
                in this event yet.
            </div>
            `;

        return;
    }

    target.innerHTML =
        `
        <div class="manager-list">

            ${enrolments.map(
                item => `
                <article class="manager-row">

                    <div>

                        <span class="record-label">
                            ${escapeOrganiser(
                                item.categoryName
                            )}
                        </span>

                        <h3>
                            ${escapeOrganiser(
                                item.participantFirstName
                            )}
                            ${escapeOrganiser(
                                item.participantLastName
                            )}
                        </h3>

                        <p>
                            ${escapeOrganiser(
                                item.participantEmail
                            )}
                        </p>

                    </div>


                    <div class="status-editor">

                        <select
                            data-status-enrolment="${item.enrolmentId}">

                            <option
                                value="Pending"
                                ${item.status === "Pending"
                                    ? "selected"
                                    : ""}>
                                Pending
                            </option>

                            <option
                                value="Confirmed"
                                ${item.status === "Confirmed"
                                    ? "selected"
                                    : ""}>
                                Confirmed
                            </option>

                            <option
                                value="Cancelled"
                                ${item.status === "Cancelled"
                                    ? "selected"
                                    : ""}>
                                Cancelled
                            </option>

                        </select>

                    </div>

                </article>
                `
            ).join("")}

        </div>
        `;
}


async function updateEnrolmentStatus(
    enrolmentId,
    status
) {
    const response =
        await fetch(
            `/api/enrolments/${enrolmentId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials:
                    "same-origin",

                body:
                    JSON.stringify({
                        status
                    })
            }
        );

    if (!response.ok) {
        alert(
            await readOrganiserError(
                response
            )
        );
    }
}


async function showResultsManager() {
    await loadEvents();

    const events =
        getOwnEvents();

    dashboardTitle.textContent =
        "Race Results";

    dashboardMessage.textContent =
        "Capture finish times, positions and publish results.";

    dashboardCards.innerHTML = `
        ${organiserBackButton()}

        <div class="manager-panel">

            ${
                events.length
                ? `
                    <label>
                        Select event

                        <select
                            id="resultEventSelect">

                            ${events.map(
                                event => `
                                <option
                                    value="${event.eventId}">
                                    ${escapeOrganiser(
                                        event.name
                                    )}
                                </option>
                                `
                            ).join("")}

                        </select>
                    </label>

                    <div
                        id="resultManagerList">
                    </div>
                `
                : `
                    <div class="empty-panel">
                        Create an event first.
                    </div>
                `
            }

        </div>
    `;

    if (events.length) {
        await loadEventResultManager(
            events[0].eventId
        );
    }
}


async function loadEventResultManager(
    eventId
) {
    const target =
        document.getElementById(
            "resultManagerList"
        );

    target.innerHTML =
        `<p class="status-message">
            Loading results...
         </p>`;

    const [
        enrolmentResponse,
        resultResponse
    ] = await Promise.all([
        fetch(
            `/api/events/${eventId}/enrolments`,
            {
                credentials:
                    "same-origin"
            }
        ),

        fetch(
            `/api/events/${eventId}/results`,
            {
                credentials:
                    "same-origin"
            }
        )
    ]);

    if (
        !enrolmentResponse.ok ||
        !resultResponse.ok
    ) {
        target.innerHTML =
            "Unable to load result information.";

        return;
    }

    const enrolments =
        await enrolmentResponse.json();

    const results =
        await resultResponse.json();

    const resultByEnrolment =
        new Map(
            results.map(
                result => [
                    result.enrolmentId,
                    result
                ]
            )
        );

    if (!enrolments.length) {
        target.innerHTML =
            `
            <div class="empty-panel">
                No enrolments are available.
            </div>
            `;

        return;
    }

    target.innerHTML = `
        <div class="manager-list">

            ${enrolments.map(
                enrolment => {

                    const result =
                        resultByEnrolment.get(
                            enrolment.enrolmentId
                        );

                    if (result) {
                        return `
                            <article class="manager-row">

                                <div>

                                    <span class="record-label">
                                        ${escapeOrganiser(
                                            enrolment.categoryName
                                        )}
                                    </span>

                                    <h3>
                                        ${escapeOrganiser(
                                            enrolment.participantFirstName
                                        )}
                                        ${escapeOrganiser(
                                            enrolment.participantLastName
                                        )}
                                    </h3>

                                    <p>
                                        Time:
                                        ${formatOrganiserTime(
                                            result.finishTime
                                        )}
                                        ·
                                        Position:
                                        #${result.finishingPosition}
                                    </p>

                                </div>


                                ${
                                    result.isPublished
                                    ? `
                                        <span
                                            class="status-pill status-confirmed">
                                            Published
                                        </span>
                                    `
                                    : `
                                        <button
                                            class="button button-primary"
                                            data-publish-result="${result.resultId}">
                                            Publish
                                        </button>
                                    `
                                }

                            </article>
                        `;
                    }


                    return `
                        <article class="manager-row">

                            <div>

                                <span class="record-label">
                                    ${escapeOrganiser(
                                        enrolment.categoryName
                                    )}
                                </span>

                                <h3>
                                    ${escapeOrganiser(
                                        enrolment.participantFirstName
                                    )}
                                    ${escapeOrganiser(
                                        enrolment.participantLastName
                                    )}
                                </h3>

                            </div>


                            <form
                                class="result-capture-form"
                                data-result-enrolment="${enrolment.enrolmentId}">

                                <input
                                    name="finishTime"
                                    placeholder="00:52:18"
                                    required>

                                <input
                                    name="position"
                                    type="number"
                                    min="1"
                                    placeholder="Position"
                                    required>

                                <button
                                    class="button button-primary"
                                    type="submit">
                                    Save Result
                                </button>

                            </form>

                        </article>
                    `;
                }
            ).join("")}

        </div>
    `;
}


async function captureResult(
    form
) {
    const enrolmentId =
        Number(
            form.dataset.resultEnrolment
        );

    const finishTime =
        form.querySelector(
            '[name="finishTime"]'
        ).value;

    const position =
        Number(
            form.querySelector(
                '[name="position"]'
            ).value
        );

    const response =
        await fetch(
            `/api/enrolments/${enrolmentId}/result`,
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
                        finishTime,
                        finishingPosition:
                            position
                    })
            }
        );

    if (!response.ok) {
        alert(
            await readOrganiserError(
                response
            )
        );

        return;
    }

    const select =
        document.getElementById(
            "resultEventSelect"
        );

    await loadEventResultManager(
        Number(select.value)
    );
}


async function publishResult(
    resultId
) {
    const response =
        await fetch(
            `/api/results/${resultId}/publish`,
            {
                method: "PUT",

                credentials:
                    "same-origin"
            }
        );

    if (!response.ok) {
        alert(
            await readOrganiserError(
                response
            )
        );

        return;
    }

    const select =
        document.getElementById(
            "resultEventSelect"
        );

    await loadEventResultManager(
        Number(select.value)
    );
}


function escapeOrganiser(value) {
    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function escapeAttribute(value) {
    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


function formatDateTimeInput(value) {
    const date =
        new Date(value);

    const offset =
        date.getTimezoneOffset();

    const local =
        new Date(
            date.getTime() -
            offset * 60000
        );

    return local
        .toISOString()
        .slice(0, 16);
}


function formatOrganiserTime(value) {
    if (!value) {
        return "--";
    }

    return String(value)
        .split(".")[0];
}


async function readOrganiserError(
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
                .values(data.errors)
                .flat()
                .join(" ");
        }

        return "Something went wrong.";
    }
    catch {
        return "Something went wrong.";
    }
}


/* Organiser navigation */

dashboardButton.addEventListener(
    "click",
    () => {
        if (
            state.user &&
            state.user.role ===
            "Organiser"
        ) {
            showOrganiserHome();
        }
    }
);


document.addEventListener(
    "click",
    async event => {

        const actionButton =
            event.target.closest(
                "[data-organiser-action]"
            );

        if (actionButton) {
            const action =
                actionButton.dataset
                    .organiserAction;

            if (action === "home") {
                showOrganiserHome();
            }

            if (
                action ===
                "create-event"
            ) {
                showCreateEvent();
            }

            if (action === "events") {
                await showManageEvents();
            }

            if (
                action ===
                "categories"
            ) {
                await showCategoryManager();
            }

            if (
                action ===
                "enrolments"
            ) {
                await showEnrolmentManager();
            }

            if (action === "results") {
                await showResultsManager();
            }

            if (action === "profile") {
                await openProfileEditor();
            }

            return;
        }


        const editButton =
            event.target.closest(
                "[data-edit-event]"
            );

        if (editButton) {
            showEditEvent(
                Number(
                    editButton.dataset
                        .editEvent
                )
            );

            return;
        }


        const deleteButton =
            event.target.closest(
                "[data-delete-event]"
            );

        if (deleteButton) {
            await deleteEvent(
                Number(
                    deleteButton.dataset
                        .deleteEvent
                )
            );

            return;
        }


        const assignButton =
            event.target.closest(
                "[data-assign-category]"
            );

        if (assignButton) {
            await assignCategory(
                Number(
                    assignButton.dataset
                        .assignCategory
                )
            );

            return;
        }


        const removeButton =
            event.target.closest(
                "[data-remove-category]"
            );

        if (removeButton) {
            await removeCategory(
                Number(
                    removeButton.dataset
                        .categoryEvent
                ),

                Number(
                    removeButton.dataset
                        .removeCategory
                )
            );

            return;
        }


        const publishButton =
            event.target.closest(
                "[data-publish-result]"
            );

        if (publishButton) {
            await publishResult(
                Number(
                    publishButton.dataset
                        .publishResult
                )
            );
        }
    }
);


document.addEventListener(
    "change",
    async event => {

        if (
            event.target.id ===
            "categoryEventSelect"
        ) {
            await loadEventCategoryManager(
                Number(
                    event.target.value
                )
            );
        }


        if (
            event.target.id ===
            "enrolmentEventSelect"
        ) {
            await loadEventEnrolments(
                Number(
                    event.target.value
                )
            );
        }


        if (
            event.target.id ===
            "resultEventSelect"
        ) {
            await loadEventResultManager(
                Number(
                    event.target.value
                )
            );
        }


        if (
            event.target.matches(
                "[data-status-enrolment]"
            )
        ) {
            await updateEnrolmentStatus(
                Number(
                    event.target.dataset
                        .statusEnrolment
                ),

                event.target.value
            );
        }
    }
);


document.addEventListener(
    "submit",
    async event => {

        if (
            event.target.id ===
            "createEventForm"
        ) {
            event.preventDefault();

            await submitCreateEvent(
                event.target
            );

            return;
        }


        if (
            event.target.id ===
            "editEventForm"
        ) {
            event.preventDefault();

            await submitEditEvent(
                event.target
            );

            return;
        }


        if (
            event.target.id ===
            "createCategoryForm"
        ) {
            event.preventDefault();

            await createCategory(
                event.target
            );

            return;
        }


        if (
            event.target.matches(
                ".result-capture-form"
            )
        ) {
            event.preventDefault();

            await captureResult(
                event.target
            );
        }
    }
);