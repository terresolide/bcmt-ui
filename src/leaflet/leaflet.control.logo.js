 import bcmt from '@/assets/images/bcmt.png'
 import formaterre from '@/assets/images/formater.png'
L.Control.logo = L.Control.extend({
    options: {
        position: 'bottomleft'
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },
    _mode: 'formaterre',
    initialize (mode, options) {
        L.Control.prototype.initialize.call(this, options)
        if (mode) {
            this._mode = mode
        }
    },
    onAdd: function (map) {
      
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control logo-control');
        var button = L.DomUtil.create('a', '', container);
        button.setAttribute('target', '_blank')
        if (this.mode === 'bcmt') {
            button.setAttribute('href', 'https://www.bcmt.fr')
            button.innerHTML = '<img width="100%" class="logo-control-img" src="' + bcmt + '"> ';
            L.DomEvent.disableClickPropagation(button);
            container.title = "Data from BCMT";
        } else {
           button.setAttribute('href', 'https://www.poleterresolide.fr')
           button.innerHTML = '<img width="100%" class="logo-control-img" src="' + formaterre + '"> ';
           L.DomEvent.disableClickPropagation(button);
           container.title = "Developped by FormaTerre";
        }
        return container;
    },
});

