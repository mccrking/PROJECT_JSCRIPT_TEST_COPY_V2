// Gestion de la soumission du formulaire d'inscription
document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Récupérer les valeurs des champs
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const role = document.getElementById('role').value;

    // Références pour afficher les messages
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Réinitialiser les messages
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // Validation des champs
    if (!username || !email || !password || !confirmPassword || !role) {
        errorMessage.textContent = 'Tous les champs sont requis.';
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Les mots de passe ne correspondent pas.';
        return;
    }

    try {
        // Envoyer les données d'inscription au serveur
        const response = await fetch('/data/signup.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });

        if (response.ok) {
            successMessage.textContent = 'Inscription réussie ! Redirection...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (response.status === 409) {
            errorMessage.textContent = 'Cet email est déjà utilisé.';
        } else {
            throw new Error('Une erreur est survenue lors de l’inscription.');
        }
    } catch (error) {
        console.error('Erreur:', error.message);
        errorMessage.textContent = 'Impossible de traiter la demande. Veuillez réessayer plus tard.';
    }
});
