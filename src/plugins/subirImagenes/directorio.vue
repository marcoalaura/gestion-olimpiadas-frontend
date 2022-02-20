<template>
  <div class="imagenes">
    <ul>
      <li v-for="(c, i) in carpetas" v-bind:key="i">
        <div class="item" :title="c.nombre" @click="seleccionarDir(c, i)">
          <v-icon-component icon="folder"></v-icon-component>
          <!-- <div style="height:11px; font-size:8px;"></div> -->
          <a>{{ recortar(c.nombre) }} /</a>
        </div>
        <directorio :carpetas="c.carpetas" :profundidad="profundidad + 1" :actualizarRuta="actualizarRuta"></directorio>
      </li>
    </ul>
  </div>
</template>
<script>
// import Directorio from './directorio.vue';
import vIconComponent from '@/plugins/icon/index.vue';

export default {
  name: 'directorio',
  props: {
    carpetas: {},
    actualizarRuta: {},
    profundidad: Number,
  },
  components: {
    vIconComponent,
  },
  data() {
    return {
    };
  },
  mounted() {
  },
  methods: {
    recortar(text) {
      if (text.length < 16) return text;
      return `${text.substr(0, 16)}...`;
    },
    recortarTitle(text) {
      if (text.length >= 16) return text;
      return null;
    },
    seleccionarDir(dir, i) {
      Object.assign(this.carpetas[i], dir);
      this.actualizarRuta(dir, i, this.profundidad);
      // this.carpetas = this.carpetas.map(c => c);
      // this.$emit('carpetas', this.carpetas.map(c => c));
    }
  }
};
</script>
<style lang="scss">
  .imagenes {
    ul {
      list-style: none;
      padding-left: 16px;
      >li {
        border-left: dashed 1px;
      }
      a {
        line-height: 36px;
        text-decoration: none;
        vertical-align: top;
        margin-left: 4px;
      }
    }
  }
</style>
