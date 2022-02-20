<template>
  <div>
    <ul>
      <li>
        <div class="item" :title="archivo.nombre" @click="obtenerImagen(archivo)" tabindex="2">
          <v-icon-component icon="image"></v-icon-component>
          <a><div class="filename">{{ archivo.nombre }}</div></a>
          <div class="fileinfo">{{ calcularTamano(archivo) }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
// import Directorio from './directorio.vue';
import vIconComponent from '@/plugins/icon/index.vue';

export default {
  name: 'archivo',
  props: {
    archivo: {
      default: {},
    },
    ruta: {
      default: '',
    }
  },
  components: {
    vIconComponent,
  },
  data() {
    return {
      maxLength: 20,
    };
  },
  methods: {
    recortar(text, obj) {
      let autoMax = 0;
      if (obj && obj.clientWidth) autoMax = obj.clientWidth / 10;
      if (text.length < (autoMax || this.maxLength)) return text;
      return `${text.substr(0, autoMax || this.maxLength)}...`;
    },
    calcularTamano(archivo) {
      let unidad = 'Bytes';
      let { tamano } = archivo;
      if (tamano >= 1000) {
        tamano = (tamano / 1000).toFixed(2);
        unidad = 'KB';
      }
      if (tamano >= 1000) {
        tamano = (tamano / 1000).toFixed(2);
        unidad = 'MB';
      }
      return `${tamano} ${unidad}` || '...';
    },
    obtenerImagen(archivo) {
      if (this.$parent && this.$parent.$refs && this.$parent.$refs.vistaPrevia) {
        let ruta = archivo.nombre;
        if (this.ruta) {
          ruta = `${this.ruta.join('/')}/${ruta}`;
        }
        this.$parent.$refs.vistaPrevia.src = `${process.env.VUE_APP_SERVER_MEDIA}${ruta}`;
        this.$parent.archivoSeleccionado = archivo;
      }
    },
  },
};
</script>
<style lang="scss">
  .archivos {
    ul {
      list-style: none;
      padding-left: 16px;
      i {
        float: left;
      }
      a {
        line-height: 16px;
        text-decoration: none;
        vertical-align: top;
      }
      div.filename {
        margin-left: 34px;
        margin-right: 8px;
      }
      div.fileinfo {
        font-size: 10px;
        margin-top: -4px;
        margin-left: 34px;
        margin-bottom: 8px;
      }
      div.item:active {
        background-color: beige;
      }
      div.item:focus {
        background-color: #ddd;
      }
    }
  }
</style>
