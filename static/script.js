// static/script.js
document.addEventListener('DOMContentLoaded', function () {
    // Sélectionne le conteneur de la carte
    const mapContainer = d3.select("#map-container");
    // Dimensions de la carte
    const width = mapContainer.node().getBoundingClientRect().width;
    const height = mapContainer.node().getBoundingClientRect().height;

    // Crée l'élément SVG pour la carte
    const svg = mapContainer.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Définit la projection Mercator pour la carte
    const projection = d3.geoMercator()
        .scale(width / (2 * Math.PI)) // Échelle initiale basée sur la largeur
        .translate([width / 2, height / 1.5]); // Centre la carte

    // Crée un générateur de chemin pour dessiner les pays
    const path = d3.geoPath().projection(projection);

    // Charge les données GeoJSON des pays et les données personnalisées
    Promise.all([
        d3.json("/static/world.geojson"), // Fichier GeoJSON des pays
        d3.json("/static/country_data.json") // Données mock personnalisées
    ]).then(function (data) {
        const world = data[0]; // Données GeoJSON
        const countryData = data[1]; // Données personnalisées

        // Fonction pour obtenir la couleur basée sur l'idéologie
        function getColor(ideology) {
            switch (ideology) {
                case "Left-leaning":
                    return "rgb(255, 100, 100)"; // Rouge légèrement clair
                case "Right-leaning":
                    return "rgb(0, 0, 139)"; // Bleu marine foncé
                case "Centrist":
                    return "rgb(233, 230, 89)"; // Gris clair
                default:
                    return "rgb(200, 200, 200)"; // Gris par défaut pour inconnu
            }
        }

        // Dessine les pays sur la carte
        svg.selectAll("path")
            .data(world.features) // Lie les données GeoJSON aux éléments path
            .enter().append("path")
            .attr("d", path) // Définit l'attribut 'd' du chemin
            .attr("class", d => {
                // Récupère l'ID du pays (ISO A3)
                const countryId = d.properties.ISO_3A;
                // Récupère les données personnalisées pour ce pays
                const data = countryData[countryId];
                // Applique la classe CSS en fonction de l'idéologie
                if (data && data.ideology) {
                    return `ideology-${data.ideology.toLowerCase().replace(/\s+/g, '-')}`;
                }
                return "ideology-unknown"; // Classe par défaut
            })
            .on("click", function (event, d) {
                // Gère l'événement de clic sur un pays
                const countryId = d.properties.ISO_3A; // ID du pays
                const infoBox = document.getElementById("country-info");
                const infoName = document.getElementById("info-name");
                const infoCapital = document.getElementById("info-capital");
                const infoRulingParty = document.getElementById("info-ruling-party");
                const infoGdp = document.getElementById("info-gdp");

                // Récupère les données personnalisées pour le pays cliqué
                const data = countryData[countryId];

                if (data) {
                    // Met à jour la boîte d'information avec les données du pays
                    infoName.textContent = data.name || "N/A";
                    infoCapital.textContent = data.capital || "N/A";
                    infoRulingParty.textContent = data.ruling_party || "N/A";
                    infoGdp.textContent = data.gdp || "N/A";
                } else {
                    // Si aucune donnée n'est disponible, affiche N/A
                    infoName.textContent = d.properties.NAME || "N/A"; // Utilise le nom du GeoJSON si pas de données personnalisées
                    infoCapital.textContent = "N/A";
                    infoRulingParty.textContent = "N/A";
                    infoGdp.textContent = "N/A";
                }
            });

        // Gère le redimensionnement de la fenêtre pour la réactivité de la carte
        window.addEventListener('resize', function () {
            const newWidth = mapContainer.node().getBoundingClientRect().width;
            const newHeight = mapContainer.node().getBoundingClientRect().height;

            // Met à jour la viewBox du SVG
            svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);

            // Met à jour la projection et redessine les chemins
            projection.scale(newWidth / (2 * Math.PI))
                .translate([newWidth / 2, newHeight / 1.5]);
            svg.selectAll("path").attr("d", path);
        });

    }).catch(function (error) {
        console.error("Erreur lors du chargement des données :", error);
        // Afficher un message d'erreur à l'utilisateur si nécessaire
        const infoBox = document.getElementById("country-info");
        infoBox.innerHTML = "<h2>Erreur de chargement</h2><p>Impossible de charger les données de la carte. Veuillez vérifier les fichiers GeoJSON et JSON.</p>";
    });
});
