const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Helper functions for file operations with error handling
const loadData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return [];
        }
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error parsing JSON in file ${filePath}:`, error);
        return [];
    }
};

const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
    }
};

// Load or initialize counter
const loadCounter = () => {
    const counterPath = path.join(__dirname, 'counter.json');
    let counterData = loadData(counterPath);
    if (!counterData || !counterData.eventId || !counterData.registrationId) {
        counterData = { eventId: 1, registrationId: 1 };
        saveData(counterPath, counterData);
    }
    return counterData;
};

// Update counter
const updateCounter = (counterData) => {
    const counterPath = path.join(__dirname, 'counter.json');
    saveData(counterPath, counterData);
};

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/data/profile.json', (req, res) => {
    fs.readFile(path.join(__dirname, 'public', 'data', 'profile.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la lecture du fichier' });
        }
        res.json(JSON.parse(data));
    });
});

// Route pour mettre à jour les données du profil
app.put('/api/profile', (req, res) => {
    const updatedProfile = req.body;
    fs.writeFile(path.join(__dirname, 'public', 'data', 'profile.json'), JSON.stringify(updatedProfile, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du fichier' });
        }
        res.json({ message: 'Profil mis à jour avec succès' });
    });
});
// Event routes
app.get('/api/events', (req, res) => {
    const events = loadData(path.join(__dirname, 'events.json'));
    res.json(events);
});

app.get('/api/events/:id', (req, res) => {
    const events = loadData(path.join(__dirname, 'events.json'));
    const event = events.find(e => e.id === parseInt(req.params.id));
    if (event) {
        res.json(event);
    } else {
        res.status(404).send({ error: 'Événement introuvable' });
    }
});

app.post('/api/events', (req, res) => {
    const { name, date, location, maxParticipants } = req.body;

    if (!name || !date || !location || !maxParticipants) {
        return res.status(400).send({ error: 'Tous les champs (name, date, location, maxParticipants) sont requis.' });
    }

    const events = loadData(path.join(__dirname, 'events.json'));
    const counterData = loadCounter();
    
    const newEvent = { 
        id: counterData.eventId++, 
        name, 
        date, 
        location, 
        maxParticipants, 
        registrations: [] 
    };

    events.push(newEvent);
    saveData(path.join(__dirname, 'events.json'), events);
    
    // Update counter for next event ID
    updateCounter(counterData);
    
    res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
    const { name, date, location, maxParticipants, description, registrations } = req.body;
    const events = loadData(path.join(__dirname, 'events.json'));
    const index = events.findIndex(e => e.id === parseInt(req.params.id));

    if (index !== -1) {
        // Mettre à jour les données de l'événement
        events[index] = { 
            ...events[index], 
            name, 
            date, 
            location, 
            maxParticipants, 
            description, 
            registrations 
        };
        saveData(path.join(__dirname, 'events.json'), events);
        res.json(events[index]);
    } else {
        res.status(404).send({ error: 'Événement introuvable' });
    }
    console.log("Événement modifié :", req.body);

});

app.delete('/api/events/:id', (req, res) => {
    const events = loadData(path.join(__dirname, 'events.json'));
    const filteredEvents = events.filter(e => e.id !== parseInt(req.params.id));

    if (events.length !== filteredEvents.length) {
        saveData(path.join(__dirname, 'events.json'), filteredEvents);
        res.sendStatus(204);
    } else {
        res.status(404).send({ error: 'Événement introuvable' });
    }
});

// Registration routes
/*app.post('/api/events/:id/registrations', (req, res) => {
    const eventId = parseInt(req.params.id);
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).send({ error: 'Tous les champs (name, email, role) sont requis.' });
    }

    const events = loadData(path.join(__dirname, 'events.json'));
    const event = events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).send({ error: 'Événement introuvable' });
    }

    const counterData = loadCounter();
    const newRegistration = { id: counterData.registrationId++, name, email, role };
    
    event.registrations.push(newRegistration);
    saveData(path.join(__dirname, 'events.json'), events);
    
    // Update counter for next registration ID
    updateCounter(counterData);
    
    res.status(201).json(newRegistration);
});
*/
app.post('/api/events/:id/registrations', (req, res) => {
    const eventId = parseInt(req.params.id);
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).send({ error: 'Tous les champs (name, email, role) sont requis.' });
    }

    const events = loadData(path.join(__dirname, 'events.json'));
    const event = events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).send({ error: 'Événement introuvable' });
    }

    const counterData = loadCounter();
    const newRegistration = { id: counterData.registrationId++, name, email, role };
    
    event.registrations.push(newRegistration);
    saveData(path.join(__dirname, 'events.json'), events);
    
    // Mettre à jour le compteur pour le prochain ID d'inscription
    updateCounter(counterData);
    
    res.status(201).json(newRegistration);
});
app.put('/api/events/:eventId/registrations/:registrationId', (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const registrationId = parseInt(req.params.registrationId);
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).send({ error: 'Tous les champs (name, email, role) sont requis.' });
    }

    const events = loadData(path.join(__dirname, 'events.json'));
    const event = events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).send({ error: 'Événement introuvable' });
    }

    const registration = event.registrations.find(r => r.id === registrationId);

    if (!registration) {
        return res.status(404).send({ error: 'Inscription introuvable' });
    }

    // Mettre à jour les détails du participant
    registration.name = name;
    registration.email = email;
    registration.role = role;

    saveData(path.join(__dirname, 'events.json'), events);
    res.json(registration);
});
app.delete('/api/events/:eventId/registrations/:registrationId', (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const registrationId = parseInt(req.params.registrationId);

    const events = loadData(path.join(__dirname, 'events.json'));
    const event = events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).send({ error: 'Événement introuvable' });
    }

    const registrationIndex = event.registrations.findIndex(r => r.id === registrationId);

    if (registrationIndex === -1) {
        return res.status(404).send({ error: 'Inscription introuvable' });
    }

    event.registrations.splice(registrationIndex, 1); // Supprimer le participant
    saveData(path.join(__dirname, 'events.json'), events);

    res.sendStatus(204);
});

// Signup route
app.post('/api/signup', (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }

    const inscriptions = loadData(path.join(__dirname, 'signup.json'));
    if (inscriptions.some(inscription => inscription.email === email)) {
        return res.status(409).send({ error: 'Cet email est déjà utilisé.' });
    }

    const counterData = loadCounter();
    const newInscription = { id: counterData.registrationId++, username, email, password, role };
    
    inscriptions.push(newInscription);
    saveData(path.join(__dirname, 'signup.json'), inscriptions);
    
    // Update counter for next registration ID
    updateCounter(counterData);
    
    res.status(201).send({ message: 'Inscription réussie!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).send({ error: 'Route non trouvée' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
