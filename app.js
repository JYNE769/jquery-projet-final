$(document).ready(function () {
  //Initialisation du localStorage

  const KEY_ETUDIANT = "jqueryEtudiants";

  //lire le tableau
  function getEtudiants() {
    const data = localStorage.getItem(KEY_ETUDIANT);
    return data ? JSON.parse(data) : [];
  }

  // Enregistrer les etudiants dans le localStorage
  function saveEtudiants(tableauEtudiants) {
    localStorage.setItem(KEY_ETUDIANT, JSON.stringify(tableauEtudiants));
  }

  // Generer un identifiant unique
  function genererID() {
    return Date.now().toString();
  }

  function AfficherEtudiants() {
    // Vider les donnees presentes dans la UL
    $("ul#liste-etudiants").empty();

    let etudiants = getEtudiants();

    if (etudiants.length === 0) {
      const empty = $(`
                <div id="empty">
                    <p >Aucun étudiant</p>
                    <p>Ajoutez un étudiant pour commencer.</p>
                </div>
            `);
      $("ul#liste-etudiants").append(empty);
    } else {
      // Generer un LI par etudiants
      $.each(etudiants, function (index, etudiant) {
        let classeNote = "";

        if (etudiant.note < 10) {
          classeNote = "echoue";
        } else if (etudiant.note < 15) {
          classeNote = "moyen";
        } else {
          classeNote = "admis";
        }

        const li = $(`
        <li data-id="${etudiant.id}" class="${classeNote}">
            <div>
                <strong>${etudiant.nom} ${etudiant.prenom}</strong>
                <span> - ${etudiant.note}/20</span>
            </div>

            <div>
                <button class="btn-modifier">
                    Modifier
                </button>

                <button class="btn-supprimer">
                    Supprimer
                </button>
            </div>
        </li>
    `);

        $("ul#liste-etudiants").append(li);
      });
    }
  }

  // Fonction pour mettre à jour les statistiques
  function mettreAJourStats() {
    const etudiants = getEtudiants();

    const total = etudiants.length;

    const admis = etudiants.filter((e) => e.note >= 10).length;

    const echoues = etudiants.filter((e) => e.note < 10).length;

    let moyenne = 0;

    if (total > 0) {
      let somme = 0;

      etudiants.forEach(function (e) {
        somme += Number(e.note);
      });

      moyenne = (somme / total).toFixed(2);
    }

    $("#stats").html(`
        <p>Total : ${total}</p>
        <p>Admis : ${admis}</p>
        <p>Échoués : ${echoues}</p>
        <p>Moyenne : ${moyenne}/20</p>
    `);
  }

  // Ajouter un étudiant
  $("#btn-ajouter").click(function () {
    const nom = $("#nom").val().trim();
    const prenom = $("#prenom").val().trim();
    const note = parseFloat($("#note").val());

    if (nom === "" || prenom === "" || isNaN(note)) {
      $("#erreur").text("Veuillez remplir tous les champs.").show();
      return;
    }

    if (note < 0 || note > 20) {
      $("#erreur").text("La note doit être comprise entre 0 et 20.").show();
      return;
    }

    let etudiants = getEtudiants();

    // MODE MODIFICATION
    if (idModification !== null) {
      const index = etudiants.findIndex((e) => e.id === idModification);

      if (index !== -1) {
        etudiants[index].nom = nom;
        etudiants[index].prenom = prenom;
        etudiants[index].note = note;
      }
      const existe = etudiants.some(
        (e) => e.id !== idModification && e.nom === nom && e.prenom === prenom,
      );

      if (existe) {
        $("#erreur").text("Cet étudiant existe déjà.").show();
        return;
      }

      saveEtudiants(etudiants);

      idModification = null;

      $("#btn-ajouter").text("Ajouter");
    }

    // MODE AJOUT
    else {
      const existe = etudiants.some(
        (e) => e.nom === nom && e.prenom === prenom,
      );

      if (existe) {
        $("#erreur").text("Cet étudiant existe déjà.").show();
        return;
      }

      etudiants.push({
        id: genererID(),
        nom,
        prenom,
        note,
      });

      saveEtudiants(etudiants);
    }

    $("#nom").val("");
    $("#prenom").val("");
    $("#note").val("");

    $("#erreur").hide();

    AfficherEtudiants();
    mettreAJourStats();
  });

  // Suppression d'une note
  $("#liste-etudiants").on("click", ".btn-supprimer", function () {
    const id = $(this).closest("li").data("id").toString();

    let etudiants = getEtudiants();
    etudiants = etudiants.filter(function (e) {
      return e.id !== id;
    });

    saveEtudiants(etudiants);
    mettreAJourStats();
    AfficherEtudiants();
  });

  // Modification d'une note
  let idModification = null;

  $("#liste-etudiants").on("click", ".btn-modifier", function () {
    const id = $(this).closest("li").data("id").toString();

    const etudiants = getEtudiants();

    const etudiant = etudiants.find((e) => e.id === id);

    if (!etudiant) return;

    $("#nom").val(etudiant.nom);
    $("#prenom").val(etudiant.prenom);
    $("#note").val(etudiant.note);

    idModification = id;

    $("#erreur").hide();
    $("#btn-ajouter").text("Enregistrer les modifications");
  });

  // Tout effacer
  $("#btn-tout-effacer").click(function () {
    saveEtudiants([]);

    AfficherEtudiants();
    mettreAJourStats();
  });

  // Initialisation
  AfficherEtudiants();
  mettreAJourStats();
});
