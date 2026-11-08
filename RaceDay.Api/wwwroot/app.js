const state = {
    user: null,
    events: []
};


const loginButton =
    document.getElementById(
        "loginButton"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );

const heroRegisterButton =
    document.getElementById(
        "heroRegisterButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const dashboardButton =
    document.getElementById(
        "dashboardButton"
    );

const accountArea =
    document.getElementById(
        "accountArea"
    );

const accountName =
    document.getElementById(
        "accountName"
    );

const accountRole =
    document.getElementById(
        "accountRole"
    );

const loginModal =
    document.getElementById(
        "loginModal"
    );

const registerModal =
    document.getElementById(
        "registerModal"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const registerForm =
    document.getElementById(
        "registerForm"
    );

const eventsGrid =
    document.getElementById(
        "eventsGrid"
    );

const eventStatus =
    document.getElementById(
        "eventStatus"
    );

const dashboard =
    document.getElementById(
        "dashboard"
    );

const dashboardTitle =
    document.getElementById(
        "dashboardTitle"
    );

const dashboardMessage =
    document.getElementById(
        "dashboardMessage"
    );

const dashboardCards =
    document.getElementById(
        "dashboardCards"
    );


function openModal(modal) {
    modal.classList.remove(
        "hidden"
    );
}


function closeModal(modal) {
    modal.classList.add(
        "hidden"
    );
}


function formatDate(value) {

    const date =
        new Date(value);

    return date.toLocaleDateString(
        "en-ZA",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


async function readError(
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


async function loadCurrentUser() {

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

            state.user = null;

            updateAccountUI();

            return;
        }

        state.user =
            await response.json();

        updateAccountUI();

    }
    catch {

        state.user = null;

        updateAccountUI();
    }
}


function updateAccountUI() {

    if (!state.user) {

        loginButton
            .classList
            .remove("hidden");

        registerButton
            .classList
            .remove("hidden");

        heroRegisterButton
            .classList
            .remove("hidden");

        accountArea
            .classList
            .add("hidden");

        dashboard
            .classList
            .add("hidden");

        return;
    }


    loginButton
        .classList
        .add("hidden");

    registerButton
        .classList
        .add("hidden");

    heroRegisterButton
        .classList
        .add("hidden");

    accountArea
        .classList
        .remove("hidden");


    accountName.textContent =
        `${state.user.firstName} ${state.user.lastName}`;

    accountRole.textContent =
        state.user.role;
}


async function loadEvents() {

    eventStatus.textContent =
        "Loading events...";

    eventsGrid.innerHTML = "";

    try {

        const response =
            await fetch(
                "/api/events"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load events."
            );
        }

        state.events =
            await response.json();

        renderEvents();

    }
    catch {

        eventStatus.textContent =
            "Events could not be loaded.";
    }
}


function renderEvents() {

    if (!state.events.length) {

        eventStatus.textContent =
            "No RaceDay events are currently available.";

        return;
    }


    eventStatus.textContent = "";


    eventsGrid.innerHTML =
        state.events
            .map(
                event => {

                    const eventType =
                        escapeHtml(
                            event.eventType
                        );

                    const name =
                        escapeHtml(
                            event.name
                        );

                    const description =
                        escapeHtml(
                            event.description
                        );

                    const location =
                        escapeHtml(
                            event.location
                        );


                    return `
                        <article class="event-card">

                            <div class="event-banner">

                                <span class="event-type">
                                    ${eventType.toUpperCase()}
                                </span>

                            </div>


                            <div class="event-content">

                                <h3>
                                    ${name}
                                </h3>

                                <p>
                                    ${description}
                                </p>


                                <div class="event-meta">

                                    <span>
                                        📅
                                        ${formatDate(
                                            event.eventDate
                                        )}
                                    </span>

                                    <span>
                                        📍
                                        ${location}
                                    </span>

                                    <span>
                                        🏁
                                        ${event.distance} km
                                    </span>

                                    <span>
                                        ${eventType}
                                    </span>

                                </div>


                                <button
                                    class="button button-primary event-action-button"
                                    data-enrol-event="${event.eventId}">

                                    View Categories & Enrol

                                </button>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


async function login(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "loginMessage"
        );


    message.className =
        "form-message";

    message.textContent =
        "Logging in...";


    const body = {

        email:
            document
                .getElementById(
                    "loginEmail"
                )
                .value,

        password:
            document
                .getElementById(
                    "loginPassword"
                )
                .value
    };


    try {

        const response =
            await fetch(
                "/api/auth/login",
                {
                    method: "POST",

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
                await readError(
                    response
                );

            return;
        }


        const data =
            await response.json();


        state.user = {

            userId:
                data.userId,

            firstName:
                data.firstName,

            lastName:
                data.lastName,

            email:
                data.email,

            role:
                data.role
        };


        message.className =
            "form-message success";

        message.textContent =
            "Login successful.";


        updateAccountUI();


        setTimeout(
            () => {

                closeModal(
                    loginModal
                );

                loginForm.reset();

                message.textContent =
                    "";

            },
            500
        );

    }
    catch {

        message.textContent =
            "Unable to connect to RaceDay.";
    }
}


async function register(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "registerMessage"
        );


    message.className =
        "form-message";

    message.textContent =
        "Creating account...";


    const body = {

        firstName:
            document
                .getElementById(
                    "registerFirstName"
                )
                .value,

        lastName:
            document
                .getElementById(
                    "registerLastName"
                )
                .value,

        email:
            document
                .getElementById(
                    "registerEmail"
                )
                .value,

        phoneNumber:
            document
                .getElementById(
                    "registerPhone"
                )
                .value,

        role:
            document
                .getElementById(
                    "registerRole"
                )
                .value,

        password:
            document
                .getElementById(
                    "registerPassword"
                )
                .value
    };


    try {

        const response =
            await fetch(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        if (!response.ok) {

            message.textContent =
                await readError(
                    response
                );

            return;
        }


        message.className =
            "form-message success";

        message.textContent =
            "Account created. You can now log in.";


        registerForm.reset();


        setTimeout(
            () => {

                closeModal(
                    registerModal
                );

                message.textContent =
                    "";

                openModal(
                    loginModal
                );

            },
            700
        );

    }
    catch {

        message.textContent =
            "Unable to connect to RaceDay.";
    }
}


async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST",

                credentials:
                    "same-origin"
            }
        );

    }
    finally {

        state.user = null;

        updateAccountUI();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


function openDashboard() {

    if (!state.user) {
        return;
    }


    dashboard
        .classList
        .remove("hidden");


    if (
        state.user.role ===
        "Participant"
    ) {

        if (
            typeof showParticipantHome
            === "function"
        ) {

            showParticipantHome();
        }

        return;
    }


    dashboardTitle.textContent =
        "Organiser Dashboard";

    dashboardMessage.textContent =
        "Create events, manage participants and publish results.";


    dashboardCards.innerHTML = `

        <article class="dashboard-card">

            <div class="card-icon">
                📅
            </div>

            <h3>
                Manage Events
            </h3>

            <p>
                Create, update and manage
                RaceDay events.
            </p>

        </article>


        <article class="dashboard-card">

            <div class="card-icon">
                👥
            </div>

            <h3>
                Manage Enrolments
            </h3>

            <p>
                View participants and update
                enrolment statuses.
            </p>

        </article>


        <article class="dashboard-card">

            <div class="card-icon">
                🏆
            </div>

            <h3>
                Race Results
            </h3>

            <p>
                Capture finishing times,
                positions and publish results.
            </p>

        </article>
    `;


    dashboard.scrollIntoView({
        behavior: "smooth"
    });
}


/* Buttons */

loginButton.addEventListener(
    "click",
    () => openModal(
        loginModal
    )
);


registerButton.addEventListener(
    "click",
    () => openModal(
        registerModal
    )
);


heroRegisterButton.addEventListener(
    "click",
    () => openModal(
        registerModal
    )
);


logoutButton.addEventListener(
    "click",
    logout
);


dashboardButton.addEventListener(
    "click",
    openDashboard
);


loginForm.addEventListener(
    "submit",
    login
);


registerForm.addEventListener(
    "submit",
    register
);


document
    .getElementById(
        "refreshEventsButton"
    )
    .addEventListener(
        "click",
        loadEvents
    );


document
    .querySelectorAll(
        ".modal-close"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const modal =
                        document
                            .getElementById(
                                button.dataset.close
                            );

                    closeModal(
                        modal
                    );
                }
            );
        }
    );


document
    .querySelectorAll(
        ".modal-backdrop"
    )
    .forEach(
        backdrop => {

            backdrop.addEventListener(
                "click",
                () => {

                    closeModal(
                        backdrop.parentElement
                    );
                }
            );
        }
    );


/* Start RaceDay */

loadCurrentUser();
loadEvents();