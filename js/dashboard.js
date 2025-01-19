document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {
    try {
        const response = await fetch("data/events.json");
        if (!response.ok) throw new Error("Erreur lors du chargement des événements.");
        const events = await response.json();

        // Calcul des statistiques
        const totalEvents = events.length;
        const totalParticipants = events.reduce((sum, event) => sum + (event.registrations?.length || 0), 0);
        const maxParticipantsEvent = events.reduce((maxEvent, event) => 
            (event.registrations?.length || 0) > (maxEvent.registrations?.length || 0) ? event : maxEvent, {});

        // Mise à jour des éléments HTML
        document.getElementById("totalEvents").textContent = totalEvents;
        document.getElementById("totalParticipants").textContent = totalParticipants;
        document.getElementById("maxParticipantsEvent").textContent = maxParticipantsEvent.name || "N/A";

        // Préparation des données pour les graphiques
        const eventsByMonth = {};
        const participantsByEvent = [];

        events.forEach(event => {
            const month = new Date(event.date).getMonth();
            eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
            participantsByEvent.push({ name: event.name, participants: event.registrations?.length || 0 });
        });

        // Création des graphiques
        createEventsByMonthChart(eventsByMonth);
        createParticipantsByEventChart(participantsByEvent);

    } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des statistiques.");
    }
}

function createEventsByMonthChart(eventsByMonth) {
    const ctx = document.getElementById('eventsByMonthChart').getContext('2d');
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(eventsByMonth).map(month => monthNames[month]),
            datasets: [{
                label: 'Événements par Mois',
                data: Object.values(eventsByMonth),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
function createParticipantsByEventChart(participantsByEvent) {
    const ctx = document.getElementById('participantsByEventChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: participantsByEvent.map(event => event.name),
            datasets: [{
                label: 'Participants par Événement',
                data: participantsByEvent.map(event => event.participants),
                backgroundColor: participantsByEvent.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}
