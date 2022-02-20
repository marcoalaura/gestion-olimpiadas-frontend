<template>
  <v-card elevation="0">
    <app-dialog
      :dialog="modal"
      titulo="Información"
      @open-dialog="modal = true"
      @close-dialog="modal = false"
      max-width="600"
      icono="info"
      :mostrar-acciones=false
    >
      <v-container>
        <v-timeline align-top dense>
          <v-timeline-item
            v-for="(estado, i) in estados"
            :key="i"
            :color="i < indexEstado ? 'green' : 'primary'"
            :small="i == indexEstado? false: true"
            :icon="i < indexEstado ? 'task_alt' : i == indexEstado ? 'arrow_right_alt' : 'null'"
          >
            <v-row class="pt-1">
              <v-col>
                <strong :class="i < indexEstado ? 'green--text' : i == indexEstado ? 'actual primary--text' : 'primary--text'">{{ estado.nombre }}<strong v-if="i == indexEstado"> (Estado actual)</strong></strong>
                <div class="text-caption">
                  {{ estado.descripcion }}
                </div>
              </v-col>
            </v-row>
          </v-timeline-item>
        </v-timeline>
      </v-container>
    </app-dialog>
  </v-card>
</template>
<script>
import AppDialog from '@/plugins/modal/AppDialog.vue';
import estados from '@/common/estados.json';

export default {
  components: {
    AppDialog,
  },
  props: {
    dialog: {
      default: true,
    },
    estado: {},
  },
  data: () => ({
    modal: false,
    estados: estados,
    indexEstado: null,
  }),
  watch: {
    async dialog() {
      this.indexEstado = this.estados.findIndex((x) => x.bd === this.estado);
      this.modal = true;
    },
  },
};
</script>
<style scoped>
 .actual {
     font-size: 120%
 };
</style>
