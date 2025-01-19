document.addEventListener('DOMContentLoaded', async function () {
  const usernameElement = document.getElementById('username');
  const cityElement = document.getElementById('city');
  const addressElement = document.getElementById('address');
  const postalCodeElement = document.getElementById('postalCode');
  const phoneElement = document.getElementById('phone');
  const emailElement = document.getElementById('email');
  const roleElement = document.getElementById('role');
  const profileImage = document.getElementById('profileImage');

  // Fonction pour récupérer l'utilisateur connecté
  async function getLoggedUser() {
      // Simuler la récupération des données de connexion (remplacer par une vraie méthode de connexion)
      const loginResponse = await fetch('/data/login.json');
      const loginData = await loginResponse.json();
      
      // Supposons que l'utilisateur est le premier utilisateur connecté pour cet exemple
      return loginData.find(user => user.username === 'mehdi@admin.com' && user.password === 'chmiti');
  }

  // Récupérer les informations de l'utilisateur
  const loggedUser = await getLoggedUser();
  if (!loggedUser) {
      alert('Utilisateur non connecté.');
      return;
  }

  try {
      // Charger les données du profil
      const response = await fetch('/data/profile.json');
      const profileData = await response.json();

      // Trouver les données correspondant à l'utilisateur connecté
      if (profileData.email === loggedUser.username) {
          usernameElement.textContent = `${profileData.nom} ${profileData.prenom}`;
          cityElement.textContent = profileData.ville;
          addressElement.textContent = profileData.adresse;
          postalCodeElement.textContent = profileData.codePostal;
          phoneElement.textContent = profileData.telephone;
          emailElement.textContent = profileData.email;
          roleElement.textContent = loggedUser.role === 'admin' ? 'Admin' : 'Étudiant';
          profileImage.src = profileData.photo || 'photo/emsi.jpeg';
      }
  } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la récupération des informations de profil.');
  }

  
});
