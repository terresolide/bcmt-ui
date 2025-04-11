
L.Control.logo = L.Control.extend({
    options: {
        position: 'bottomleft'
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },
    _mode: 'formaterre',
    _url: null,
    initialize (mode, url, options) {
        L.Control.prototype.initialize.call(this, options)
        if (mode) {
            this._mode = mode
        }
        if (url) {
            this._url = url
        }
    },
    onAdd: function (map) {
      
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control logo-control');
        var button = L.DomUtil.create('a', '', container);
        button.setAttribute('target', '_blank')
        if (this._mode === 'bcmt') {
            button.setAttribute('href', 'https://www.bcmt.fr')
            button.setAttribute('class', 'bcmt-logo')
            button.innerHTML = '<img width="100%" class="logo-control-img" src="' + this._url + '"> <span>Data from BCMT</span>';
            L.DomEvent.disableClickPropagation(button);
            container.title = "Data from BCMT";
        } else {
           button.setAttribute('href', 'https://www.poleterresolide.fr')
           button.innerHTML = '<img width="100%" class="logo-control-img" src="' + this._url + '"> <span>Developped by<br>FormaTerre</span>';
           L.DomEvent.disableClickPropagation(button);
           container.title = "Developped by FormaTerre";
        }
        return container;
    },
});

