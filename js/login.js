// Gestion de l'affichage/masquage du mot de passe
document.getElementById('passwordToggle').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
    this.classList.toggle('ri-eye-fill');
    this.classList.toggle('ri-eye-off-fill');
});

// Gestion de la soumission du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêcher la soumission par défaut

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        // Récupérer les utilisateurs depuis login.json
        const response = await fetch('data/login.json');
        if (!response.ok) throw new Error('Impossible de charger les données utilisateurs');
        const users = await response.json();

        // Recherche de l'utilisateur correspondant
        const user = users.find(u => u.username === email && u.password === password);

        if (user) {
            // Stocker les informations de l'utilisateur connecté
            localStorage.setItem('loggedInUserEmail', user.username);
            localStorage.setItem('role', user.role);

            // Redirection selon le rôle
            if (user.role === 'admin') {
                window.location.href = 'Acceuil.html';
            } else if (user.role === 'student') {
                window.location.href = 'events.html';
            }
        } else {
            // Afficher un message si l'utilisateur n'est pas trouvé
            alert('Identifiants incorrects. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur:', error.message);
        alert('Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.');
    }
});
