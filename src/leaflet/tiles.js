export default {
    osm: {
      name: 'OpenStreetMap',
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    },
    osmFr: {
      name: 'OpenStreetMap France',
      url: '//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      attribution: 'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>'
    },
    opentopomap: {
      name: 'OpenStreetMap Topo',
      url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: © <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    },
    arcgisTopo: {
      name: 'ArcGIS World Topo Map',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
    },
    arcgisSatellite: {
      name: 'ArcGIS Satellite Tiles',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">Arcgis</a>'
    } /*,
    arcgisRelief: {
      name: 'ArcGIS Relief Tiles',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer">Arcgis</a>'
    } */
}