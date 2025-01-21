let events = [];
//pour le dark mode

// Charger les événements depuis un fichier JSON
async function loadEvents() {
    try {
        const response = await fetch("http://localhost:4000/api/events");
        if (!response.ok) throw new Error("Erreur lors du chargement des événements.");
        events = await response.json();
        renderEventsTable();
    } catch (error) {
        console.error("Erreur:", error.message);
        Swal.fire("Erreur", "Impossible de charger les événements.", "error");
    }
}

// Afficher les événements dans la table
function renderEventsTable() {
    const eventsTable = document.getElementById("eventsTable");
    eventsTable.innerHTML = "";

    events.forEach((event, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${event.id}</td>
            <td>${event.name}</td>
            <td>${event.date}</td>
            <td>${event.location}</td>
            <td>${event.description}</td>
            <td>${event.registrations?.length || 0} / ${event.maxParticipants}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="viewRegistrations(${event.id}) " >Voir les inscrits</button>
                <button class="btn btn-warning btn-sm" onclick="openModal(${index})">Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEvent(${index})">Supprimer</button>
            </td>
        `;
        eventsTable.appendChild(row);
    });
}

// Ouvrir le modal pour ajouter ou modifier un événement
function openModal(index = null) {
    const modal = new bootstrap.Modal(document.getElementById("eventModal"));
    const form = document.getElementById("eventForm");

    if (index !== null) {
        const event = events[index];
        form.eventId.value = event.id;
        form.eventTitle.value = event.name;
        form.eventDate.value = event.date;
        form.eventLocation.value = event.location;
        form.eventDescription.value = event.description;
        form.eventMaxParticipants.value = event.maxParticipants;

        // Charger les participants
        const participantsContainer = document.getElementById('participantsContainer');
        participantsContainer.innerHTML = ''; // Clear existing participants
        if (event.registrations) {
            event.registrations.forEach(participant => addParticipant(participant));
        }
    } else {
        form.reset();
        form.eventId.value = "";
        document.getElementById('participantsContainer').innerHTML = ''; // Clear participants
    }

    modal.show();
}

function addParticipant(participant = {}) {
    const container = document.getElementById('participantsContainer');
    
    const participantDiv = document.createElement('div');
    participantDiv.classList.add('participant-entry', 'mb-3');
    
    participantDiv.innerHTML = `
        <div class="mb-2">
            <label class="form-label">Nom</label>
            <input type="text" class="form-control participant-name" value="${participant.name || ''}" required>
        </div>
        <div class="mb-2">
            <label class="form-label">Email</label>
            <input type="email" class="form-control participant-email" value="${participant.email || ''}" required>
        </div>
        <div class="mb-2">
            <label class="form-label">Rôle</label>
            <input type="text" class="form-control participant-role" value="${participant.role || ''}" required>
        </div>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeParticipant(this)">Supprimer</button>
    `;
    
    container.appendChild(participantDiv);
}

function removeParticipant(button) {
    button.parentElement.remove();
}

// Enregistrer un événement (ajout ou modification) via l'API
async function saveEvent() {
    const form = document.getElementById("eventForm");
    const id = form.eventId.value;
    const participantsContainer = document.getElementById("participantsContainer");

    // Collecter les participants
    const participants = [];
    const participantEntries = participantsContainer.querySelectorAll(".participant-entry");
    
    participantEntries.forEach(entry => {
        const username = entry.querySelector('.participant-name').value;
        const email = entry.querySelector('.participant-email').value;
        const role = entry.querySelector('.participant-role').value;

        if (username && email && role) {
            participants.push({username, email, role });
        }
    });

    const newEvent = {
        name: form.eventTitle.value,
        date: form.eventDate.value,
        location: form.eventLocation.value,
        description: form.eventDescription.value,
        maxParticipants: parseInt(form.eventMaxParticipants.value, 10),
        registrations: participants  // Ajouter les participants à l'événement
    };

    // Validation des données de l'événement
    if (!newEvent.name || !newEvent.date || !newEvent.location || !newEvent.description || isNaN(newEvent.maxParticipants)) {
        Swal.fire("Erreur", "Veuillez remplir tous les champs correctement.", "error");
        return;
    }

    try {
        const method = id ? "PUT" : "POST";
        const url = id ? `http://localhost:4000/api/events/${id}` : "http://localhost:4000/api/events";
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEvent)
        });

        if (!response.ok) throw new Error("Erreur lors de l'enregistrement de l'événement.");

        if (!id) {
            const createdEvent = await response.json();
            events.push(createdEvent);
        }

        // Recharger les événements après l'ajout ou modification
        await loadEvents();
        bootstrap.Modal.getInstance(document.getElementById("eventModal")).hide();
        Swal.fire("Succès", "Événement enregistré avec succès !", "success");
    } catch (error) {
        console.error("Erreur:", error.message);
        Swal.fire("Erreur", "Impossible de sauvegarder l'événement.", "error");
    }
}

//pour input de recherche
function filterEvents() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById("eventsTable");
    const rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const nameCell = rows[i].getElementsByTagName("td")[1];
        if (nameCell) {
            const eventName = nameCell.textContent || nameCell.innerText;
            if (eventName.toUpperCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}
// Supprimer un événement via l'API
async function deleteEvent(index) {
    const eventId = events[index].id;

    Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "Vous ne pourrez pas revenir en arrière !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:4000/api/events/${eventId}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Erreur lors de la suppression de l'événement.");

                await loadEvents();
                Swal.fire("Supprimé !", "L'événement a été supprimé.", "success");
            } catch (error) {
                console.error("Erreur:", error.message);
                Swal.fire("Erreur", "Impossible de supprimer l'événement.", "error");
            }
        }
    });
}

// Voir les participants d'un événement
async function viewRegistrations(eventId) {
    try {
        const response = await fetch(`http://localhost:4000/api/events/${eventId}`);
        if (!response.ok) throw new Error("Erreur lors du chargement des inscrits.");

        const event = await response.json();
        const modalBody = document.getElementById("registrationsModalBody");

        if (!event.registrations || event.registrations.length === 0) {
            modalBody.innerHTML = "<p>Aucun inscrit pour cet événement.</p>";
        } else {
            modalBody.innerHTML = event.registrations
                .map(reg => `
                    <p><strong>Nom :</strong> ${reg.username}</p>
                    <p><strong>Email :</strong> ${reg.email}</p>
                    <p><strong>Role :</strong> ${reg.role}</p>
                    <hr>
                `)
                .join("");
        }

        const registrationsModal = new bootstrap.Modal(document.getElementById("registrationsModal"));
        registrationsModal.show();
    } catch (error) {
        console.error("Erreur:", error.message);
        Swal.fire("Erreur", "Impossible de charger les inscrits.", "error");
    }
}

// Télécharger les événements au format PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Liste des Événements", 10, 10);
    doc.autoTable({
        head: [["#", "Titre", "Date", "Lieu", "Participants"]],
        body: events.map(event => [
            event.id,
            event.name,
            event.date,
            event.location,
            `${event.registrations?.length || 0} / ${event.maxParticipants}`
        ]),
    });

    doc.save("events.pdf");
}
function downloadPDF2() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Liste des inscrits aux événements", 30, 30);

    // Créer un tableau plat des inscrits à partir de tous les événements
    const registrations = events.reduce((acc, event) => {
        if (event.registrations) {
            event.registrations.forEach(reg => {
                acc.push([ reg.username, reg.email, reg.role, event.name]);
            });
        }
        return acc;
    }, []);

    doc.autoTable({
        head: [[ "Nom", "Email", "Role", "Event "]],
        body: registrations,
    });

    doc.save("inscrits.pdf");
}


// Charger les événements au démarrage
document.addEventListener("DOMContentLoaded", loadEvents);
