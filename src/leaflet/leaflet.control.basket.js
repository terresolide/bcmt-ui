import {useStore} from 'vuex'
L.Control.Basket = L.Control.extend({
    options: {
        position: 'topright',
    },
    initialize: function(idLarge, options){
      
    },
  
    onAdd : function(map){
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control lfh-control-basket');
        var a = L.DomUtil.create('a', 'icon-palette')
        a.setAttribute('title', 'Basket')
        container.appendChild(a)
        container.onclick = function(){
          if (this.className.indexOf('expand') >= 0){
            this.classList.remove('expand')
          }else {
            this.classList.add('expand')
          }
        }
        return container;
    }
})
