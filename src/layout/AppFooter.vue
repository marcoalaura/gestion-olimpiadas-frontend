<template>
  <v-footer
    :fixed="!['xs', 'sm'].includes($vuetify.breakpoint.name)"
    :absolute="['xs', 'sm'].includes($vuetify.breakpoint.name)"
    height="80"
    :inset="inset"
    app
    tile
    color="backgroundColor"
    padless
    class="primary--text d-flex flex-row align-center justify-space-between pr-5"
  >

    <v-card
      elevation="0"
      class="listado d-flex flex-row align-end justify-space-between"
    >
      <v-btn
        color="error"
        class="banner--entorno"
        dark elevation="0" x-small
        v-if="!['PROD', 'PRODUCTION', 'PRODUCCION'].includes(enviroment) && enviroment.length > 0"
        @click="info()">
        {{ enviroment }}
      </v-btn>
      <transition name="fade" mode="out-in">
      </transition>
    </v-card>
    <v-card elevation="0" width="100px">
      <v-img
        v-if="this.$vuetify.theme.dark"
        src="./img/logoAgeticBalanco.png"
        max-width="100"
      />
      <v-img v-else src="./img/logoAgetic.png" max-width="100"/>
    </v-card>
  </v-footer>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    fixed: false,
    inset: true,
    infoCI: {},
    html: '',
    enviroment: ''
  }),
  mounted() {
    this.$nextTick(async () => {
      if (!['development', 'develop'].includes(process.env.NODE_ENV)) await this.handleShowDeployCI();
      this.enviroment = process.env.VUE_APP_ENVIROMENT;
    });
  },
  methods: {
    async handleShowDeployCI() {
      try {
        this.infoCI = await axios.get(process.env.VUE_APP_ESTADO_CI);
        this.infoCI = this.infoCI && this.infoCI.data ? this.infoCI.data : {};
        this.html = `
          <div class="pa-2 fontColor--text text-left d-flex flex-column user--select">
            <div><span class="warning--text">Estado: </span> ${this.infoCI.estado}</div>
            <div><span class="warning--text">Commit SHA: </span> ${this.infoCI.commit_sha}</div>
            <div><span class="warning--text">Mensaje: </span>${this.infoCI.mensaje}</div>
            <div><span class="warning--text">Branch: </span>${this.infoCI.branch}</div>
          </div>
        `;
      } catch (err) {
        this.$message.error(err.message || 'Ocurrio un error al tratar de solicitar el estado');
      }
    },
    info() {
      this.$alert(`Usted esta usando el entorno de ${this.enviroment} <br/>${this.html}`, () => {
      });
    }
  }
};
</script>
<style lang="scss">
@import "../scss/variables.scss";

.banner--entorno {
  margin: 20px;
}

</style>
